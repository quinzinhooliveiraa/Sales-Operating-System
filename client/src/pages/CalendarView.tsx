import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Plus, ChevronLeft, ChevronRight, User } from "lucide-react";

export default function CalendarView() {
  const [view, setView] = useState<'month'|'week'|'day'>('week');
  
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM
  const days = ['Seg, 12', 'Ter, 13', 'Qua, 14', 'Qui, 15', 'Sex, 16'];

  const mockEvents = [
    { day: 0, hour: 10, duration: 1, title: "Call de Descoberta", type: "meeting", style: "border-primary bg-primary/10 text-foreground" },
    { day: 0, hour: 14, duration: 1.5, title: "Tarefa de Follow-up (Auto)", type: "task", style: "border-muted-foreground bg-secondary text-muted-foreground" },
    { day: 2, hour: 11, duration: 1, title: "Demo: Acme Corp", type: "meeting", style: "border-primary bg-primary/10 text-foreground" },
    { day: 3, hour: 9, duration: 0.5, title: "Enviar Proposta", type: "task", style: "border-muted-foreground bg-secondary text-muted-foreground" },
    { day: 4, hour: 15, duration: 1, title: "Reunião de Equipe", type: "meeting", style: "border-border bg-background text-foreground" },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="w-4 h-4" /></Button>
            <span className="font-medium text-sm ml-2">Março 2026</span>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="flex bg-secondary p-1 rounded-md">
            {['dia', 'semana', 'mês'].map(v => (
              <button 
                key={v}
                onClick={() => setView(v === 'dia' ? 'day' : v === 'semana' ? 'week' : 'month' as any)}
                className={`px-3 py-1 text-xs font-medium rounded-sm capitalize transition-colors ${(view === 'day' && v === 'dia') || (view === 'week' && v === 'semana') || (view === 'month' && v === 'mês') ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <Button className="gap-1.5 h-8 text-xs">
            <Plus className="w-3.5 h-3.5" />
            Criar
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 hidden lg:flex flex-col gap-4 shrink-0 overflow-y-auto pb-4">
          <div className="space-y-3 px-1 mt-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meus Calendários</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs cursor-pointer hover:text-foreground text-muted-foreground transition-colors">
                <input type="checkbox" defaultChecked className="rounded border-border bg-background text-primary focus:ring-primary h-3 w-3" />
                Reuniões (Calendly)
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer hover:text-foreground text-muted-foreground transition-colors">
                <input type="checkbox" defaultChecked className="rounded border-border bg-background text-primary focus:ring-primary h-3 w-3" />
                Tarefas Automáticas CRM
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer hover:text-foreground text-muted-foreground transition-colors">
                <input type="checkbox" defaultChecked className="rounded border-border bg-background text-primary focus:ring-primary h-3 w-3" />
                Google Agenda Pessoal
              </label>
            </div>
          </div>
        </div>

        {/* Main Calendar Grid */}
        <Card className="flex-1 glass overflow-hidden flex flex-col border-border/50">
          <div className="flex border-b border-border/50 bg-secondary/20">
            <div className="w-12 shrink-0 border-r border-border/50" />
            {days.map((day, i) => (
              <div key={day} className="flex-1 text-center py-2 border-r border-border/50 last:border-r-0">
                <span className={`text-xs font-medium ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {day}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto relative bg-card">
            <div className="flex min-w-full">
              <div className="w-12 shrink-0 border-r border-border/50 bg-secondary/10 sticky left-0 z-10">
                {hours.map(hour => (
                  <div key={hour} className="h-16 border-b border-border/50 text-[10px] text-muted-foreground text-right pr-2 pt-1.5 font-medium">
                    {hour === 12 ? '12h' : hour > 12 ? `${hour}h` : `${hour}h`}
                  </div>
                ))}
              </div>
              
              {days.map((day, dayIndex) => (
                <div key={day} className="flex-1 border-r border-border/50 last:border-r-0 relative min-w-[100px]">
                  {hours.map(hour => (
                    <div key={hour} className="h-16 border-b border-border/50 transition-colors hover:bg-secondary/30 cursor-pointer" />
                  ))}
                  
                  {mockEvents.filter(e => e.day === dayIndex).map((event, i) => (
                    <div 
                      key={i}
                      className={`absolute left-1 right-1 rounded p-1.5 border-l-2 ${event.style} shadow-sm cursor-pointer hover:opacity-90 transition-all text-xs`}
                      style={{ 
                        top: `${(event.hour - 8) * 4}rem`,
                        height: `calc(${event.duration * 4}rem - 4px)`,
                        zIndex: 5
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-[9px] mt-0.5 opacity-80 flex items-center gap-1">
                        {event.type === 'meeting' ? <User className="w-2.5 h-2.5"/> : <CheckSquare className="w-2.5 h-2.5"/>}
                        {event.hour}:00 - {event.hour + event.duration}:00
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}