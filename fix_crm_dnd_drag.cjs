const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// I need to add a drag handle state so we only drag the stage when clicking on the drag icon, 
// not when typing in the input.

// A better way is to just let the drag handle element be draggable, or use a drag handler.
// Actually, setting `draggable={true}` on the input made the input draggable instead of the container. We want the container to be draggable.
// Let's revert the input and just use `draggable` on the parent div. To fix inputs inside a draggable div, usually stopping propagation on pointerdown or similar works, but in HTML5 DND, the input just works normally unless you drag it.

const inputOld = `<Input 
                          value={stage.name} 
                          onChange={(e) => handleUpdateStage(stage.id, 'name', e.target.value)}
                          onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          draggable={true}
                          className="h-11 text-base font-semibold w-full sm:max-w-[350px] bg-background text-foreground" 
                        />`;
const inputNew = `<Input 
                          value={stage.name} 
                          onChange={(e) => handleUpdateStage(stage.id, 'name', e.target.value)}
                          onDragStart={(e) => e.stopPropagation()}
                          className="h-11 text-base font-semibold w-full sm:max-w-[350px] bg-background text-foreground" 
                        />`;
content = content.replace(inputOld, inputNew);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
