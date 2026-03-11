const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// 1. Add state for stage drag and drop in the "Gerenciar Pipeline" modal
const stateHookPos = `  const [isRecordingNewLead, setIsRecordingNewLead] = useState(false);`;
const stateHookNew = `  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);
  const [isRecordingNewLead, setIsRecordingNewLead] = useState(false);`;
content = content.replace(stateHookPos, stateHookNew);

// 2. Add handlers for stage reordering
const handlersPos = `  const getScoreColor = (score: number) => {`;
const handlersNew = `  const handleStageDragStart = (e: React.DragEvent, stageId: string) => {
    setDraggedStageId(stageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleStageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

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

  const getScoreColor = (score: number) => {`;
content = content.replace(handlersPos, handlersNew);

// 3. Make stages draggable in the "Gerenciar Pipeline" modal
const stageRenderOld = `{stages.map((stage, index) => (
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
                      <Button variant="ghost" className="text-destructive hover:bg-destructive/10 gap-2 shrink-0 self-end sm:self-auto" onClick={() => handleRemoveStage(stage.id)}>
                        <Trash2 className="w-4 h-4"/> Remover Etapa
                      </Button>
                    </div>`;

const stageRenderNew = `{stages.map((stage, index) => (
                  <div 
                    key={stage.id} 
                    draggable
                    onDragStart={(e) => handleStageDragStart(e, stage.id)}
                    onDragOver={handleStageDragOver}
                    onDrop={(e) => handleStageDrop(e, stage.id)}
                    className={\`border rounded-xl p-5 sm:p-6 bg-card shadow-sm space-y-5 \${draggedStageId === stage.id ? 'opacity-50 border-primary' : ''}\`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex flex-col text-muted-foreground/50 cursor-move shrink-0 hover:text-foreground transition-colors">
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
                      <Button variant="ghost" className="text-destructive hover:bg-destructive/10 gap-2 shrink-0 self-end sm:self-auto" onClick={() => handleRemoveStage(stage.id)}>
                        <Trash2 className="w-4 h-4"/> Remover Etapa
                      </Button>
                    </div>`;
                    
content = content.replace(stageRenderOld, stageRenderNew);

// Fix the typo "*s*" in the button which was probably added by accident in the user text or UI somewhere.
// Let me grep for any stray "s" in the file to make sure it's gone.
// Since the prompt says "os botoes esta com o *s*", maybe they mean the button text has "s"? Let's search for " s " or something similar.
// Looking at the previous addTouch button:
// `<Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => handleAddTouch(stage.id)}>
// <Plus className="w-3.5 h-3.5" /> 1 Touch
// </Button>`

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
console.log('Drag and drop for stages added');
