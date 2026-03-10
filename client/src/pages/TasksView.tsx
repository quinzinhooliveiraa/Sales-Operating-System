import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckSquare, Calendar, Filter, Clock, MoreVertical, Plus } from "lucide-react";

export default function TasksView() {
  const [filter, setFilter] = useState('all');

  const tasks = [
    { id: 1, title: "Email de follow-up para Acme Corp", due: "Hoje", type: "Cadência Automática", status: "pending" },
    { id: 2, title: "Preparar ambiente de demo para TechFlow", due: "Amanhã", type: "Manual", status: "pending" },
    { id: 3, title: "Enviar contrato para Global Ind.", due: "Hoje", type: "Cadência Automática", status: "completed" },
    { id: 4, title: "Atualizar registros de CRM para Q1", due: "Próxima Semana", type: "Manual", status: "pending" },
    { id: 5, title: "Check-in com Startup Inc (Dia 3)", due: "Amanhã", type: "Cadência Automática", status: "pending" },
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tarefas e Ações</h1>
          <p className="text-muted-foreground mt-1 text-sm">Tarefas manuais e cadências automatizadas do CRM.</p>
        </div>
        <Button className="gap-1.5 h-8 text-xs">
          <Plus className="w-3.5 h-3.5" />
          Nova Tarefa
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between glass p-1.5 rounded-lg border-border/50">
        <div className="flex gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setFilter('all')}>
            Todas as Tarefas
          </Button>
          <Button variant={filter === 'today' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setFilter('today')}>
            Hoje
          </Button>
          <Button variant={filter === 'automated' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setFilter('automated')}>
            Cadências Automáticas
          </Button>
        </div>
        
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Input placeholder="Buscar tarefas..." className="h-7 text-xs bg-background" />
          </div>
          <Button variant="outline" size="icon" className="h-7 w-7 shrink-0"><Filter className="w-3 h-3" /></Button>
        </div>
      </div>

      <Card className="glass overflow-hidden border-border/50">
        <div className="divide-y divide-border/50">
          {tasks.map(task => (
            <div key={task.id} className={`p-3 flex items-center gap-3 transition-colors hover:bg-secondary/30 group ${task.status === 'completed' ? 'opacity-50' : ''}`}>
              <button className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${task.status === 'completed' ? 'bg-primary border-primary text-primary-foreground' : 'border-border hover:border-primary'}`}>
                {task.status === 'completed' && <CheckSquare className="w-2.5 h-2.5" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${task.due === 'Hoje' ? 'bg-primary/10 text-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    <Clock className="w-2.5 h-2.5" /> {task.due}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    {task.type === 'Cadência Automática' ? <Calendar className="w-2.5 h-2.5" /> : <CheckSquare className="w-2.5 h-2.5" />}
                    {task.type}
                  </span>
                </div>
              </div>
              
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <MoreVertical className="w-3 h-3 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}