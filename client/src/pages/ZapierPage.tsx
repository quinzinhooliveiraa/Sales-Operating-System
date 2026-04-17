import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Copy, RefreshCw, Zap, Check, ExternalLink,
  UserPlus, ArrowRightLeft, CheckSquare, Plus,
  ArrowRight, Info, ChevronDown, ChevronUp,
} from "lucide-react";

type ZapierConfig = {
  apiKey: string;
  webhookUrls: {
    newLead: string;
    stageChange: string;
    taskCompleted: string;
    newTask: string;
  };
};

function CopyButton({ value }: { value: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast({ title: "Copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button size="icon" variant="outline" onClick={copy} data-testid="button-copy">
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

function CopyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex gap-2">
        <div className="flex-1 bg-secondary/50 border rounded-md px-3 py-2 text-sm font-mono truncate select-all">
          {value}
        </div>
        <CopyButton value={value} />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const AUTOMATION_IDEAS = [
  {
    icon: UserPlus,
    title: "Lead do Google Forms",
    desc: "Alguém preenche um formulário → aparece automaticamente no seu Pipeline",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: ArrowRightLeft,
    title: "Lead novo no WhatsApp",
    desc: "Um lead entra no CRM → você recebe uma mensagem no WhatsApp Business",
    color: "text-green-500 bg-green-500/10",
  },
  {
    icon: CheckSquare,
    title: "Tarefa concluída no Slack",
    desc: "Uma tarefa é marcada como feita → o time recebe uma notificação no Slack",
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    icon: Plus,
    title: "Lead da planilha Google",
    desc: "Uma nova linha entra na planilha → lead criado no CRM automaticamente",
    color: "text-orange-500 bg-orange-500/10",
  },
];

const OUTBOUND_EVENTS = [
  { key: "newLead", label: "Quando um lead é criado", event: "new_lead", icon: UserPlus },
  { key: "stageChange", label: "Quando um lead muda de etapa", event: "stage_change", icon: ArrowRightLeft },
  { key: "taskCompleted", label: "Quando uma tarefa é concluída", event: "task_completed", icon: CheckSquare },
  { key: "newTask", label: "Quando uma tarefa é criada", event: "new_task", icon: Plus },
];

export default function ZapierPage() {
  const { toast } = useToast();
  const baseUrl = window.location.origin;
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [webhooks, setWebhooks] = useState({ newLead: "", stageChange: "", taskCompleted: "", newTask: "" });
  const [activeTest, setActiveTest] = useState<string | null>(null);

  const { data: config, isLoading } = useQuery<ZapierConfig>({ queryKey: ["/api/zapier/config"] });

  useEffect(() => {
    if (config?.webhookUrls) setWebhooks(config.webhookUrls);
  }, [config]);

  const saveConfig = useMutation({
    mutationFn: () =>
      fetch("/api/zapier/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrls: webhooks }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zapier/config"] });
      toast({ title: "Salvo!", description: "Automações atualizadas com sucesso." });
    },
  });

  const rotateKey = useMutation({
    mutationFn: () => fetch("/api/zapier/rotate-key", { method: "POST" }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zapier/config"] });
      toast({ title: "Chave renovada!" });
    },
  });

  const testWebhook = useMutation({
    mutationFn: (event: string) =>
      fetch("/api/zapier/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          payload: { id: 999, name: "Lead de Teste", email: "teste@exemplo.com", company: "Empresa Exemplo", stage: "Novo Lead", value: "R$ 5.000", timestamp: new Date().toISOString() },
        }),
      }).then((r) => r.json()),
    onSuccess: (data, event) => {
      setActiveTest(null);
      if (data.sent) {
        toast({ title: "Teste enviado!", description: "Verifique o seu Zap para confirmar o recebimento." });
      } else {
        toast({ title: "URL não configurada", description: "Cole a URL do Zapier no campo antes de testar.", variant: "destructive" });
      }
    },
  });

  const connectedCount = Object.values(webhooks).filter(Boolean).length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Carregando...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-orange-500/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold font-heading">Automações com Zapier</h1>
            <p className="text-sm text-muted-foreground">Conecte o Olivar OS a outros apps sem precisar de código</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connectedCount > 0 && (
            <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10" data-testid="badge-connected-count">
              {connectedCount} ativa{connectedCount > 1 ? "s" : ""}
            </Badge>
          )}
          <a href="https://zapier.com/apps/webhooks" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" data-testid="button-open-zapier">
              <ExternalLink className="h-4 w-4 mr-2" /> Abrir Zapier
            </Button>
          </a>
        </div>
      </div>

      {/* Ideias de automação */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">O que você pode automatizar</CardTitle>
          <CardDescription>Exemplos do que é possível conectar com o Zapier</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {AUTOMATION_IDEAS.map((idea) => (
            <div key={idea.title} className="flex items-start gap-3 p-3 rounded-md bg-secondary/30">
              <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${idea.color}`}>
                <idea.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{idea.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{idea.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Passo a passo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Como configurar em 3 passos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Passo 1 */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold flex items-center justify-center shrink-0">1</div>
              <div className="w-px flex-1 bg-border mt-2" />
            </div>
            <div className="pb-4 flex-1 space-y-3">
              <div>
                <p className="text-sm font-medium">Copie a sua chave de acesso</p>
                <p className="text-xs text-muted-foreground mt-0.5">Use no Zapier para autenticar</p>
              </div>
              <CopyField
                label="Chave de acesso (API Key)"
                value={config?.apiKey ?? ""}
                hint="Cole este valor no campo 'X-API-Key' do Zapier"
              />
              <Button variant="ghost" size="sm" onClick={() => rotateKey.mutate()} disabled={rotateKey.isPending} data-testid="button-rotate-key" className="text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3 mr-1.5" />
                {rotateKey.isPending ? "Renovando..." : "Gerar nova chave"}
              </Button>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold flex items-center justify-center shrink-0">2</div>
              <div className="w-px flex-1 bg-border mt-2" />
            </div>
            <div className="pb-4 flex-1 space-y-3">
              <div>
                <p className="text-sm font-medium">Crie um Zap no Zapier</p>
                <p className="text-xs text-muted-foreground mt-0.5">Escolha "Webhooks by Zapier" como gatilho ou ação</p>
              </div>
              <a href="https://zapier.com/apps/webhooks/integrations" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" data-testid="button-create-zap">
                  Criar Zap <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </a>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold flex items-center justify-center shrink-0">3</div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm font-medium">Cole as URLs das suas automações</p>
                <p className="text-xs text-muted-foreground mt-0.5">Para cada evento que quiser monitorar, cole a URL gerada pelo Zapier</p>
              </div>
              {OUTBOUND_EVENTS.map((ev) => {
                const val = webhooks[ev.key as keyof typeof webhooks];
                const isConfigured = !!val;
                return (
                  <div key={ev.key} className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <ev.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{ev.label}</span>
                        {isConfigured && (
                          <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/5 text-[10px]">
                            ativa
                          </Badge>
                        )}
                      </div>
                      {isConfigured && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => { setActiveTest(ev.event); testWebhook.mutate(ev.event); }}
                          disabled={testWebhook.isPending}
                          data-testid={`button-test-${ev.key}`}
                        >
                          {testWebhook.isPending && activeTest === ev.event ? "Enviando..." : "Testar"}
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="Cole aqui a URL do seu Zap (https://hooks.zapier.com/...)"
                      value={val}
                      onChange={(e) => setWebhooks((prev) => ({ ...prev, [ev.key]: e.target.value }))}
                      className="text-xs font-mono"
                      data-testid={`input-webhook-${ev.key}`}
                    />
                  </div>
                );
              })}
              <Button
                className="w-full"
                onClick={() => saveConfig.mutate()}
                disabled={saveConfig.isPending}
                data-testid="button-save-webhooks"
              >
                {saveConfig.isPending ? "Salvando..." : "Salvar automações"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes técnicos (colapsável) */}
      <button
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
        onClick={() => setShowAdvanced((v) => !v)}
        data-testid="button-toggle-advanced"
      >
        <Info className="h-4 w-4" />
        Ver detalhes técnicos para desenvolvedores
        {showAdvanced ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
      </button>

      {showAdvanced && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Endpoints da API</CardTitle>
            <CardDescription className="text-xs">
              Use o header <code className="bg-secondary px-1 rounded">X-API-Key: sua-chave</code> em todas as chamadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CopyField label="URL base" value={`${baseUrl}/api/zapier`} />
            <div className="space-y-2">
              {[
                { method: "POST", path: "/api/zapier/inbound/lead", desc: "Criar um lead" },
                { method: "POST", path: "/api/zapier/inbound/task", desc: "Criar uma tarefa" },
                { method: "GET", path: "/api/zapier/leads", desc: "Listar leads" },
              ].map((ep) => (
                <div key={ep.path} className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="font-mono text-[10px] shrink-0">{ep.method}</Badge>
                  <code className="text-muted-foreground truncate flex-1">{baseUrl}{ep.path}</code>
                  <span className="text-muted-foreground shrink-0">{ep.desc}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Exemplo de dados enviados pelo Olivar OS ao Zapier:</p>
              <pre className="text-xs bg-secondary/50 rounded-md p-3 overflow-x-auto text-muted-foreground">
{`{
  "event": "new_lead",
  "timestamp": "2026-04-17T22:00:00.000Z",
  "id": 42,
  "name": "João Silva",
  "email": "joao@empresa.com",
  "company": "Empresa Ltda",
  "stage": "Qualificado",
  "value": "R$ 15.000"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
