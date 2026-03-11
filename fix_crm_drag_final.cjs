const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// Also stop drag propagation on the selects inside the card just to be safe
const selectOld1 = `                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                          value={stage.scenarioType || ''}
                          onChange={(e) => handleUpdateStage(stage.id, 'scenarioType', e.target.value)}
                        >`;
const selectNew1 = `                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                          value={stage.scenarioType || ''}
                          onChange={(e) => handleUpdateStage(stage.id, 'scenarioType', e.target.value)}
                          onDragStart={(e) => e.stopPropagation()}
                        >`;
content = content.replace(selectOld1, selectNew1);

// We need to add the draggable property to the card itself if it doesn't have it
const cardOld = `<div key={stage.id} className="border rounded-xl p-5 sm:p-6 bg-card shadow-sm space-y-5">`;
const cardNew = `<div 
                    key={stage.id} 
                    className={\`border rounded-xl p-5 sm:p-6 bg-card shadow-sm space-y-5 \${draggedStageId === stage.id ? 'opacity-50 border-primary' : ''}\`}
                    draggable
                    onDragStart={(e) => handleStageDragStart(e, stage.id)}
                    onDragOver={handleStageDragOver}
                    onDrop={(e) => handleStageDrop(e, stage.id)}
                    onDragEnd={handleStageDragEnd}
                  >`;
content = content.replace(cardOld, cardNew);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
console.log('Final drag fix applied');
