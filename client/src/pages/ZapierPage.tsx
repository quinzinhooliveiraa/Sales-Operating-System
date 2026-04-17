import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Copy,
  RefreshCw,
  Zap,
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  ExternalLink,
  ChevronRight,
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

function CopyField({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast({ title: "Copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <div
          className={`flex-1 bg-secondary/50 border rounded-md px-3 py-2 text-sm truncate ${mono ? "font-mono" : ""}`}
          data-testid={`field-${label.toLowerCase().replace(/\s/g, "-")}`}
        >
          {value}
        </div>
        <Button size="icon" variant="outline" onClick={copy} data-testid="button-copy">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

export default function ZapierPage() {
  const { toast } = useToast();
  const baseUrl = window.location.origin;

  const { data: config, isLoading } = useQuery<ZapierConfig>({
    queryKey: ["/api/zapier/config"],
  });

  const [webhooks, setWebhooks] = useState({
    newLead: "",
    stageChange: "",
    taskCompleted: "",
    newTask: "",
  });

  useEffect(() => {
    if (config?.webhookUrls) {
      setWebhooks(config.webhookUrls);
    }
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
      toast({ title: "Configuração salva", description: "Webhooks do Zapier atualizados." });
    },
  });

  const rotateKey = useMutation({
    mutationFn: () =>
      fetch("/api/zapier/rotate-key", { method: "POST" }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zapier/config"] });
      toast({ title: "Chave renovada", description: "Nova API Key gerada com sucesso." });
    },
  });

  const testWebhook = useMutation({
    mutationFn: (event: string) =>
      fetch("/api/zapier/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          payload: {
            id: 999,
            name: "Lead de Teste",
            email: "teste@exemplo.com",
            company: "Empresa Exemplo",
            stage: "Novo Lead",
            value: "R$ 5.000",
            timestamp: new Date().toISOString(),
          },
        }),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.sent) {
        toast({ title: "Webhook enviado!", description: "Evento de teste disparado com sucesso." });
      } else {
        toast({
          title: "Webhook não configurado",
          description: "Configure a URL do webhook acima antes de testar.",
          variant: "destructive",
        });
      }
    },
  });

  const outboundEvents = [
    {
      key: "newLead",
      label: "Novo Lead",
      event: "new_lead",
      description: "Disparado quando um novo lead é criado no CRM",
    },
    {
      key: "stageChange",
      label: "Mudança de Etapa",
      event: "stage_change",
      description: "Disparado quando um lead muda de etapa no pipeline",
    },
    {
      key: "taskCompleted",
      label: "Tarefa Concluída",
      event: "task_completed",
      description: "Disparado quando uma tarefa é marcada como concluída",
    },
    {
      key: "newTask",
      label: "Nova Tarefa",
      event: "new_task",
      description: "Disparado quando uma nova tarefa é criada",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-orange-500/10 flex items-center justify-center">
          <Zap className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-xl font-semibold font-heading">Integração com Zapier</h1>
          <p className="text-sm text-muted-foreground">
            Conecte o Olivar OS a mais de 7.000 apps via Zapier
          </p>
        </div>
        <a
          href="https://zapier.com/apps/webhooks"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto"
        >
          <Button variant="outline" size="sm" data-testid="button-open-zapier">
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Zapier
          </Button>
        </a>
      </div>

      {/* Como funciona */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {[
            { step: "1", title: "Copie a API Key", desc: "Use a chave abaixo para autenticar chamadas do Zapier" },
            { step: "2", title: "Crie um Zap", desc: 'Use "Webhooks by Zapier" como trigger ou action' },
            { step: "3", title: "Cole as URLs", desc: "Cole as URLs dos webhooks do Zapier nos campos abaixo" },
          ].map((s) => (
            <div key={s.step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold flex items-center justify-center shrink-0">
                {s.step}
              </div>
              <div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Autenticação */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Autenticação (Zapier → Olivar OS)</CardTitle>
            </div>
            <CardDescription>
              Use esta chave no header <code className="text-xs bg-secondary px-1 rounded">X-API-Key</code> ao chamar a API do Olivar OS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CopyField label="API Key" value={config?.apiKey ?? ""} />

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Endpoints disponíveis</p>
              <div className="space-y-2">
                {[
                  { method: "POST", path: "/api/zapier/inbound/lead", desc: "Criar lead via Zapier" },
                  { method: "POST", path: "/api/zapier/inbound/task", desc: "Criar tarefa via Zapier" },
                  { method: "GET", path: "/api/zapier/leads", desc: "Listar leads (polling)" },
                ].map((ep) => (
                  <div key={ep.path} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {ep.method}
                    </Badge>
                    <code className="font-mono text-muted-foreground truncate">{baseUrl}{ep.path}</code>
                  </div>
                ))}
              </div>
            </div>

            <CopyField
              label="URL base da API"
              value={`${baseUrl}/api/zapier`}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => rotateKey.mutate()}
              disabled={rotateKey.isPending}
              className="w-full"
              data-testid="button-rotate-key"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {rotateKey.isPending ? "Renovando..." : "Renovar API Key"}
            </Button>
          </CardContent>
        </Card>

        {/* Outbound webhooks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Eventos (Olivar OS → Zapier)</CardTitle>
            </div>
            <CardDescription>
              Cole as URLs de webhooks do Zapier para receber eventos em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {outboundEvents.map((ev) => (
              <div key={ev.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">
                    {ev.label}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => testWebhook.mutate(ev.event)}
                    disabled={testWebhook.isPending}
                    data-testid={`button-test-${ev.key}`}
                  >
                    Testar
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{ev.description}</p>
                <Input
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={webhooks[ev.key as keyof typeof webhooks]}
                  onChange={(e) =>
                    setWebhooks((prev) => ({ ...prev, [ev.key]: e.target.value }))
                  }
                  className="text-xs font-mono"
                  data-testid={`input-webhook-${ev.key}`}
                />
              </div>
            ))}

            <Button
              className="w-full"
              onClick={() => saveConfig.mutate()}
              disabled={saveConfig.isPending}
              data-testid="button-save-webhooks"
            >
              {saveConfig.isPending ? "Salvando..." : "Salvar webhooks"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Exemplos de payload */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Exemplo de payload enviado ao Zapier</CardTitle>
          <CardDescription>Todos os eventos enviam este formato JSON</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-secondary/50 rounded-md p-4 overflow-x-auto text-muted-foreground">
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
        </CardContent>
      </Card>
    </div>
  );
}
