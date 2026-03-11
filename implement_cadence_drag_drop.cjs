const fs = require('fs');

let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// Ensure handleAddLead calls addLead from context, not setLeads directly (to trigger cadence)
crm = crm.replace(
  `setLeads([...leads, lead]);`,
  `addLead(lead);`
);

// We need to implement the prompt for drag and drop to restart cadence.
// We added the movePrompt state and dialog, let's verify it works and is visible.
if (!crm.includes('movePrompt.isOpen')) {
  crm = crm.replace(
      `const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);`,
      `const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);\n  const [movePrompt, setMovePrompt] = useState<{isOpen: boolean, leadId: number | null, targetStageId: string | null}>({isOpen: false, leadId: null, targetStageId: null});`
  );
}

// In the onDrop handler
const onDropOld = `const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedLeadId) {
      updateLeadStage(draggedLeadId, stageId);
      setDraggedLeadId(null);
    }
  };`;
  
const onDropNew = `const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedLeadId) {
      const targetStage = stages.find(s => s.id === stageId);
      const lead = leads.find(l => l.id === draggedLeadId);
      
      // If moving to same stage, do nothing
      if (lead && lead.stage === stageId) {
        setDraggedLeadId(null);
        return;
      }
      
      if (targetStage && targetStage.cadence && targetStage.cadence.length > 0) {
        setMovePrompt({ isOpen: true, leadId: draggedLeadId, targetStageId: stageId });
      } else {
        // If no cadence in target stage, just move it normally without asking to restart tasks
        updateLeadStage(draggedLeadId, stageId, false);
      }
      setDraggedLeadId(null);
    }
  };`;

if (crm.includes(onDropOld)) {
  crm = crm.replace(onDropOld, onDropNew);
} else {
    // Attempt slightly looser replace
    crm = crm.replace(
        `updateLeadStage(draggedLeadId, stageId);\n      setDraggedLeadId(null);`,
        `const targetStage = stages.find(s => s.id === stageId);\n      const lead = leads.find(l => l.id === draggedLeadId);\n      if (lead && lead.stage === stageId) { setDraggedLeadId(null); return; }\n      if (targetStage && targetStage.cadence && targetStage.cadence.length > 0) {\n        setMovePrompt({ isOpen: true, leadId: draggedLeadId, targetStageId: stageId });\n      } else {\n        updateLeadStage(draggedLeadId, stageId, false);\n      }\n      setDraggedLeadId(null);`
    );
}

// Add the prompt dialog if it isn't there
if (!crm.includes('moveLeadPromptTitle')) {
  const moveDialog = `
      <Dialog open={movePrompt.isOpen} onOpenChange={(open) => !open && setMovePrompt({isOpen: false, leadId: null, targetStageId: null})}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.moveLeadPromptTitle || "Reiniciar Lembretes?"}</DialogTitle>
            <DialogDescription>
              {t.moveLeadPromptDesc || "Você moveu este lead. Deseja gerar novas tarefas de cadência para esta etapa ou manter as antigas?"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => {
              if (movePrompt.leadId && movePrompt.targetStageId) {
                updateLeadStage(movePrompt.leadId, movePrompt.targetStageId, false);
                setMovePrompt({isOpen: false, leadId: null, targetStageId: null});
              }
            }}>
              {t.keepCadence || "Manter Antigas"}
            </Button>
            <Button onClick={() => {
              if (movePrompt.leadId && movePrompt.targetStageId) {
                updateLeadStage(movePrompt.leadId, movePrompt.targetStageId, true);
                setMovePrompt({isOpen: false, leadId: null, targetStageId: null});
              }
            }}>
              {t.restartCadence || "Gerar Novas Tarefas"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    `;
    
    crm = crm.replace(
        `{/* Add Lead Form */}`,
        `${moveDialog}\n\n      {/* Add Lead Form */}`
    );
}

// Implement "Próximos Passos" in the Card
const cardOld = `<div className="mt-3 flex items-center justify-between">
                            <div className="flex -space-x-2">`;
const cardNew = `
                          {(() => {
                            const pendingTasksForLead = tasks.filter(t => t.linkedLeadId === lead.id && t.status === 'pending');
                            if (pendingTasksForLead.length > 0) {
                              const nextTask = pendingTasksForLead[0];
                              const isOverdue = new Date(nextTask.dueDate) < new Date(new Date().toISOString().split('T')[0]);
                              return (
                                <div className="mt-3 pt-2 border-t border-border/30">
                                  <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className="font-semibold text-muted-foreground uppercase tracking-wider">Próximo Passo:</span>
                                  </div>
                                  <div className="mt-1 flex items-start justify-between gap-1">
                                    <span className="text-xs font-medium leading-tight line-clamp-2">{nextTask.title}</span>
                                    <span className={\`text-[9px] px-1.5 py-0.5 rounded shrink-0 \${isOverdue ? 'bg-destructive/10 text-destructive font-bold' : 'bg-secondary text-muted-foreground'}\`}>
                                      {isOverdue ? (t.overdue || 'Atrasado') : nextTask.dueDate}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex -space-x-2">`;
                            
if (!crm.includes('Próximo Passo:')) {
    crm = crm.replace(cardOld, cardNew);
}

fs.writeFileSync('client/src/pages/CRMView.tsx', crm);
console.log("Drag & drop cadence restart prompt added. Next steps added to card.");

