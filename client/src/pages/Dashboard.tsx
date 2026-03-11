import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar as CalendarIcon, CheckCircle2, ArrowUpRight, ArrowDownRight, Clock, Target, CalendarDays, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useAppContext } from "@/context/AppContext";

export default function Dashboard() {
  const { leads, tasks, events } = useAppContext();
  
  // Calculate overdue touches based on tasks
  const pendingCadenceTasks = tasks.filter(t => t.type === 'Cadência Automática' && t.status === 'pending');
  const overdueTouches = pendingCadenceTasks.filter(t => new Date(t.dueDate) < new Date()).length;
  
  // Get upcoming meetings
  const today = new Date().toISOString().split('T')[0];
  const upcomingMeetings = events.filter(e => e.type === 'meeting' && e.date >= today).sort((a,b) => a.date.localeCompare(b.date));

  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week');

  const getMetrics = () => {
    switch (timeFilter) {
      case 'day': return { leads: 4, meetings: 2, conversion: "18%", trend: "up" };
      case 'month': return { leads: 124, meetings: 45, conversion: "26%", trend: "up" };
      case 'week':
      default: return { leads: 24, meetings: 8, conversion: "22%", trend: "down" };
    }
  };

  const metrics = getMetrics();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Bem-vindo de volta, João. Aqui está o resumo da sua operação.</p>
        </div>
        <div className="flex bg-secondary p-1 rounded-md">
          <button 
            onClick={() => setTimeFilter('day')}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${timeFilter === 'day' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Hoje
          </button>
          <button 
            onClick={() => setTimeFilter('week')}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${timeFilter === 'week' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Esta Semana
          </button>
          <button 
            onClick={() => setTimeFilter('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${timeFilter === 'month' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Este Mês
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Novos Leads</CardTitle>
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{metrics.leads}</div>
            <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +12% vs anterior
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
            <div className="text-2xl font-semibold">{metrics.meetings}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {timeFilter === 'day' ? '3 para hoje' : '2 cancelamentos'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-foreground">
              <Target className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{metrics.conversion}</div>
            <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${metrics.trend === 'up' ? 'text-primary' : 'text-destructive'}`}>
              {metrics.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} 
              {metrics.trend === 'up' ? '+2.4%' : '-1.2%'} vs anterior
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-primary/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tarefas Pendentes</CardTitle>
            <div className="w-8 h-8 rounded-md bg-destructive/10 flex items-center justify-center text-destructive">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-destructive">12</div>
            <p className="text-xs text-destructive/80 font-medium mt-1">{overdueTouches} follow-ups atrasados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Tarefas de Hoje</CardTitle>
              <CardDescription>Ações geradas automaticamente por suas cadências</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs">Ver Todas</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {[
                { time: "Atrasado", title: "Ligar para Acme Corp (Touch 2)", type: "call", priority: "high", contact: "Sarah M." },
                { time: "10:00", title: "Enviar email de follow-up: TechFlow (Touch 3)", type: "email", priority: "medium", contact: "Mike T." },
                { time: "14:00", title: "Mensagem no LinkedIn para Global Ind.", type: "message", priority: "low", contact: "Alex W." },
                { time: "16:00", title: "Revisar proposta Inovação S.A.", type: "task", priority: "high", contact: "Lisa R." },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-md hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50 group">
                  <button className="w-4 h-4 rounded border flex items-center justify-center shrink-0 border-border hover:border-primary transition-colors" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.priority === 'high' && <span className="w-2 h-2 rounded-full bg-destructive" title="Alta Prioridade" />}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                      <span>•</span>
                      <span>{item.contact}</span>
                    </p>
                  </div>

                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-8 text-xs bg-secondary">
                    Executar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Próximas Reuniões</CardTitle>
            <CardDescription>Sua agenda para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { day: "Hoje", time: "11:30", title: "Call de Descoberta", contact: "Sarah M.", company: "Acme Corp" },
              { day: "Amanhã", time: "14:00", title: "Demo de Produto", contact: "Mike T.", company: "TechFlow" },
              { day: "Qui, 15", time: "10:00", title: "Revisão de Contrato", contact: "Lisa R.", company: "Inovação S.A." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex flex-col items-center justify-center bg-background rounded-md w-12 h-12 shrink-0 border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase">{item.day}</span>
                  <span className="text-sm font-bold">{item.time}</span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <span className="truncate">{item.contact}</span>
                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">
                      {item.company}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full text-xs h-8 mt-2"><CalendarDays className="w-3 h-3 mr-2" /> Abrir Calendário</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}