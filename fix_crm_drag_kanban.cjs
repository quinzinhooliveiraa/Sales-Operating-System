const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// Also ensure drag over works right for columns in Kanban.
// React onDragOver requires preventing default to ALLOW drops. 
const onDragOverCode = `                onDragOver={(e) => {
                  if (draggedStageId) {
                    handleStageDragOver(e);
                  } else {
                    handleDragOver(e);
                  }
                }}`;
// To make it fully clear
const newOnDragOverCode = `                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedStageId) {
                    handleStageDragOver(e);
                  } else {
                    handleDragOver(e);
                  }
                }}`;
content = content.replace(onDragOverCode, newOnDragOverCode);

// Same inside the modal list:
const modalDragOver = `onDragOver={handleStageDragOver}`;
const newModalDragOver = `onDragOver={(e) => { e.preventDefault(); handleStageDragOver(e); }}`;
content = content.replace(modalDragOver, newModalDragOver);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
