import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, MoreHorizontal, Clock, DollarSign, Calendar, Target, Activity, MessageSquare, Phone, Mail, Settings2, Trash2, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppContext } from "@/context/AppContext";
import type { Lead, Stage, CadenceAction } from "@/context/AppContext";

export default function CRMView() {
  const { stages, setStages, leads, setLeads, updateLeadStage } = useAppContext();
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  
  // New lead form state
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: "", company: "", email: "", phone: "", stage: stages[0]?.id || "", owner: "Quinzinho", notes: ""
  });
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
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

  // Cadence handlers
  const handleAddStage = () => {
    const newStageId = 'stage_' + Math.random().toString(36).substr(2, 9);
    setStages([...stages, { id: newStageId, name: 'Nova Etapa', cadence: [] }]);
  };

  const handleAddTouch = (stageId: string) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return { ...s, cadence: [...s.cadence, { type: 'email', intervalHours: 24 }] };
      }
      return s;
    }));
  };

  const handleRemoveTouch = (stageId: string, touchIndex: number) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        const newCadence = [...s.cadence];
        newCadence.splice(touchIndex, 1);
        return { ...s, cadence: newCadence };
      }
      return s;
    }));
  };

  const handleUpdateTouch = (stageId: string, touchIndex: number, field: keyof CadenceAction, value: any) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        const newCadence = [...s.cadence];
        newCadence[touchIndex] = { ...newCadence[touchIndex], [field]: field === 'intervalHours' ? Number(value) : value };
        return { ...s, cadence: newCadence };
      }
      return s;
    }));
  };

  const handleAddLead = () => {
    if (!newLead.name) return;
    
    const lead: Lead = {
      id: Math.max(0, ...leads.map(l => l.id)) + 1,
      name: newLead.name || "",
      company: newLead.company || "",
      email: newLead.email || "",
      phone: newLead.phone || "",
      stage: newLead.stage || stages[0]?.id || "",
      owner: newLead.owner || "Quinzinho",
      value: "R$ 0",
      tags: [],
      score: 50,
      formResponses: {},
      notes: newLead.notes || "",
      history: [{ id: Math.random().toString(), type: 'stage_change', description: 'Lead adicionado', date: new Date().toISOString() }]
    };
    
    setLeads([...leads, lead]);
    setIsAddLeadOpen(false);
    setNewLead({ name: "", company: "", email: "", phone: "", stage: stages[0]?.id || "", owner: "Quinzinho", notes: "" });
  };

  const handleRemoveStage = (stageId: string) => {
    setStages(stages.filter(s => s.id !== stageId));
  };

  const handleUpdateStage = (stageId: string, field: keyof Stage, value: any) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return { ...s, [field]: value };
      }
      return s;
    }));
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
                  
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-secondary" onClick={() => setIsManagePipelineOpen(true)}>
                    <Settings2 className="w-3.5 h-3.5" />
                  </Button>
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
            <Button variant="ghost" className="h-full w-full border-2 border-dashed border-border hover:border-primary/50 bg-secondary/10 hover:bg-secondary/30 rounded-xl" onClick={handleAddStage}>
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
                <select className="flex-1 h-9 rounded-md border border-input bg-secondary/50 px-3 py-1 text-xs shadow-sm transition-colors text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="" className="bg-background text-foreground">Atribuir a...</option>
                  <option value="Quinzinho" className="bg-background text-foreground">Quinzinho</option>
                  <option value="João" className="bg-background text-foreground">João</option>
                  <option value="Maria" className="bg-background text-foreground">Maria</option>
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
                  className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Adicione notas sobre o lead..."
                  defaultValue={selectedLead.notes}
                />
                <Button size="sm" className="w-full">Salvar Nota</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Lead Sheet */}
      <Sheet open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-l">
          <SheetHeader className="mb-6 mt-6 text-left">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Adicionar Novo Lead
            </SheetTitle>
            <SheetDescription>
              Preencha as informações do novo lead para iniciar no funil.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome</label>
              <Input placeholder="Ex: João Silva" className="h-10 bg-background text-foreground" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Empresa</label>
              <Input placeholder="Ex: Acme Corp" className="h-10 bg-background text-foreground" value={newLead.company} onChange={e => setNewLead({...newLead, company: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input type="email" placeholder="joao@acme.com" className="h-10 bg-background text-foreground" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Telefone</label>
              <Input placeholder="+55 11 99999-9999" className="h-10 bg-background text-foreground" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Etapa do Pipeline</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary" value={newLead.stage} onChange={e => setNewLead({...newLead, stage: e.target.value})}>
                {stages.map(s => <option key={s.id} value={s.id} className="bg-background text-foreground">{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Responsável</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary" value={newLead.owner} onChange={e => setNewLead({...newLead, owner: e.target.value})}>
                <option value="Quinzinho" className="bg-background text-foreground">Quinzinho</option>
                <option value="João" className="bg-background text-foreground">João</option>
                <option value="Maria" className="bg-background text-foreground">Maria</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Anotações Iniciais</label>
              <textarea 
                className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Detalhes sobre a prospecção..."
                value={newLead.notes} onChange={e => setNewLead({...newLead, notes: e.target.value})}
              />
            </div>
            <div className="pt-4 border-t">
              <Button className="w-full h-10 text-base" onClick={() => setIsAddLeadOpen(false)}>
                Criar Lead
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Manage Pipeline Full Page Dialog */}
      <Dialog open={isManagePipelineOpen} onOpenChange={setIsManagePipelineOpen}>
        <DialogContent className="max-w-[100vw] w-screen h-screen m-0 p-0 flex flex-col rounded-none border-0 bg-background sm:max-w-[100vw]">
          <div className="px-6 py-4 border-b shrink-0 bg-card flex justify-between items-center sticky top-0 z-10">
            <div>
              <DialogTitle className="text-2xl font-bold">Gerenciar Pipeline</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-sm sm:text-base">
                Configure as etapas do seu funil de vendas e as cadências automáticas (touches).
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsManagePipelineOpen(false)}>
              <X className="w-6 h-6" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-secondary/5">
            <div className="max-w-5xl mx-auto space-y-6 pb-20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-xl text-foreground">Etapas do Funil</h3>
                <Button className="gap-2 bg-primary text-primary-foreground" onClick={handleAddStage}>s*<Plus className="w-4 h-4"/> Nova Etapas*</Button>
              </div>
              
              <div className="space-y-6">
                {stages.map((stage, index) => (
                  <div key={stage.id} className="border rounded-xl p-5 sm:p-6 bg-card shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex flex-col text-muted-foreground/50 cursor-move shrink-0">
                          <MoreHorizontal className="w-5 h-5 -mb-2" />
                          <MoreHorizontal className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-muted-foreground text-lg w-6 shrink-0">{index + 1}.</span>
                        <Input 
                          value={stage.name} 
                          onChange={(e) => handleUpdateStage(stage.id, 'name', e.target.value)}
                          className="h-11 text-base font-semibold w-full sm:max-w-[350px] bg-background text-foreground" 
                        />
                      </div>
                      <Button variant="ghost" className="text-destructive hover:bg-destructive/10 gap-2 shrink-0 self-end sm:self-auto" onClick={() => handleRemoveStage(stage.id)}>s*<Trash2 className="w-4 h-4"/> Remover Etapas*</Button>
                    </div>
                    
                    <div className="sm:pl-14 space-y-6">
                      <div className="w-full sm:w-[400px] space-y-2">
                        <label className="text-sm font-medium text-foreground">Tipo de Cenário</label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                          value={stage.scenarioType || ''}
                          onChange={(e) => handleUpdateStage(stage.id, 'scenarioType', e.target.value)}
                        >
                          <option value="" className="bg-background text-foreground">Nenhum cenário</option>
                          <option value="Cold call funnel" className="bg-background text-foreground">Cold call funnel</option>
                          <option value="Meeting follow-up funnel" className="bg-background text-foreground">Meeting follow-up funnel</option>
                        </select>
                      </div>
                      
                      <div className="space-y-3 pt-2">
                        <div className="flex flex-wrap justify-between items-center w-full gap-3">
                          <h4 className="text-sm font-medium text-foreground">Cadência (Touches)</h4>
                          <div className="flex items-center gap-2">
                            <select 
                              className="h-8 rounded-md border border-input bg-background text-xs px-2 focus:outline-none"
                              onChange={(e) => {
                                const count = parseInt(e.target.value);
                                if (count > 0) {
                                  let currentTouches = [...stage.cadence];
                                  for(let i=0; i<count; i++) {
                                    currentTouches.push({ type: 'email', intervalHours: 24 });
                                  }
                                  setStages(stages.map(s => s.id === stage.id ? { ...s, cadence: currentTouches } : s));
                                }
                                e.target.value = "";
                              }}
                            >
                              <option value="">Adicionar múltiplos...</option>
                              <option value="3">Adicionar 3 touches</option>
                              <option value="5">Adicionar 5 touches</option>
                              <option value="7">Adicionar 7 touches</option>
                              <option value="10">Adicionar 10 touches</option>
                            </select>
                            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => handleAddTouch(stage.id)}>
                               <Plus className="w-3.5 h-3.5" /> 1 Touch
                            </Button>
                          </div>
                        </div>
                        
                        <div className="w-full">
                          {stage.cadence.length === 0 ? (
                            <div className="bg-secondary/20 border border-dashed border-border/50 rounded-lg p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                              <p>Nenhum touch configurado para esta etapa.</p>
                              <Button variant="outline" size="sm" className="mt-2" onClick={() => handleAddTouch(stage.id)}>
                                Adicionar Primeiro Touch
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {stage.cadence.map((action, i) => (
                                <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                                  <div className="flex flex-col items-center justify-center bg-secondary/30 w-12 h-12 rounded-lg border border-border/50 shrink-0">
                                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Touch</span>
                                    <span className="text-lg font-bold leading-none">{i+1}</span>
                                  </div>
                                  
                                  <div className="flex-1 min-w-[200px] grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Ação</label>
                                      <select 
                                        className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                                        value={action.type}
                                        onChange={(e) => handleUpdateTouch(stage.id, i, 'type', e.target.value)}
                                      >
                                        <option value="call" className="bg-background text-foreground">Ligação (Call)</option>
                                        <option value="email" className="bg-background text-foreground">Email</option>
                                        <option value="message" className="bg-background text-foreground">Mensagem (WhatsApp/LinkedIn)</option>
                                      </select>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Intervalo (Espera)</label>
                                      <div className="flex items-center gap-2">
                                        <Input 
                                          type="number" 
                                          value={action.intervalHours} 
                                          onChange={(e) => handleUpdateTouch(stage.id, i, 'intervalHours', e.target.value)}
                                          className="h-10 w-full bg-background text-foreground shadow-sm" 
                                          min="0"
                                        />
                                        <span className="text-sm text-muted-foreground shrink-0 w-10">horas</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 mt-5 sm:mt-0"
                                    onClick={() => handleRemoveTouch(stage.id, i)}
                                    title="Remover Touch"
                                  >
                                    <Trash2 className="w-5 h-5"/>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 border-t bg-card flex justify-end gap-3 shrink-0">
            <Button variant="outline" size="lg" onClick={() => setIsManagePipelineOpen(false)}>Cancelar</Button>
            <Button size="lg" onClick={() => setIsManagePipelineOpen(false)} className="bg-primary text-primary-foreground px-8">Salvar Alterações</Button>
          </div>
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
              <Input placeholder="O que precisa ser feito?" className="bg-background text-foreground" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="do-now" className="bg-background text-foreground">Fazer Agora (Urgente/Importante)</option>
                <option value="schedule" className="bg-background text-foreground">Agendar (Importante/Não Urgente)</option>
                <option value="delegate" className="bg-background text-foreground">Delegar (Urgente/Não Importante)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Vencimento</label>
              <Input type="date" className="bg-background text-foreground" />
            </div>
            <Button className="w-full mt-2" onClick={() => setIsCreateTaskOpen(false)}>Criar Tarefa</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
