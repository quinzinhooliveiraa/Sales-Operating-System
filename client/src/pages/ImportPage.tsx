import { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, Download, ChevronRight } from "lucide-react";

type ParsedRow = Record<string, string>;

const LEAD_FIELDS: { key: string; label: string; required?: boolean }[] = [
  { key: "name", label: "Nome", required: true },
  { key: "email", label: "E-mail" },
  { key: "phone", label: "Telefone" },
  { key: "company", label: "Empresa" },
  { key: "value", label: "Valor" },
  { key: "owner", label: "Responsável" },
  { key: "stage", label: "Etapa" },
  { key: "notes", label: "Observações" },
  { key: "tags", label: "Tags (separadas por vírgula)" },
  { key: "score", label: "Score (0-100)" },
  { key: "skip", label: "— Ignorar coluna —" },
];

function parseCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const sep = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(sep).map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const vals = line.split(sep).map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: ParsedRow = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
  return { headers, rows };
}

function guessMapping(header: string): string {
  const h = header.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/nome|name/.test(h)) return "name";
  if (/email|e-mail|mail/.test(h)) return "email";
  if (/tel|fone|phone|celular|whats/.test(h)) return "phone";
  if (/empresa|company|org/.test(h)) return "company";
  if (/valor|value|receita|revenue/.test(h)) return "value";
  if (/dono|owner|resp|vendedor|sales/.test(h)) return "owner";
  if (/etapa|stage|fase|status/.test(h)) return "stage";
  if (/obs|nota|note|comment/.test(h)) return "notes";
  if (/tag|label/.test(h)) return "tags";
  if (/score|pont|rating/.test(h)) return "score";
  return "skip";
}

const SAMPLE_CSV = `Nome,Email,Telefone,Empresa,Valor,Responsável
João Silva,joao@empresa.com,+55 11 99999-9999,Empresa X,R$ 10000,Quinzinho
Maria Souza,maria@startup.io,+55 21 88888-8888,Startup Y,R$ 5000,João
`;

export default function ImportPage() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<"upload" | "map" | "preview" | "done">("upload");
  const [importedCount, setImportedCount] = useState(0);

  const handleFile = useCallback((text: string) => {
    const { headers, rows } = parseCSV(text);
    if (!headers.length) {
      toast({ title: "Arquivo inválido", description: "Não foi possível ler o CSV.", variant: "destructive" });
      return;
    }
    const autoMap: Record<string, string> = {};
    headers.forEach((h) => { autoMap[h] = guessMapping(h); });
    setHeaders(headers);
    setRows(rows);
    setMapping(autoMap);
    setStep("map");
  }, [toast]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleFile(ev.target?.result as string);
    reader.readAsText(file, "UTF-8");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleFile(ev.target?.result as string);
    reader.readAsText(file, "UTF-8");
  };

  const buildLeads = () => {
    return rows.map((row) => {
      const lead: Record<string, any> = {
        name: "", email: "", phone: "", company: "", value: "R$ 0",
        stage: "new", owner: "", notes: "", tags: [], score: 0,
        formResponses: {}, history: [],
      };
      Object.entries(mapping).forEach(([col, field]) => {
        if (field === "skip" || !field) return;
        const val = row[col] ?? "";
        if (field === "tags") lead.tags = val.split(",").map((t) => t.trim()).filter(Boolean);
        else if (field === "score") lead.score = parseInt(val) || 0;
        else lead[field] = val;
      });
      return lead;
    }).filter((l) => l.name);
  };

  const importMutation = useMutation({
    mutationFn: async (leads: any[]) => {
      const res = await fetch("/api/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      setImportedCount(data.count);
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: `${data.count} leads importados com sucesso!` });
    },
    onError: (err: any) => {
      toast({ title: "Erro na importação", description: err.message, variant: "destructive" });
    },
  });

  const previewLeads = buildLeads();
  const hasName = Object.values(mapping).includes("name");

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "modelo-importacao.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setStep("upload"); setHeaders([]); setRows([]); setMapping({});
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
          <Upload className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold font-heading">Importar Leads</h1>
          <p className="text-sm text-muted-foreground">Importe contatos em massa via arquivo CSV ou Excel exportado como CSV</p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadSample} className="ml-auto" data-testid="button-download-sample">
          <Download className="h-4 w-4 mr-2" /> Baixar modelo
        </Button>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(["upload", "map", "preview", "done"] as const).map((s, i) => {
          const labels = ["Upload", "Mapeamento", "Revisão", "Concluído"];
          const active = s === step;
          const done = (["upload", "map", "preview", "done"] as const).indexOf(step) > i;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : done ? "bg-green-500/10 text-green-500" : "text-muted-foreground"}`}>
                {done ? <CheckCircle className="h-3 w-3" /> : <span>{i + 1}</span>}
                {labels[i]}
              </div>
              {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <Card>
          <CardContent className="pt-6">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              data-testid="dropzone-csv"
            >
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">Arraste um arquivo CSV aqui ou clique para selecionar</p>
              <p className="text-xs text-muted-foreground">Suporte a CSV com vírgula ou ponto-e-vírgula, UTF-8</p>
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={onFileChange} data-testid="input-file-upload" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Column Mapping */}
      {step === "map" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mapear colunas</CardTitle>
            <CardDescription>{rows.length} linhas encontradas — defina o que cada coluna representa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              {headers.map((col) => (
                <div key={col} className="flex items-center gap-3">
                  <div className="w-48 text-sm font-medium truncate">{col}</div>
                  <div className="text-muted-foreground text-xs truncate flex-1 bg-secondary/40 rounded px-2 py-1">
                    ex: {rows[0]?.[col] ?? "—"}
                  </div>
                  <div className="w-52">
                    <Select
                      value={mapping[col] ?? "skip"}
                      onValueChange={(v) => setMapping((prev) => ({ ...prev, [col]: v }))}
                    >
                      <SelectTrigger className="h-8 text-xs" data-testid={`select-field-${col}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_FIELDS.map((f) => (
                          <SelectItem key={f.key} value={f.key} className="text-xs">
                            {f.required ? `* ${f.label}` : f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
            {!hasName && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Mapeie pelo menos a coluna "Nome" para continuar
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={reset} data-testid="button-reset-import">Voltar</Button>
              <Button onClick={() => setStep("preview")} disabled={!hasName} data-testid="button-preview-import">
                Revisar {previewLeads.length} leads
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-base">Revisão dos dados</CardTitle>
                <CardDescription>{previewLeads.length} leads serão importados</CardDescription>
              </div>
              <Badge variant="outline" data-testid="badge-import-count">{previewLeads.length} leads</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border overflow-auto max-h-80">
              <table className="w-full text-xs">
                <thead className="bg-secondary/50 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">#</th>
                    <th className="text-left px-3 py-2 font-medium">Nome</th>
                    <th className="text-left px-3 py-2 font-medium">Email</th>
                    <th className="text-left px-3 py-2 font-medium">Empresa</th>
                    <th className="text-left px-3 py-2 font-medium">Valor</th>
                    <th className="text-left px-3 py-2 font-medium">Etapa</th>
                  </tr>
                </thead>
                <tbody>
                  {previewLeads.slice(0, 50).map((lead, i) => (
                    <tr key={i} className="border-t hover-elevate" data-testid={`row-preview-${i}`}>
                      <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-1.5 font-medium">{lead.name || "—"}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{lead.email || "—"}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{lead.company || "—"}</td>
                      <td className="px-3 py-1.5">{lead.value || "—"}</td>
                      <td className="px-3 py-1.5"><Badge variant="outline" className="text-[10px]">{lead.stage || "new"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewLeads.length > 50 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Mostrando 50 de {previewLeads.length} leads
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("map")} data-testid="button-back-to-map">Voltar</Button>
              <Button
                onClick={() => importMutation.mutate(previewLeads)}
                disabled={importMutation.isPending}
                data-testid="button-confirm-import"
              >
                {importMutation.isPending ? `Importando...` : `Importar ${previewLeads.length} leads`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <p className="text-lg font-semibold">{importedCount} leads importados!</p>
              <p className="text-sm text-muted-foreground mt-1">Todos os contatos já estão disponíveis no Pipeline CRM</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={reset} data-testid="button-import-more">
                <Upload className="h-4 w-4 mr-2" /> Importar mais
              </Button>
              <a href="/crm">
                <Button data-testid="button-go-to-crm">Ver no Pipeline</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      {step === "upload" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Dicas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>• O arquivo deve ter uma linha de cabeçalho com os nomes das colunas</li>
              <li>• Separadores suportados: vírgula (,) ou ponto-e-vírgula (;)</li>
              <li>• Tags devem estar separadas por vírgula dentro da célula</li>
              <li>• A coluna "Etapa" deve conter: <code className="bg-secondary px-1 rounded">new</code>, <code className="bg-secondary px-1 rounded">qualified</code>, <code className="bg-secondary px-1 rounded">demo</code>, <code className="bg-secondary px-1 rounded">negotiation</code> ou <code className="bg-secondary px-1 rounded">won</code></li>
              <li>• Máximo recomendado: 5.000 leads por importação</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
