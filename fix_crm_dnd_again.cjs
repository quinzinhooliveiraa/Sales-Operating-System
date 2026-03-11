const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// I need to ensure the drag and drop works correctly. 
// The bug might be because I used onDragOver but didn't preventDefault properly in a way that allows dropping, 
// or because the drag events are not propagating correctly in React.
// Let's improve the drag and drop handlers to be more robust.

const handlersOld = `  const handleStageDragStart = (e: React.DragEvent, stageId: string) => {
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
  };`;

const handlersNew = `  const handleStageDragStart = (e: React.DragEvent, stageId: string) => {
    setDraggedStageId(stageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleStageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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

  const handleStageDragEnd = () => {
    setDraggedStageId(null);
  };`;

content = content.replace(handlersOld, handlersNew);

// Make sure the handleStageDragEnd is added to the div
const divOld = `                    onDrop={(e) => handleStageDrop(e, stage.id)}
                    className={\`border rounded-xl p-5 sm:p-6 bg-card shadow-sm space-y-5 \${draggedStageId === stage.id ? 'opacity-50 border-primary' : ''}\`}`;
const divNew = `                    onDrop={(e) => handleStageDrop(e, stage.id)}
                    onDragEnd={handleStageDragEnd}
                    className={\`border rounded-xl p-5 sm:p-6 bg-card shadow-sm space-y-5 \${draggedStageId === stage.id ? 'opacity-50 border-primary' : ''}\`}`;

content = content.replace(divOld, divNew);

// Change the drag handle to be explicitly on the icon and make the whole card draggable only when grabbing the icon
// Actually HTML5 drag and drop requires `draggable={true}` on the element being dragged.
// But to prevent random dragging when typing in the input, we should ensure the input doesn't trigger it, or just use a drag handle correctly.
// A simpler approach for React DND without a library is making the whole item draggable but stopping propagation on inputs.
// Since we only have inputs inside, it should be fine. But let's verify.
// Wait, the input might be stealing the mouse events.

const inputOld = `<Input 
                          value={stage.name} 
                          onChange={(e) => handleUpdateStage(stage.id, 'name', e.target.value)}
                          className="h-11 text-base font-semibold w-full sm:max-w-[350px] bg-background text-foreground" 
                        />`;
const inputNew = `<Input 
                          value={stage.name} 
                          onChange={(e) => handleUpdateStage(stage.id, 'name', e.target.value)}
                          onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          draggable={true}
                          className="h-11 text-base font-semibold w-full sm:max-w-[350px] bg-background text-foreground" 
                        />`;
content = content.replace(inputOld, inputNew);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
console.log('Fixed DND');
