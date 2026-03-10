import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckSquare, Calendar, Filter, Clock, MoreVertical, Plus, AlertCircle, CalendarDays, UserPlus, XCircle, LayoutGrid, List } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Task, Priority } from "@/context/AppContext";

export default function TasksView() {
  const { tasks, setTasks, leads } = useAppContext();
  const [filter, setFilter] = useState<Priority | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('matrix');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.priority === filter);

  const getPriorityInfo = (priority: Priority) => {
    switch(priority) {
      case 'do-now': return { label: 'Fazer Agora', icon: <AlertCircle className="w-4 h-4 text-red-500" />, color: 'border-red-500/50 bg-red-500/10' };
      case 'schedule': return { label: 'Agendar', icon: <CalendarDays className="w-4 h-4 text-blue-500" />, color: 'border-blue-500/50 bg-blue-500/10' };
      case 'delegate': return { label: 'Delegar', icon: <UserPlus className="w-4 h-4 text-amber-500" />, color: 'border-amber-500/50 bg-amber-500/10' };
      case 'eliminate': return { label: 'Eliminar', icon: <XCircle className="w-4 h-4 text-muted-foreground" />, color: 'border-border bg-secondary/50' };
    }
  };

  const renderTaskList = (taskList: Task[]) => (
    <div className="divide-y divide-border/50">
      {taskList.map(task => {
        const lead = leads.find(l => l.id === task.linkedLeadId);
        const pInfo = getPriorityInfo(task.priority);
        
        return (
          <div key={task.id} className={`p-3 flex items-start gap-3 transition-colors hover:bg-secondary/30 group ${task.status === 'completed' ? 'opacity-50' : ''}`}>
            <button 
              onClick={() => toggleTaskStatus(task.id)}
              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${task.status === 'completed' ? 'bg-primary border-primary text-primary-foreground' : 'border-border hover:border-primary'}`}
            >
              {task.status === 'completed' && <CheckSquare className="w-2.5 h-2.5" />}
            </button>
            
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedTask(task)}>
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </p>
                {pInfo.icon}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 bg-secondary text-muted-foreground`}>
                  <Clock className="w-2.5 h-2.5" /> {task.dueDate}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  {task.type === 'Cadência Automática' ? <Calendar className="w-2.5 h-2.5" /> : <CheckSquare className="w-2.5 h-2.5" />}
                  {task.type}
                </span>
                {lead && (
                  <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">
                    {lead.name}
                  </span>
                )}
              </div>
            </div>
            
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <MoreVertical className="w-3 h-3 text-muted-foreground" />
            </Button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tarefas e Ações</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie seu tempo com a Matriz de Eisenhower.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-secondary p-1 rounded-md">
            <button 
              onClick={() => setViewMode('matrix')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'matrix' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button className="gap-1.5 h-8 text-xs bg-primary text-primary-foreground">
            <Plus className="w-3.5 h-3.5" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between glass p-1.5 rounded-lg border-border/50 shrink-0">
        <div className="flex gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setFilter('all')}>
            Todas
          </Button>
          <Button variant={filter === 'do-now' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs text-red-500" onClick={() => setFilter('do-now')}>
            A Fazer
          </Button>
          <Button variant={filter === 'schedule' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs text-blue-500" onClick={() => setFilter('schedule')}>
            Agendar
          </Button>
          <Button variant={filter === 'delegate' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs text-amber-500" onClick={() => setFilter('delegate')}>
            Delegar
          </Button>
          <Button variant={filter === 'eliminate' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => setFilter('eliminate')}>
            Eliminar
          </Button>
        </div>
        
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Input placeholder="Buscar tarefas..." className="h-7 text-xs bg-background" />
          </div>
          <Button variant="outline" size="icon" className="h-7 w-7 shrink-0"><Filter className="w-3 h-3" /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-2">
        {viewMode === 'list' ? (
          <Card className="glass overflow-hidden border-border/50">
            {renderTaskList(filteredTasks)}
          </Card>
        ) : (
          <div className="flex gap-4 h-full min-w-max">
            {/* Urgent & Important (Do Now) */}
            <div className="w-80 flex flex-col bg-secondary/20 rounded-xl border border-red-500/20 shadow-sm">
              <div className="p-3 flex items-center justify-between border-b border-red-500/20 shrink-0 bg-red-500/5 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <h3 className="font-medium text-sm text-red-500">A FAZER (Urgente e Importante)</h3>
                </div>
                <span className="text-[10px] font-medium text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">
                  {filteredTasks.filter(t => t.priority === 'do-now').length}
                </span>
              </div>
              <div className="flex-1 p-2 overflow-y-auto">
                <div className="space-y-2">
                  {filteredTasks.filter(t => t.priority === 'do-now').map(task => (
                    <div key={task.id} className="bg-card border p-3 rounded-lg shadow-sm group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <button 
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${task.status === 'completed' ? 'bg-primary border-primary text-primary-foreground' : 'border-border hover:border-primary'}`}
                          >
                            {task.status === 'completed' && <CheckSquare className="w-2.5 h-2.5" />}
                          </button>
                          <p className={`text-sm font-medium cursor-pointer hover:underline ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`} onClick={() => setSelectedTask(task)}>
                            {task.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2 ml-6">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 bg-secondary text-muted-foreground">
                          <Clock className="w-2.5 h-2.5" /> {task.dueDate}
                        </span>
                        {task.linkedLeadId && (() => {
                          const lead = leads.find(l => l.id === task.linkedLeadId);
                          return lead ? (
                            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">
                              {lead.name}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Not Urgent & Important (Schedule) */}
            <div className="w-80 flex flex-col bg-secondary/20 rounded-xl border border-blue-500/20 shadow-sm">
              <div className="p-3 flex items-center justify-between border-b border-blue-500/20 shrink-0 bg-blue-500/5 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                  <h3 className="font-medium text-sm text-blue-500">AGENDAR (Importante, não Urgente)</h3>
                </div>
                <span className="text-[10px] font-medium text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">
                  {filteredTasks.filter(t => t.priority === 'schedule').length}
                </span>
              </div>
              <div className="flex-1 p-2 overflow-y-auto">
                <div className="space-y-2">
                  {filteredTasks.filter(t => t.priority === 'schedule').map(task => (
                    <div key={task.id} className="bg-card border p-3 rounded-lg shadow-sm group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <button 
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${task.status === 'completed' ? 'bg-primary border-primary text-primary-foreground' : 'border-border hover:border-primary'}`}
                          >
                            {task.status === 'completed' && <CheckSquare className="w-2.5 h-2.5" />}
                          </button>
                          <p className={`text-sm font-medium cursor-pointer hover:underline ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`} onClick={() => setSelectedTask(task)}>
                            {task.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2 ml-6">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 bg-secondary text-muted-foreground">
                          <Clock className="w-2.5 h-2.5" /> {task.dueDate}
                        </span>
                        {task.linkedLeadId && (() => {
                          const lead = leads.find(l => l.id === task.linkedLeadId);
                          return lead ? (
                            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">
                              {lead.name}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Urgent & Not Important (Delegate) */}
            <div className="w-80 flex flex-col bg-secondary/20 rounded-xl border border-amber-500/20 shadow-sm">
              <div className="p-3 flex items-center justify-between border-b border-amber-500/20 shrink-0 bg-amber-500/5 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-500" />
                  <h3 className="font-medium text-sm text-amber-500">DELEGAR (Urgente, não Importante)</h3>
                </div>
                <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  {filteredTasks.filter(t => t.priority === 'delegate').length}
                </span>
              </div>
              <div className="flex-1 p-2 overflow-y-auto">
                <div className="space-y-2">
                  {filteredTasks.filter(t => t.priority === 'delegate').map(task => (
                    <div key={task.id} className="bg-card border p-3 rounded-lg shadow-sm group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <button 
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${task.status === 'completed' ? 'bg-primary border-primary text-primary-foreground' : 'border-border hover:border-primary'}`}
                          >
                            {task.status === 'completed' && <CheckSquare className="w-2.5 h-2.5" />}
                          </button>
                          <p className={`text-sm font-medium cursor-pointer hover:underline ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`} onClick={() => setSelectedTask(task)}>
                            {task.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2 ml-6">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 bg-secondary text-muted-foreground">
                          <Clock className="w-2.5 h-2.5" /> {task.dueDate}
                        </span>
                        {task.linkedLeadId && (() => {
                          const lead = leads.find(l => l.id === task.linkedLeadId);
                          return lead ? (
                            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">
                              {lead.name}
                            </span>
                          ) : null;
                        })()}
                        <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                          <UserPlus className="w-2.5 h-2.5"/> {task.responsibleUser}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Not Urgent & Not Important (Eliminate) */}
            <div className="w-80 flex flex-col bg-secondary/20 rounded-xl border border-border/50 shadow-sm">
              <div className="p-3 flex items-center justify-between border-b border-border/50 shrink-0 bg-secondary/30 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm text-muted-foreground">ELIMINAR (Não Importante, não Urgente)</h3>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                  {filteredTasks.filter(t => t.priority === 'eliminate').length}
                </span>
              </div>
              <div className="flex-1 p-2 overflow-y-auto">
                <div className="space-y-2">
                  {filteredTasks.filter(t => t.priority === 'eliminate').map(task => (
                    <div key={task.id} className="bg-card border p-3 rounded-lg shadow-sm group opacity-75">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <button 
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${task.status === 'completed' ? 'bg-primary border-primary text-primary-foreground' : 'border-border hover:border-primary'}`}
                          >
                            {task.status === 'completed' && <CheckSquare className="w-2.5 h-2.5" />}
                          </button>
                          <p className={`text-sm font-medium cursor-pointer hover:underline ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`} onClick={() => setSelectedTask(task)}>
                            {task.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2 ml-6">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 bg-secondary text-muted-foreground">
                          <Clock className="w-2.5 h-2.5" /> {task.dueDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Sheet */}
      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-l">
          {selectedTask && (
            <div className="space-y-6 mt-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1 ${getPriorityInfo(selectedTask.priority).color}`}>
                    {getPriorityInfo(selectedTask.priority).icon}
                    {getPriorityInfo(selectedTask.priority).label}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1 ${selectedTask.status === 'completed' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-secondary text-muted-foreground'}`}>
                    {selectedTask.status === 'completed' ? 'Concluída' : 'Pendente'}
                  </span>
                </div>
                <h2 className="text-xl font-bold">{selectedTask.title}</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  {selectedTask.description || "Nenhuma descrição fornecida."}
                </p>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Vencimento</span>
                  <span className="font-medium">{selectedTask.dueDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><UserPlus className="w-4 h-4" /> Responsável</span>
                  <div className="flex items-center gap-1.5">
                    <Avatar className="w-5 h-5"><AvatarFallback>{selectedTask.responsibleUser[0]}</AvatarFallback></Avatar>
                    <span className="font-medium">{selectedTask.responsibleUser}</span>
                  </div>
                </div>
              </div>

              {selectedTask.linkedLeadId && (
                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-semibold text-sm">Lead Relacionado</h3>
                  {(() => {
                    const lead = leads.find(l => l.id === selectedTask.linkedLeadId);
                    if (!lead) return null;
                    return (
                      <div className="bg-secondary/30 border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{lead.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{lead.contact}</p>
                          </div>
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                            {lead.value}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-3 text-xs">Abrir no CRM</Button>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold text-sm">Anotações da Tarefa</h3>
                <textarea 
                  className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Adicione notas ou resultados..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant={selectedTask.status === 'completed' ? 'outline' : 'default'} 
                  className="flex-1"
                  onClick={() => toggleTaskStatus(selectedTask.id)}
                >
                  {selectedTask.status === 'completed' ? 'Reabrir Tarefa' : 'Marcar como Concluída'}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}