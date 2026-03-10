import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar as CalendarIcon, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bom dia, João</h1>
        <p className="text-muted-foreground mt-1 text-sm">Aqui está o que está acontecendo com o seu funil de vendas hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Novos Leads (Semana)</CardTitle>
            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-foreground">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">24</div>
            <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +12% vs última semana
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reuniões Agendadas</CardTitle>
            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-foreground">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">8</div>
            <p className="text-xs text-muted-foreground mt-1">3 agendadas para hoje</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tarefas Pendentes</CardTitle>
            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-foreground">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">12</div>
            <p className="text-xs text-orange-500 font-medium mt-1">5 follow-ups atrasados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Agenda de Hoje</CardTitle>
            <CardDescription>Suas próximas reuniões e tarefas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              { time: "10:00", title: "Call de Descoberta com Acme Corp", type: "reunião" },
              { time: "11:30", title: "Follow-up com Sarah", type: "tarefa" },
              { time: "14:00", title: "Demo de Produto: TechFlow", type: "reunião" },
              { time: "16:00", title: "Enviar proposta para Inovação S.A.", type: "tarefa" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-md hover:bg-secondary/50 transition-colors">
                <div className="w-12 text-sm font-medium text-muted-foreground shrink-0 pt-0.5">{item.time}</div>
                <div className={`w-1.5 h-1.5 mt-2 rounded-full shrink-0 ${item.type === 'reunião' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
            <CardDescription>Últimos eventos no seu pipeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { user: "Sarah M.", action: "agendou uma reunião", time: "10 min atrás", avatar: "SM" },
              { user: "Mike T.", action: "movido para Negociação", time: "1 hora atrás", avatar: "MT" },
              { user: "Sistema", action: "gerou 3 tarefas de follow-up", time: "2 horas atrás", avatar: "OS" },
              { user: "Alex W.", action: "completou o formulário de qualificação", time: "3 horas atrás", avatar: "AW" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/30">
                <Avatar className="w-7 h-7 text-[10px] border border-border">
                  <AvatarFallback className={item.user === 'Sistema' ? 'bg-secondary text-foreground' : 'bg-background'}>
                    {item.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{item.user}</span> {item.action}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
            <div className="pt-4">
              <Button variant="outline" className="w-full text-xs h-8">Ver Toda a Atividade</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}