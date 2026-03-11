import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, MoreHorizontal, Clock, DollarSign, Calendar, Target, Activity, MessageSquare, Phone, Mail, Settings2, Trash2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useAppContext } from "@/context/AppContext";
import type { Lead, Stage } from "@/context/AppContext";

export default function CRMView() {
  const { stages, setStages, leads, updateLeadStage } = useAppContext();
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isManagePipelineOpen, setIsManagePipelineOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  
  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedLeadId !== null) {
      updateLeadStage(draggedLeadId, stageId);
      setDraggedLeadId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10";
    if (score >= 60) return "text-amber-500 bg-amber-500/10";
    return "text-muted-foreground bg-secondary";
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline de Vendas</h1>
          <p className="text-muted-foreground mt-1 text-sm">Arraste os cards para avançar leads. Cadências geram tarefas automaticamente.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setIsManagePipelineOpen(true)}>
            <Settings2 className="w-3.5 h-3.5" />
            Gerenciar Pipeline
          </Button>
          <Button className="gap-1.5 h-8 text-xs bg-primary text-primary-foreground" onClick={() => setIsAddLeadOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            Adicionar Lead
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-2">
        <div className="flex gap-4 h-full min-w-max px-1">
          {stages.map((stage) => {
            const stageLeads = leads.filter(l => l.stage === stage.id);
            
            return (
              <div 
                key={stage.id} 
                className="w-72 flex flex-col bg-secondary/10 rounded-xl border border-border/50 shadow-sm"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="p-3 flex items-center justify-between border-b border-border/50 shrink-0 bg-background/50 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{stage.name}</h3>
                    <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      {stageLeads.length}
                    </span>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-secondary" onClick={() => setEditingStage(stage)}>
                        <Settings2 className="w-3.5 h-3.5" />
                      </Button>
                    </DialogTrigger>
                    {/* Cadence Configuration Dialog Modal */}
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Configurar Etapa: {stage.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Nome da Etapa</label>
                          <Input defaultValue={stage.name} className="h-9" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tipo de Cenário (Cadência)</label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" defaultValue={stage.scenarioType || ''}>
                            <option value="">Sem cenário específico</option>
                            <option value="Cold call funnel">Cold call funnel</option>
                            <option value="Meeting follow-up funnel">Meeting follow-up funnel</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">Cadência de Follow-up (Touches)</label>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Plus className="w-3 h-3"/> Add Touch</Button>
                          </div>
                          <div className="space-y-2 border rounded-md p-2 bg-secondary/20">
                            {stage.cadence.length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-2">Nenhuma automação configurada.</p>
                            ) : (
                              stage.cadence.map((action, i) => (
                                <div key={i} className="flex items-center gap-2 bg-background p-2 rounded border text-sm">
                                  <span className="font-medium text-xs w-16">Touch {i+1}</span>
                                  <select className="h-7 text-xs rounded border bg-background px-2" defaultValue={action.type}>
                                    <option value="call">Ligar</option>
                                    <option value="email">Email</option>
                                    <option value="message">Mensagem</option>
                                  </select>
                                  <span className="text-xs text-muted-foreground">após</span>
                                  <Input type="number" defaultValue={action.intervalHours} className="w-16 h-7 text-xs px-2" />
                                  <span className="text-xs text-muted-foreground">horas</span>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto text-destructive hover:bg-destructive/10"><Trash2 className="w-3 h-3"/></Button>
                                </div>
                              ))
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">Tarefas serão geradas automaticamente na aba "Tarefas" quando o lead entrar nesta etapa.</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Salvar Cadência</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex-1 p-2 overflow-y-auto space-y-2">
                  {stageLeads.map(lead => (
                    <div 
                      key={lead.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onClick={() => setSelectedLead(lead)}
                      className={`bg-card border p-3 rounded-lg shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing group relative ${draggedLeadId === lead.id ? 'opacity-50' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm text-foreground">{lead.name}</h4>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${getScoreColor(lead.score)}`}>
                          <Target className="w-2.5 h-2.5" /> {lead.score}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5 text-[9px] border">
                            <AvatarFallback>{lead.company?.substring(0,2)?.toUpperCase() || "L"}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{lead.company}</span>
                        </div>
                        <span className="text-xs font-medium">{lead.value}</span>
                      </div>

                      {/* Dynamic action indicator based on state */}
                      <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-1.5">
                        {lead.meetingDate ? (
                          <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/5 p-1.5 rounded">
                            <Calendar className="w-3.5 h-3.5" /> Reunião: {lead.meetingDate}
                          </div>
                        ) : lead.nextTask ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 p-1.5 rounded">
                            <Clock className="w-3.5 h-3.5" /> Próx: {lead.nextTask}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50 p-1.5">
                            Nenhuma ação pendente
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Add Stage Button */}
          <div className="w-12 flex flex-col shrink-0">
            <Button variant="ghost" className="h-full w-full border-2 border-dashed border-border hover:border-primary/50 bg-secondary/10 hover:bg-secondary/30 rounded-xl">
              <Plus className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lead Detail Panel (Sheet) */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-l">
          {selectedLead && (
            <div className="space-y-6 mt-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{selectedLead.name}</h2>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${getScoreColor(selectedLead.score)}`}>
                    Score: {selectedLead.score}
                  </span>
                </div>
                <div className="text-muted-foreground text-sm space-y-1 mt-2">
                  <p className="flex items-center gap-2"><Mail className="w-4 h-4"/> {selectedLead.email}</p>
                  <p className="flex items-center gap-2"><Phone className="w-4 h-4"/> {selectedLead.phone}</p>
                  <p className="flex items-center gap-2"><Target className="w-4 h-4"/> Valor: {selectedLead.value}</p>
                  <p className="flex items-center gap-2"><Settings2 className="w-4 h-4"/> Etapa: {stages.find(s => s.id === selectedLead.stage)?.name}</p>
                  <p className="flex items-center gap-2"><User className="w-4 h-4"/> Responsável: {selectedLead.owner}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-primary text-primary-foreground gap-2"><Phone className="w-4 h-4"/> Ligar</Button>
                <Button variant="outline" className="flex-1 gap-2"><Mail className="w-4 h-4"/> Email</Button>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1 text-xs" onClick={() => setIsCreateTaskOpen(true)}>Criar Tarefa</Button>
                <Button variant="secondary" className="flex-1 text-xs">Agendar Follow-up</Button>
                <select className="flex-1 h-9 rounded-md border border-input bg-secondary/50 px-3 py-1 text-xs shadow-sm transition-colors">
                  <option value="">Atribuir a...</option>
                  <option value="Quinzinho">Quinzinho</option>
                  <option value="João">João</option>
                  <option value="Maria">Maria</option>
                </select>
              </div>

              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm"><Target className="w-4 h-4"/> Próxima Ação</h3>
                {selectedLead.meetingDate ? (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-primary"/> Reunião Agendada</p>
                      <p className="text-xs text-muted-foreground mt-1">{selectedLead.meetingDate}</p>
                    </div>
                    <Button size="sm" variant="outline">Entrar na Call</Button>
                  </div>
                ) : selectedLead.nextTask ? (
                  <div className="bg-secondary/50 border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4"/> {selectedLead.nextTask}</p>
                      <p className="text-xs text-muted-foreground mt-1">Gerado pela cadência</p>
                    </div>
                    <Button size="sm">Completar</Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma ação planejada.</p>
                )}
              </div>

              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm"><Activity className="w-4 h-4"/> Histórico de Atividades</h3>
                <div className="space-y-3 border-l-2 border-border/50 ml-2 pl-4 py-1">
                  {selectedLead.history && selectedLead.history.length > 0 ? selectedLead.history.map((act: any) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></div>
                      <p className="text-sm font-medium">{act.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(act.date).toLocaleDateString()}</p>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">Sem atividades recentes.</p>
                  )}
                </div>
              </div>

              {Object.keys(selectedLead.formResponses).length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-semibold flex items-center gap-2 text-sm"><MessageSquare className="w-4 h-4"/> Respostas do Formulário</h3>
                  <div className="bg-secondary/30 rounded-lg p-3 space-y-3 border">
                    {Object.entries(selectedLead.formResponses).map(([q, a]) => (
                      <div key={q}>
                        <p className="text-xs text-muted-foreground">{q}</p>
                        <p className="text-sm font-medium mt-0.5">{a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm"><Activity className="w-4 h-4"/> Anotações</h3>
                <textarea 
                  className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Adicione notas sobre o lead..."
                  defaultValue={selectedLead.notes}
                />
                <Button size="sm" className="w-full">Salvar Nota</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Lead Modal */}
      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Lead</DialogTitle>
            <DialogDescription>Preencha as informações do novo lead manualmente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Nome</label>
                <Input placeholder="Ex: João Silva" className="h-9" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Empresa</label>
                <Input placeholder="Ex: Acme Corp" className="h-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Email</label>
                <Input type="email" placeholder="joao@acme.com" className="h-9" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Telefone</label>
                <Input placeholder="+55 11 99999-9999" className="h-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Etapa do Pipeline</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
                  {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Responsável</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
                  <option>Quinzinho</option>
                  <option>João</option>
                  <option>Maria</option>
                </select>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={() => setIsAddLeadOpen(false)}>Criar Lead</Button>
          </div>
        </DialogContent>
      </Dialog>


      
      {/* Manage Pipeline Modal */}
      <Dialog open={isManagePipelineOpen} onOpenChange={setIsManagePipelineOpen}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gerenciar Pipeline</DialogTitle>
            <DialogDescription>Crie, reordene ou edite as etapas e suas cadências.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Etapas do Funil</h3>
              <Button size="sm" className="gap-1 h-8"><Plus className="w-3.5 h-3.5"/> Nova Etapa</Button>
            </div>
            
            <div className="space-y-3">
              {stages.map((stage, index) => (
                <div key={stage.id} className="border rounded-lg p-4 bg-card shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col text-muted-foreground cursor-move">
                        <MoreHorizontal className="w-4 h-4 -mb-1.5" />
                        <MoreHorizontal className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-muted-foreground w-4">{index + 1}.</span>
                      <Input defaultValue={stage.name} className="h-8 w-[200px] font-medium" />
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4"/></Button>
                  </div>
                  
                  <div className="pl-12 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Tipo de Cenário</label>
                        <select className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs" defaultValue={stage.scenarioType || ''}>
                          <option value="">Nenhum cenário</option>
                          <option value="Cold call funnel">Cold call funnel</option>
                          <option value="Meeting follow-up funnel">Meeting follow-up funnel</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Tentativas (Touches)</label>
                        <select className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs" defaultValue={stage.cadence.length}>
                          <option value="0">Sem cadência</option>
                          <option value="3">3 touches</option>
                          <option value="5">5 touches</option>
                          <option value="7">7 touches</option>
                          <option value="10">10 touches</option>
                          <option value="12">12 touches</option>
                          <option value="15">15 touches</option>
                          <option value="custom">Personalizado</option>
                        </select>
                      </div>
                    </div>
                    
                    {stage.cadence.length > 0 && (
                      <div className="bg-secondary/30 p-3 rounded-md space-y-2 border">
                        <h4 className="text-xs font-medium mb-2">Intervalo entre tentativas</h4>
                        {stage.cadence.map((action, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-xs w-14 font-medium text-muted-foreground">Touch {i+1}</span>
                            <select className="flex h-7 w-28 rounded border border-input bg-background px-2 text-xs" defaultValue={action.type}>
                              <option value="call">Ligação</option>
                              <option value="email">Email</option>
                              <option value="message">Mensagem</option>
                            </select>
                            <span className="text-xs text-muted-foreground">após</span>
                            <select className="flex h-7 w-24 rounded border border-input bg-background px-2 text-xs" defaultValue={action.intervalHours}>
                              <option value="12">12 horas</option>
                              <option value="24">24 horas</option>
                              <option value="36">36 horas</option>
                              <option value="48">48 horas</option>
                              <option value={action.intervalHours}>Personalizado ({action.intervalHours}h)</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="mt-4 pt-4 border-t shrink-0">
            <Button variant="outline" onClick={() => setIsManagePipelineOpen(false)}>Cancelar</Button>
            <Button onClick={() => setIsManagePipelineOpen(false)}>Salvar Pipeline</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Modal for Lead */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>Adicione uma tarefa vinculada a {selectedLead?.name || 'este lead'}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título da Tarefa</label>
              <Input placeholder="O que precisa ser feito?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="do-now">Fazer Agora (Urgente/Importante)</option>
                <option value="schedule">Agendar (Importante/Não Urgente)</option>
                <option value="delegate">Delegar (Urgente/Não Importante)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Vencimento</label>
              <Input type="date" />
            </div>
            <Button className="w-full mt-2" onClick={() => setIsCreateTaskOpen(false)}>Criar Tarefa</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
