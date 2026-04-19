import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, MoreHorizontal, Clock, DollarSign, Calendar, Target, Activity, Phone, Mail, Settings2, Trash2, User, X, Mic, Loader2, ChevronDown, ChevronRight, CheckSquare, Square, Edit2, PlusCircle, Check, ArrowRightLeft, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppContext } from "@/context/AppContext";
import type { Lead, Stage, CadenceAction } from "@/context/AppContext";

export default function CRMView() {
  const { stages, setStages, leads, setLeads, updateLeadStage, addLead, formatCurrency, t, deleteLead, addTask, crmConfig } = useAppContext();
  const { tasks, setTasks } = useAppContext();

  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});

  // ── Multi-select ──────────────────────────────────────────────────────────
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelectLead = (leadId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      if (next.size === 0) setIsSelectionMode(false);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Apagar ${selectedLeadIds.size} lead(s) selecionado(s)?`)) return;
    selectedLeadIds.forEach(id => deleteLead(id));
    setSelectedLeadIds(new Set());
    setIsSelectionMode(false);
  };

  const exitSelectionMode = () => {
    setSelectedLeadIds(new Set());
    setIsSelectionMode(false);
  };

  // ── Touch drag-and-drop ───────────────────────────────────────────────────
  const [touchDragLeadId, setTouchDragLeadId] = useState<number | null>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const [touchGhost, setTouchGhost] = useState<{ name: string; company: string } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; leadId: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent, lead: Lead) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, leadId: lead.id };
    isDraggingRef.current = false;

    longPressTimerRef.current = setTimeout(() => {
      isDraggingRef.current = true;
      setTouchDragLeadId(lead.id);
      setTouchGhost({ name: lead.name, company: lead.company });
      setTouchPos({ x: touch.clientX, y: touch.clientY });
    }, 400);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (isDraggingRef.current) {
      e.preventDefault();
      setTouchPos({ x: touch.clientX, y: touch.clientY });
    } else if (longPressTimerRef.current && touchStartRef.current) {
      const dx = Math.abs(touch.clientX - touchStartRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartRef.current.y);
      if (dx > 8 || dy > 8) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isDraggingRef.current && touchDragLeadId !== null && touchPos) {
      const el = document.elementFromPoint(touchPos.x, touchPos.y);
      const stageEl = el?.closest('[data-stage-id]') as HTMLElement | null;
      const stageId = stageEl?.dataset?.stageId;

      if (stageId) {
        const lead = leads.find(l => l.id === touchDragLeadId);
        if (lead && lead.stage !== stageId) {
          setMovePrompt({ isOpen: true, leadId: touchDragLeadId, targetStageId: stageId });
        }
      }
    }

    isDraggingRef.current = false;
    setTouchDragLeadId(null);
    setTouchGhost(null);
    setTouchPos(null);
    touchStartRef.current = null;
  }, [touchDragLeadId, touchPos, leads]);

  // ── Lead modals ───────────────────────────────────────────────────────────
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isManagePipelineOpen, setIsManagePipelineOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [movePrompt, setMovePrompt] = useState<{ isOpen: boolean; leadId: number | null; targetStageId: string | null }>({ isOpen: false, leadId: null, targetStageId: null });

  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: "", company: "", email: "", phone: "", stage: stages[0]?.id || "", owner: "Quinzinho", notes: "",
    formResponses: { "Caixa (Budget)": "", "Decisor (Authority)": "", "Necessidade (Need)": "", "Urgência (Timeline)": "" }
  });

  // ── Custom fields state ───────────────────────────────────────────────────
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingField, setEditingField] = useState<{ key: string; value: string } | null>(null);

  // ── Create task state ─────────────────────────────────────────────────────
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("schedule");
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);

  const [isRecordingNewLead, setIsRecordingNewLead] = useState(false);
  const [isRecordingSelectedLead, setIsRecordingSelectedLead] = useState(false);

  const toggleStageCollapse = (stageId: string) => {
    setCollapsedStages(prev => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  const startVoiceRecognition = (onResult: (text: string) => void, onEnd: () => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Seu navegador não suporta gravação de voz."); onEnd(); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.onresult = (event: any) => { onResult(event.results[0][0].transcript); };
    recognition.onerror = () => onEnd();
    recognition.onend = () => onEnd();
    recognition.start();
  };

  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedLeadId !== null) {
      setMovePrompt({ isOpen: true, leadId: draggedLeadId, targetStageId: stageId });
      setDraggedLeadId(null);
    }
  };

  const handleStageDragStart = (e: React.DragEvent, stageId: string) => { setDraggedStageId(stageId); e.dataTransfer.effectAllowed = 'move'; };
  const handleStageDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleStageDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    if (!draggedStageId || draggedStageId === targetStageId) return;
    const draggedIndex = stages.findIndex(s => s.id === draggedStageId);
    const targetIndex = stages.findIndex(s => s.id === targetStageId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const newStages = [...stages];
    const [draggedStage] = newStages.splice(draggedIndex, 1);
    newStages.splice(targetIndex, 0, draggedStage);
    setStages(newStages);
    setDraggedStageId(null);
  };
  const handleStageDragEnd = () => { setDraggedStageId(null); };

  const getScoreBand = (score: number) => {
    const band = crmConfig?.scoreBands?.find(b => score >= b.minScore && score <= b.maxScore);
    return band || null;
  };

  const maxPossibleScore = crmConfig?.scoreEvents?.reduce((sum, e) => e.points > 0 ? sum + e.points : sum, 0) || 100;

  const formatScore = (score: number) => {
    if (crmConfig?.displayFormat === 'percent') return `${Math.round((score / maxPossibleScore) * 100)}%`;
    return `${score}/${maxPossibleScore}`;
  };

  const getScoreColor = (score: number) => {
    const band = getScoreBand(score);
    if (band) return `font-bold`;
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10";
    if (score >= 60) return "text-amber-500 bg-amber-500/10";
    return "text-muted-foreground bg-secondary";
  };

  const handleAddStage = () => {
    const newStageId = 'stage_' + Math.random().toString(36).substr(2, 9);
    setStages([...stages, { id: newStageId, name: 'Nova Etapa', cadence: [] }]);
  };

  const handleAddTouch = (stageId: string) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, cadence: [...s.cadence, { type: 'email', intervalValue: 1, intervalUnit: 'days' }] } : s));
  };

  const handleRemoveTouch = (stageId: string, touchIndex: number) => {
    setStages(stages.map(s => {
      if (s.id === stageId) { const c = [...s.cadence]; c.splice(touchIndex, 1); return { ...s, cadence: c }; }
      return s;
    }));
  };

  const handleUpdateTouch = (stageId: string, touchIndex: number, field: keyof CadenceAction, value: any) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        const c = [...s.cadence];
        c[touchIndex] = { ...c[touchIndex], [field]: field === 'intervalValue' ? Number(value) : value };
        return { ...s, cadence: c };
      }
      return s;
    }));
  };

  const calculateScore = (lead: Partial<Lead>) => {
    let score = 10;
    if (lead.formResponses) {
      if (lead.formResponses["Caixa (Budget)"] === "Alto" || lead.formResponses["Caixa (Budget)"] === "Suficiente") score += 25;
      else if (lead.formResponses["Caixa (Budget)"] === "Baixo") score += 5;
      if (lead.formResponses["Decisor (Authority)"] === "Sim") score += 25;
      else if (lead.formResponses["Decisor (Authority)"] === "Não, mas tem acesso") score += 10;
      if (lead.formResponses["Necessidade (Need)"] === "Alta") score += 25;
      else if (lead.formResponses["Necessidade (Need)"] === "Média") score += 15;
      if (lead.formResponses["Urgência (Timeline)"] === "Imediata") score += 15;
      else if (lead.formResponses["Urgência (Timeline)"] === "1-3 Meses") score += 10;
    }
    if (lead.email && lead.email.includes('@')) score += 5;
    if (lead.phone && lead.phone.length > 5) score += 5;
    if (lead.notes && lead.notes.length > 10) score += 5;
    return Math.min(score, 99);
  };

  const handleAddLead = () => {
    if (!newLead.name) return;
    const finalStage = newLead.stage || stages[0]?.id || "";
    const lead: Lead = {
      id: leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1,
      name: newLead.name || "", company: newLead.company || "", email: newLead.email || "",
      phone: newLead.phone || "", stage: finalStage, owner: newLead.owner || "Quinzinho",
      value: "R$ 0", tags: [], score: calculateScore(newLead),
      formResponses: newLead.formResponses || {}, notes: newLead.notes || "",
      history: [{ id: Math.random().toString(), type: 'stage_change', description: 'Lead adicionado', date: new Date().toISOString() }]
    };
    addLead(lead);
    setIsAddLeadOpen(false);
    setNewLead({ name: "", company: "", email: "", phone: "", stage: stages[0]?.id || "", owner: "Quinzinho", notes: "",
      formResponses: { "Caixa (Budget)": "", "Decisor (Authority)": "", "Necessidade (Need)": "", "Urgência (Timeline)": "" } });
  };

  const handleRemoveStage = (stageId: string) => { setStages(stages.filter(s => s.id !== stageId)); };
  const handleUpdateStage = (stageId: string, field: keyof Stage, value: any) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, [field]: value } : s));
  };

  // ── Lead update helpers ───────────────────────────────────────────────────
  const updateSelectedLead = (updated: Lead) => {
    updated.score = calculateScore(updated);
    setSelectedLead(updated);
    setLeads(leads.map(l => l.id === updated.id ? updated : l));
  };

  const addCustomField = () => {
    if (!newFieldName.trim() || !selectedLead) return;
    const key = `custom_${newFieldName.trim()}`;
    const updated = { ...selectedLead, formResponses: { ...selectedLead.formResponses, [key]: newFieldValue } };
    updateSelectedLead(updated);
    setNewFieldName("");
    setNewFieldValue("");
    setIsAddingField(false);
  };

  const removeCustomField = (key: string) => {
    if (!selectedLead) return;
    const fr = { ...selectedLead.formResponses };
    delete fr[key];
    updateSelectedLead({ ...selectedLead, formResponses: fr });
  };

  const saveCustomField = () => {
    if (!editingField || !selectedLead) return;
    const updated = { ...selectedLead, formResponses: { ...selectedLead.formResponses, [editingField.key]: editingField.value } };
    updateSelectedLead(updated);
    setEditingField(null);
  };

  const BANT_KEYS = ["Caixa (Budget)", "Decisor (Authority)", "Necessidade (Need)", "Urgência (Timeline)"];
  const getCustomFields = (fr: Record<string, any> = {}) =>
    Object.entries(fr).filter(([k]) => k.startsWith("custom_"));
  const getOtherFields = (fr: Record<string, any> = {}) =>
    Object.entries(fr).filter(([k]) => !BANT_KEYS.some(b => k.includes(b.split(" ")[0])) && !k.startsWith("custom_"));

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">

      {/* Touch drag ghost */}
      {touchGhost && touchPos && (
        <div
          className="fixed z-50 pointer-events-none bg-card border border-primary/60 rounded-lg p-3 shadow-xl w-56 opacity-90"
          style={{ left: touchPos.x - 112, top: touchPos.y - 40, transform: 'rotate(2deg)' }}
        >
          <p className="font-semibold text-sm truncate">{touchGhost.name}</p>
          <p className="text-xs text-muted-foreground truncate">{touchGhost.company}</p>
        </div>
      )}

      {/* Move dialog */}
      <Dialog open={movePrompt.isOpen} onOpenChange={(open) => !open && setMovePrompt({ isOpen: false, leadId: null, targetStageId: null })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t?.moveLeadPromptTitle || "Reiniciar Lembretes?"}</DialogTitle>
            <DialogDescription>{t?.moveLeadPromptDesc || "Você moveu este lead. Deseja gerar novas tarefas de cadência para esta etapa ou manter as antigas?"}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => {
              if (movePrompt.leadId && movePrompt.targetStageId) {
                updateLeadStage(movePrompt.leadId, movePrompt.targetStageId, false);
                if (selectedLead?.id === movePrompt.leadId) {
                  setSelectedLead(prev => prev ? { ...prev, stage: movePrompt.targetStageId! } : null);
                }
              }
              setMovePrompt({ isOpen: false, leadId: null, targetStageId: null });
            }}>Manter Antigas</Button>
            <Button onClick={() => {
              if (movePrompt.leadId && movePrompt.targetStageId) {
                updateLeadStage(movePrompt.leadId, movePrompt.targetStageId, true);
                if (selectedLead?.id === movePrompt.leadId) {
                  setSelectedLead(prev => prev ? { ...prev, stage: movePrompt.targetStageId! } : null);
                }
              }
              setMovePrompt({ isOpen: false, leadId: null, targetStageId: null });
            }}>Gerar Novas Tarefas</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline de Vendas</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isSelectionMode
              ? `${selectedLeadIds.size} lead(s) selecionado(s)`
              : "Arraste os cards para avançar leads. Pressione e segure no celular."}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isSelectionMode ? (
            <>
              <Button variant="destructive" className="gap-1.5 h-8 text-xs" onClick={handleBulkDelete}>
                <Trash2 className="w-3.5 h-3.5" /> Apagar ({selectedLeadIds.size})
              </Button>
              <Button variant="outline" className="h-8 text-xs" onClick={exitSelectionMode}>Cancelar</Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setIsSelectionMode(true)}>
                <CheckSquare className="w-3.5 h-3.5" /> Selecionar
              </Button>
              <Button variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setIsManagePipelineOpen(true)}>
                <Settings2 className="w-3.5 h-3.5" /> Pipeline
              </Button>
              <Button className="gap-1.5 h-8 text-xs bg-primary text-primary-foreground" onClick={() => {
                setNewLead({ name: "", company: "", email: "", phone: "", stage: stages[0]?.id || "", owner: "Quinzinho", notes: "",
                  formResponses: { "Caixa (Budget)": "", "Decisor (Authority)": "", "Necessidade (Need)": "", "Urgência (Timeline)": "" } });
                setIsAddLeadOpen(true);
              }}>
                <Plus className="w-3.5 h-3.5" /> Adicionar Lead
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-2">
        <div className="flex gap-4 h-full min-w-max px-1">
          {stages.map((stage) => {
            const stageLeads = leads.filter(l => l.stage === stage.id);
            return (
              <div
                key={stage.id}
                data-stage-id={stage.id}
                className={`w-72 flex flex-col bg-secondary/10 rounded-xl border border-border/50 shadow-sm ${draggedStageId === stage.id ? 'opacity-50' : ''}`}
                draggable
                onDragStart={(e) => {
                  if ((e.target as HTMLElement).closest('.lead-card')) { e.preventDefault(); return; }
                  handleStageDragStart(e, stage.id);
                }}
                onDragOver={(e) => { e.preventDefault(); draggedStageId ? handleStageDragOver(e) : handleDragOver(e); }}
                onDrop={(e) => { draggedStageId ? handleStageDrop(e, stage.id) : handleDrop(e, stage.id); }}
                onDragEnd={handleStageDragEnd}
              >
                <div className="p-3 flex items-center justify-between border-b border-border/50 shrink-0 bg-background/50 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{stage.name}</h3>
                    <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{stageLeads.length}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setIsManagePipelineOpen(true)}>
                    <Settings2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="flex-1 p-2 overflow-y-auto space-y-2">
                  {stageLeads.map(lead => {
                    const isSelected = selectedLeadIds.has(lead.id);
                    const isDraggingThis = touchDragLeadId === lead.id;
                    return (
                      <div
                        key={lead.id}
                        draggable={!isSelectionMode}
                        onDragStart={(e) => { e.stopPropagation(); if (!isSelectionMode) handleDragStart(e, lead.id); }}
                        onTouchStart={(e) => { if (!isSelectionMode) handleTouchStart(e, lead); }}
                        onTouchMove={(e) => { if (!isSelectionMode) handleTouchMove(e); }}
                        onTouchEnd={(e) => { if (!isSelectionMode) handleTouchEnd(e); }}
                        onClick={(e) => {
                          if (isSelectionMode) { toggleSelectLead(lead.id, e); }
                          else if (!isDraggingThis) { setSelectedLead(lead); }
                        }}
                        className={`lead-card bg-card border p-3 rounded-lg shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group relative select-none
                          ${draggedLeadId === lead.id || isDraggingThis ? 'opacity-40' : ''}
                          ${isSelected ? 'border-primary/70 ring-1 ring-primary/50' : ''}
                        `}
                      >
                        {/* Selection checkbox */}
                        {(isSelectionMode || isSelected) && (
                          <div className="absolute top-2 right-2 z-10" onClick={(e) => toggleSelectLead(lead.id, e)}>
                            {isSelected
                              ? <CheckSquare className="w-4 h-4 text-primary" />
                              : <Square className="w-4 h-4 text-muted-foreground" />
                            }
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm text-foreground pr-5">{lead.name}</h4>
                          {(() => {
                            const band = getScoreBand(lead.score);
                            return band ? (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1"
                                style={{ backgroundColor: band.color + '20', color: band.color }}
                              >
                                {band.emoji} {formatScore(lead.score)}
                              </span>
                            ) : (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${getScoreColor(lead.score)}`}>
                                <Target className="w-2.5 h-2.5" /> {formatScore(lead.score)}
                              </span>
                            );
                          })()}
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5 text-[9px] border">
                              <AvatarFallback>{lead.company?.substring(0, 2)?.toUpperCase() || "L"}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{lead.company}</span>
                          </div>
                          <span className="text-xs font-medium">{lead.value}</span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-1.5">
                          {(() => {
                            const pendingTasks = tasks.filter(t => t.linkedLeadId === lead.id && t.status === 'pending');
                            if (pendingTasks.length > 0) {
                              const nextTask = pendingTasks[0];
                              const isOverdue = new Date(nextTask.dueDate) < new Date(new Date().toISOString().split('T')[0]);
                              return (
                                <div className="mt-2">
                                  <div className="flex items-center gap-1.5 text-[10px] mb-1">
                                    <span className="font-semibold text-muted-foreground uppercase tracking-wider">Próximo Passo:</span>
                                  </div>
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="text-xs font-medium leading-tight line-clamp-2">{nextTask.title}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 ${isOverdue ? 'bg-destructive/10 text-destructive font-bold' : 'bg-secondary text-muted-foreground'}`}>
                                      {isOverdue ? 'Atrasado' : nextTask.dueDate}
                                    </span>
                                  </div>
                                </div>
                              );
                            } else if (lead.meetingDate) {
                              return (
                                <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/5 p-1.5 rounded">
                                  <Calendar className="w-3.5 h-3.5" /> Reunião: {lead.meetingDate}
                                </div>
                              );
                            } else {
                              return (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50 p-1.5">
                                  Nenhuma ação pendente
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Add Stage */}
          <div className="w-12 flex flex-col shrink-0">
            <Button variant="ghost" className="h-full w-full border-2 border-dashed border-border hover:border-primary/50 bg-secondary/10 hover:bg-secondary/30 rounded-xl" onClick={handleAddStage}>
              <Plus className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Lead Detail Sheet ─────────────────────────────────────────────── */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card border-l">
          {selectedLead && (
            <div className="space-y-5 mt-6">

              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-2xl font-bold">{selectedLead.name}</h2>
                  {(() => {
                    const band = getScoreBand(selectedLead.score);
                    return band ? (
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"
                        style={{ backgroundColor: band.color + '20', color: band.color }}
                      >
                        {band.emoji} {band.name} · {formatScore(selectedLead.score)}
                      </span>
                    ) : (
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${getScoreColor(selectedLead.score)}`}>
                        Score: {formatScore(selectedLead.score)}
                      </span>
                    );
                  })()}
                </div>

                {/* Basic info - inline editable */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Input
                      value={selectedLead.email}
                      onChange={e => updateSelectedLead({ ...selectedLead, email: e.target.value })}
                      className="h-8 text-sm bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Input
                      value={selectedLead.phone}
                      onChange={e => updateSelectedLead({ ...selectedLead, phone: e.target.value })}
                      className="h-8 text-sm bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                      placeholder="+55 11 99999-9999"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Input
                      value={selectedLead.value}
                      onChange={e => updateSelectedLead({ ...selectedLead, value: e.target.value })}
                      className="h-8 text-sm bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                      placeholder="R$ 0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Input
                      value={selectedLead.owner}
                      onChange={e => updateSelectedLead({ ...selectedLead, owner: e.target.value })}
                      className="h-8 text-sm bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                      placeholder="Responsável"
                    />
                  </div>
                </div>
              </div>

              {/* ── Trocar etapa pelo card ── */}
              <div className="space-y-2 border rounded-lg p-3 bg-secondary/10">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRightLeft className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Etapa do Pipeline</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {stages.map(stage => (
                    <button
                      key={stage.id}
                      onClick={() => {
                        if (selectedLead.stage !== stage.id) {
                          setMovePrompt({ isOpen: true, leadId: selectedLead.id, targetStageId: stage.id });
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all border
                        ${selectedLead.stage === stage.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-muted-foreground border-border hover-elevate'
                        }`}
                    >
                      {stage.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 flex-wrap">
                <Button className="flex-1 min-w-[100px] bg-primary text-primary-foreground gap-2" asChild>
                  <a href={`tel:${selectedLead.phone}`}><Phone className="w-4 h-4" /> Ligar</a>
                </Button>
                <Button variant="outline" className="flex-1 min-w-[100px] gap-2" asChild>
                  <a href={`mailto:${selectedLead.email}`}><Mail className="w-4 h-4" /> Email</a>
                </Button>
                <Button variant="secondary" className="flex-1 min-w-[100px] text-xs" onClick={() => setIsCreateTaskOpen(true)}>
                  Criar Tarefa
                </Button>
              </div>

              {/* Next action */}
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm"><Target className="w-4 h-4" /> Próxima Ação (Cadência)</h3>
                {(() => {
                  const pendingTasks = tasks.filter(t => t.linkedLeadId === selectedLead.id && t.status === 'pending');
                  if (pendingTasks.length > 0) {
                    const nextTask = pendingTasks[0];
                    const isOverdue = new Date(nextTask.dueDate) < new Date(new Date().toISOString().split('T')[0]);
                    return (
                      <div className="bg-secondary/50 border rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> {nextTask.title}</p>
                          <p className={`text-xs mt-1 ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                            Vencimento: {isOverdue ? 'Atrasado' : nextTask.dueDate}
                          </p>
                        </div>
                        <Button size="sm" onClick={() => setTasks(tasks.map(t => t.id === nextTask.id ? { ...t, status: 'completed' } : t))}>Completar</Button>
                      </div>
                    );
                  } else if (selectedLead.meetingDate) {
                    return (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Reunião Agendada</p>
                          <p className="text-xs text-muted-foreground mt-1">{selectedLead.meetingDate}</p>
                        </div>
                        <Button size="sm" variant="outline">Entrar na Call</Button>
                      </div>
                    );
                  }
                  return <p className="text-sm text-muted-foreground">Nenhuma ação de cadência planejada.</p>;
                })()}
              </div>

              {/* ── BANT Qualification ── */}
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm"><Target className="w-4 h-4" /> Qualificação BANT</h3>
                <div className="bg-secondary/10 rounded-lg p-3 grid grid-cols-2 gap-3 border">
                  {[
                    { key: "Caixa (Budget)", options: ["Não avaliado", "Alto", "Suficiente", "Baixo", "Sem budget"] },
                    { key: "Decisor (Authority)", options: ["Não avaliado", "Sim", "Não, mas tem acesso", "Não"] },
                    { key: "Necessidade (Need)", options: ["Não avaliado", "Alta", "Média", "Baixa"] },
                    { key: "Urgência (Timeline)", options: ["Não avaliado", "Imediata", "1-3 Meses", "3-6 Meses", "Longo Prazo"] },
                  ].map(({ key, options }) => (
                    <div key={key}>
                      <label className="text-[10px] text-muted-foreground font-semibold uppercase">{key.split(" ")[0]}</label>
                      <select
                        className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-xs text-foreground"
                        value={selectedLead.formResponses?.[key] || ""}
                        onChange={(e) => {
                          const updated = { ...selectedLead, formResponses: { ...selectedLead.formResponses, [key]: e.target.value } };
                          updateSelectedLead(updated);
                        }}
                      >
                        {options.map(o => <option key={o} value={o === "Não avaliado" ? "" : o} className="bg-background">{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Aplicar Evento de Score ── */}
              {crmConfig?.scoreEvents?.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-semibold flex items-center gap-2 text-sm"><Zap className="w-4 h-4 text-amber-500" /> Aplicar Evento de Score</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {crmConfig.scoreEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => {
                          const newScore = Math.max(0, Math.min(selectedLead.score + event.points, maxPossibleScore));
                          const historyEntry = {
                            id: Math.random().toString(36).substr(2, 9),
                            type: 'note' as const,
                            description: `${event.points > 0 ? '+' : ''}${event.points} pts: ${event.name}`,
                            date: new Date().toISOString(),
                          };
                          const updated = {
                            ...selectedLead,
                            score: newScore,
                            history: [...(selectedLead.history || []), historyEntry],
                          };
                          setSelectedLead(updated);
                          setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all hover-elevate
                          ${event.points > 0 ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' : 'border-destructive/30 bg-destructive/5 text-destructive'}`}
                      >
                        {event.points > 0 ? '+' : ''}{event.points} {event.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Campos Customizados ── */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2 text-sm"><Edit2 className="w-4 h-4" /> Campos Extras</h3>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => setIsAddingField(true)}>
                    <PlusCircle className="w-3.5 h-3.5" /> Adicionar
                  </Button>
                </div>

                {/* Existing custom fields */}
                <div className="space-y-2">
                  {getCustomFields(selectedLead.formResponses).map(([key, val]) => {
                    const label = key.replace("custom_", "");
                    const isEditing = editingField?.key === key;
                    return (
                      <div key={key} className="flex items-center gap-2 bg-secondary/10 border rounded-lg px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">{label}</p>
                          {isEditing ? (
                            <div className="flex gap-2 mt-1">
                              <Input
                                className="h-6 text-xs py-0 px-2"
                                value={editingField.value}
                                onChange={e => setEditingField({ ...editingField, value: e.target.value })}
                                autoFocus
                              />
                              <Button size="icon" className="h-6 w-6" onClick={saveCustomField}><Check className="w-3 h-3" /></Button>
                            </div>
                          ) : (
                            <p className="text-sm font-medium truncate">{val as string}</p>
                          )}
                        </div>
                        {!isEditing && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setEditingField({ key, value: val as string })}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeCustomField(key)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Other form responses */}
                {getOtherFields(selectedLead.formResponses).length > 0 && (
                  <div className="space-y-2">
                    {getOtherFields(selectedLead.formResponses).map(([key, val]) => (
                      <div key={key} className="bg-secondary/30 border rounded-lg px-3 py-2">
                        <p className="text-[10px] text-muted-foreground">{key}</p>
                        <p className="text-sm font-medium">{val as string}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add field form */}
                {isAddingField && (
                  <div className="bg-secondary/20 border rounded-lg p-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Novo Campo</p>
                    <Input
                      placeholder="Nome do campo (ex: LinkedIn, CPF...)"
                      value={newFieldName}
                      onChange={e => setNewFieldName(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Input
                      placeholder="Valor"
                      value={newFieldValue}
                      onChange={e => setNewFieldValue(e.target.value)}
                      className="h-8 text-sm"
                      onKeyDown={e => e.key === 'Enter' && addCustomField()}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={addCustomField}>Salvar</Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => { setIsAddingField(false); setNewFieldName(""); setNewFieldValue(""); }}>Cancelar</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Notas ── */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold flex items-center gap-2 text-sm"><Activity className="w-4 h-4" /> Anotações</h3>
                  <Button
                    type="button" variant="ghost" size="sm"
                    className={`h-8 px-2 text-xs ${isRecordingSelectedLead ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}
                    onClick={() => {
                      if (isRecordingSelectedLead) return;
                      setIsRecordingSelectedLead(true);
                      startVoiceRecognition(
                        (text) => {
                          const el = document.getElementById('selected-lead-notes') as HTMLTextAreaElement;
                          if (el) el.value = el.value ? el.value + " " + text : text;
                          setIsRecordingSelectedLead(false);
                        },
                        () => setIsRecordingSelectedLead(false)
                      );
                    }}
                  >
                    {isRecordingSelectedLead ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Ouvindo...</> : <><Mic className="w-3.5 h-3.5 mr-1.5" /> Gravar</>}
                  </Button>
                </div>
                <textarea
                  id="selected-lead-notes"
                  className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Adicione notas sobre o lead..."
                  defaultValue={selectedLead.notes}
                />
                <Button size="sm" className="w-full" onClick={() => {
                  const el = document.getElementById('selected-lead-notes') as HTMLTextAreaElement;
                  if (el && selectedLead) updateSelectedLead({ ...selectedLead, notes: el.value });
                }}>
                  Salvar Nota
                </Button>
              </div>

              {/* ── Histórico ── */}
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm"><Activity className="w-4 h-4" /> Histórico</h3>
                <div className="space-y-3 border-l-2 border-border/50 ml-2 pl-4 py-1">
                  {selectedLead.history && selectedLead.history.length > 0 ? selectedLead.history.map((act: any) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background" />
                      <p className="text-sm font-medium">{act.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(act.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">Sem atividades recentes.</p>}
                </div>
              </div>

              {/* Delete lead */}
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:bg-destructive/10 gap-2"
                  onClick={() => {
                    if (window.confirm(`Apagar o lead "${selectedLead.name}"?`)) {
                      deleteLead(selectedLead.id);
                      setSelectedLead(null);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" /> Apagar este Lead
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Add Lead Sheet ──────────────────────────────────────────────────── */}
      <Sheet open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-l">
          <SheetHeader className="mb-6 mt-6 text-left">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" /> Adicionar Novo Lead
            </SheetTitle>
            <SheetDescription>Preencha as informações do novo lead para iniciar no funil.</SheetDescription>
          </SheetHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input placeholder="Ex: João Silva" className="h-10 bg-background" value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Empresa</label>
              <Input placeholder="Ex: Acme Corp" className="h-10 bg-background" value={newLead.company} onChange={e => setNewLead({ ...newLead, company: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="joao@acme.com" className="h-10 bg-background" value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <Input placeholder="+55 11 99999-9999" className="h-10 bg-background" value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Etapa do Pipeline</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={newLead.stage || stages[0]?.id || ""} onChange={e => setNewLead({ ...newLead, stage: e.target.value })}>
                {stages.map(s => <option key={s.id} value={s.id} className="bg-background">{s.name}</option>)}
              </select>
            </div>
            <div className="pt-4 border-t space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Qualificação (BANT)</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "Caixa (Budget)", opts: ["Alto (Folgado)", "Suficiente", "Baixo (Apertado)", "Sem budget"] },
                  { key: "Decisor (Authority)", opts: ["Sim (Final)", "Não, mas tem acesso", "Não (Influenciador)"] },
                  { key: "Necessidade (Need)", opts: ["Alta (Dor latente)", "Média (Buscando)", "Baixa (Apenas curioso)"] },
                  { key: "Urgência (Timeline)", opts: ["Imediata", "1-3 Meses", "3-6 Meses", "Longo Prazo"] },
                ].map(({ key, opts }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-xs font-medium">{key.split(" ")[0]}</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      value={newLead.formResponses?.[key] || ""}
                      onChange={e => setNewLead({ ...newLead, formResponses: { ...(newLead.formResponses || {}), [key]: e.target.value } })}
                    >
                      <option value="">Não avaliado</option>
                      {opts.map(o => <option key={o} value={o.split(" ")[0]} className="bg-background">{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Responsável</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={newLead.owner} onChange={e => setNewLead({ ...newLead, owner: e.target.value })}>
                <option value="Quinzinho">Quinzinho</option>
                <option value="João">João</option>
                <option value="Maria">Maria</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Anotações Iniciais</label>
                <Button type="button" variant="ghost" size="sm" className={`h-8 px-2 text-xs ${isRecordingNewLead ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}
                  onClick={() => {
                    if (isRecordingNewLead) return;
                    setIsRecordingNewLead(true);
                    startVoiceRecognition(
                      (text) => { setNewLead(prev => ({ ...prev, notes: prev.notes ? prev.notes + " " + text : text })); setIsRecordingNewLead(false); },
                      () => setIsRecordingNewLead(false)
                    );
                  }}>
                  {isRecordingNewLead ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Ouvindo...</> : <><Mic className="w-3.5 h-3.5 mr-1.5" /> Gravar</>}
                </Button>
              </div>
              <textarea
                className="w-full min-h-[80px] p-3 text-sm rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Detalhes sobre a prospecção..."
                value={newLead.notes} onChange={e => setNewLead({ ...newLead, notes: e.target.value })}
              />
            </div>
            <div className="pt-4 border-t">
              <Button className="w-full h-10 text-base" onClick={handleAddLead}>Criar Lead</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Manage Pipeline Dialog ──────────────────────────────────────────── */}
      <Dialog open={isManagePipelineOpen} onOpenChange={setIsManagePipelineOpen}>
        <DialogContent className="max-w-[100vw] w-screen h-screen m-0 p-0 flex flex-col rounded-none border-0 bg-background sm:max-w-[100vw]">
          <div className="px-6 py-4 border-b shrink-0 bg-card flex justify-between items-center sticky top-0 z-10">
            <div>
              <DialogTitle className="text-2xl font-bold">Gerenciar Pipeline</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-sm">Configure as etapas do funil e cadências automáticas.</DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsManagePipelineOpen(false)}><X className="w-6 h-6" /></Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-secondary/5">
            <div className="max-w-5xl mx-auto space-y-6 pb-20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-xl">Etapas do Funil</h3>
                <Button className="gap-2 bg-primary text-primary-foreground" onClick={handleAddStage}><Plus className="w-4 h-4" /> Nova Etapa</Button>
              </div>

              <div className="space-y-6">
                {stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className={`border rounded-xl p-5 sm:p-6 bg-card shadow-sm transition-all ${draggedStageId === stage.id ? 'opacity-50 border-primary' : ''} ${!collapsedStages[stage.id] ? 'space-y-5' : ''}`}
                    draggable
                    onDragStart={(e) => handleStageDragStart(e, stage.id)}
                    onDragOver={(e) => { e.preventDefault(); handleStageDragOver(e); }}
                    onDrop={(e) => handleStageDrop(e, stage.id)}
                    onDragEnd={handleStageDragEnd}
                  >
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${!collapsedStages[stage.id] ? 'pb-4 border-b border-border/50' : ''}`}>
                      <div className="flex items-center gap-2 sm:gap-4 flex-1">
                        <div className="flex flex-col text-muted-foreground/50 cursor-move shrink-0 hover:text-foreground transition-colors mr-1">
                          <MoreHorizontal className="w-5 h-5 -mb-2" /><MoreHorizontal className="w-5 h-5" />
                        </div>
                        <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0 text-muted-foreground" onClick={() => toggleStageCollapse(stage.id)}>
                          {collapsedStages[stage.id] ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </Button>
                        <span className="font-bold text-muted-foreground text-lg w-6 shrink-0 text-center">{index + 1}.</span>
                        <Input
                          value={stage.name}
                          onChange={(e) => handleUpdateStage(stage.id, 'name', e.target.value)}
                          onDragStart={(e) => e.stopPropagation()}
                          className="h-11 text-base font-semibold w-full sm:max-w-[350px] bg-background"
                        />
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {collapsedStages[stage.id] && <span className="text-xs text-muted-foreground mr-2">{stage.cadence.length} touches</span>}
                        <Button variant="ghost" className="text-destructive hover:bg-destructive/10 gap-2 shrink-0" onClick={() => handleRemoveStage(stage.id)}>
                          <Trash2 className="w-4 h-4" /> Remover
                        </Button>
                      </div>
                    </div>

                    {!collapsedStages[stage.id] && (
                      <div className="sm:pl-16 space-y-6">
                        <div className="w-full sm:w-[400px] space-y-2">
                          <label className="text-sm font-medium">Tipo de Cenário</label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={stage.scenarioType || ''}
                            onChange={(e) => handleUpdateStage(stage.id, 'scenarioType', e.target.value)}
                            onDragStart={(e) => e.stopPropagation()}
                          >
                            <option value="">Nenhum cenário</option>
                            <option value="Cold call funnel">Cold call funnel</option>
                            <option value="Meeting follow-up funnel">Meeting follow-up funnel</option>
                          </select>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="flex flex-wrap justify-between items-center w-full gap-3">
                            <h4 className="text-sm font-medium">Cadência (Touches)</h4>
                            <div className="flex items-center gap-2">
                              <select
                                className="h-8 rounded-md border border-input bg-background text-xs px-2 focus:outline-none"
                                onChange={(e) => {
                                  const count = parseInt(e.target.value);
                                  if (count > 0) {
                                    let c = [...stage.cadence];
                                    for (let i = 0; i < count; i++) c.push({ type: 'email', intervalValue: 1, intervalUnit: 'days' });
                                    setStages(stages.map(s => s.id === stage.id ? { ...s, cadence: c } : s));
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
                                <Button variant="outline" size="sm" className="mt-2" onClick={() => handleAddTouch(stage.id)}>Adicionar Primeiro Touch</Button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {stage.cadence.map((action, i) => (
                                  <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                                    <div className="flex flex-col items-center justify-center bg-secondary/30 w-12 h-12 rounded-lg border border-border/50 shrink-0">
                                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Touch</span>
                                      <span className="text-lg font-bold leading-none">{i + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-[200px] grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Ação</label>
                                        <select
                                          className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                          value={action.type}
                                          onChange={(e) => handleUpdateTouch(stage.id, i, 'type', e.target.value)}
                                        >
                                          <option value="call">Ligação (Call)</option>
                                          <option value="email">Email</option>
                                          <option value="message">Mensagem (WhatsApp/LinkedIn)</option>
                                        </select>
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Intervalo</label>
                                        <div className="flex items-center gap-2">
                                          <Input type="number" value={action.intervalValue}
                                            onChange={(e) => handleUpdateTouch(stage.id, i, 'intervalValue', e.target.value)}
                                            className="h-10 w-full bg-background" min="0" />
                                          <select
                                            className="h-10 rounded-md border border-input bg-background text-foreground px-2 py-2 text-sm shadow-sm focus:outline-none w-24 shrink-0"
                                            value={action.intervalUnit}
                                            onChange={(e) => handleUpdateTouch(stage.id, i, 'intervalUnit', e.target.value)}
                                          >
                                            <option value="minutes">min</option>
                                            <option value="hours">horas</option>
                                            <option value="days">dias</option>
                                            <option value="months">meses</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 mt-5 sm:mt-0" onClick={() => handleRemoveTouch(stage.id, i)}>
                                      <Trash2 className="w-5 h-5" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 border-t bg-card flex justify-end gap-3 shrink-0">
            <Button variant="outline" size="lg" onClick={() => setIsManagePipelineOpen(false)}>Fechar</Button>
            <Button size="lg" onClick={() => setIsManagePipelineOpen(false)} className="bg-primary text-primary-foreground px-8">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Create Task Dialog ──────────────────────────────────────────────── */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>Adicione uma tarefa vinculada a {selectedLead?.name || 'este lead'}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título da Tarefa</label>
              <Input placeholder="O que precisa ser feito?" className="bg-background" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}>
                <option value="do-now">Fazer Agora (Urgente/Importante)</option>
                <option value="schedule">Agendar (Importante/Não Urgente)</option>
                <option value="delegate">Delegar (Urgente/Não Importante)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Vencimento</label>
              <Input type="date" className="bg-background" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} />
            </div>
            <Button className="w-full mt-2" onClick={() => {
              if (!newTaskTitle || !selectedLead) return;
              addTask({
                title: newTaskTitle,
                description: `Tarefa para ${selectedLead.name}`,
                priority: newTaskPriority,
                dueDate: newTaskDate,
                responsibleUser: selectedLead.owner || "Quinzinho",
                status: "pending",
                type: "Manual",
                linkedLeadId: selectedLead.id,
              });
              setIsCreateTaskOpen(false);
              setNewTaskTitle("");
              setNewTaskPriority("schedule");
              setNewTaskDate(new Date().toISOString().split('T')[0]);
            }}>Criar Tarefa</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
