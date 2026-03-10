import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings2, Copy, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SchedulingView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agendamento</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie seus tipos de eventos, formulários e disponibilidade.</p>
        </div>
        <Button className="gap-2 h-9 text-sm">
          <Plus className="w-4 h-4" />
          Novo Evento
        </Button>
      </div>

      <Tabs defaultValue="event-types" className="w-full">
        <TabsList className="grid w-full sm:w-auto grid-cols-3 mb-6 bg-secondary/50 p-1">
          <TabsTrigger value="event-types" className="text-xs">Tipos de Eventos</TabsTrigger>
          <TabsTrigger value="forms" className="text-xs">Formulários de Qualificação</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">Disponibilidade</TabsTrigger>
        </TabsList>
        
        <TabsContent value="event-types" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Call de Descoberta", duration: "30 min", type: "1-a-1" },
              { title: "Demo de Produto", duration: "45 min", type: "1-a-1" },
              { title: "Sessão de Onboarding", duration: "60 min", type: "Grupo" },
            ].map((event, i) => (
              <Card key={i} className="glass overflow-hidden group hover:border-primary/20 transition-all cursor-pointer">
                <CardHeader className="pb-3 px-4 pt-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">{event.title}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <CardDescription className="text-xs">{event.duration} • {event.type}</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="pt-3 flex items-center justify-between border-t border-border/50">
                    <Button variant="link" className="text-foreground p-0 h-auto gap-1 text-xs font-medium hover:text-primary">
                      <Copy className="w-3 h-3" /> Copiar Link
                    </Button>
                    <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                      Compartilhar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="forms" className="space-y-4">
          <Card className="glass">
            <CardHeader className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-medium">Formulário de Inbound Lead</CardTitle>
                  <CardDescription className="text-xs">Qualifique leads antes que eles agendem uma reunião</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><BarChart3 className="w-3 h-3" /> Pixels</Button>
                  <Button size="sm" className="h-7 text-xs">Editar</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4 bg-secondary/30 p-4 rounded-md border border-border/50 max-w-2xl">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Nome da Empresa *</label>
                  <Input disabled placeholder="ex: Acme Corp" className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Qual é o seu maior desafio? *</label>
                  <Input disabled placeholder="Resposta curta" className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Faturamento Mensal</label>
                  <select disabled className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                    <option>Menos de R$ 50.000/mês</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="glass max-w-2xl">
            <CardHeader className="p-4">
              <CardTitle className="text-base font-medium">Disponibilidade Padrão</CardTitle>
              <CardDescription className="text-xs">Defina suas horas de trabalho padrão para agendamentos.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map((day) => (
                <div key={day} className="flex items-center gap-4 p-2 rounded-md bg-secondary/20 border border-border/50">
                  <div className="w-20 text-sm font-medium">{day}</div>
                  <div className="flex-1 flex gap-2 items-center">
                    <Input defaultValue="09:00" type="time" className="w-24 h-8 text-sm" />
                    <span className="text-muted-foreground text-xs">-</span>
                    <Input defaultValue="17:00" type="time" className="w-24 h-8 text-sm" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive"><Plus className="w-4 h-4 rotate-45" /></Button>
                </div>
              ))}
              <div className="pt-4">
                <Button size="sm" className="h-8 text-xs">Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}