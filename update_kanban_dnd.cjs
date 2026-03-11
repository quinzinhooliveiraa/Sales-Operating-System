const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// The main Kanban columns
const oldKanbanCol = `<div 
                key={stage.id} 
                className="w-72 flex flex-col bg-secondary/10 rounded-xl border border-border/50 shadow-sm"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >`;

const newKanbanCol = `<div 
                key={stage.id} 
                className={\`w-72 flex flex-col bg-secondary/10 rounded-xl border border-border/50 shadow-sm \${draggedStageId === stage.id ? 'opacity-50' : ''}\`}
                draggable
                onDragStart={(e) => {
                  // Only drag stage if we are dragging the header
                  if ((e.target as HTMLElement).closest('.lead-card')) {
                    e.preventDefault();
                    return;
                  }
                  handleStageDragStart(e, stage.id);
                }}
                onDragOver={(e) => {
                  if (draggedStageId) {
                    handleStageDragOver(e);
                  } else {
                    handleDragOver(e);
                  }
                }}
                onDrop={(e) => {
                  if (draggedStageId) {
                    handleStageDrop(e, stage.id);
                  } else {
                    handleDrop(e, stage.id);
                  }
                }}
                onDragEnd={handleStageDragEnd}
              >`;

content = content.replace(oldKanbanCol, newKanbanCol);

// We need to make sure lead cards have a class so we can distinguish
const leadCardOld = `className={\`bg-card border p-3 rounded-lg shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing group relative \${draggedLeadId === lead.id ? 'opacity-50' : ''}\`}`;
const leadCardNew = `className={\`lead-card bg-card border p-3 rounded-lg shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing group relative \${draggedLeadId === lead.id ? 'opacity-50' : ''}\`}`;
content = content.replace(leadCardOld, leadCardNew);

// Also need to fix the stop propagation on lead drag start to prevent dragging the column
const leadDragOld = `onDragStart={(e) => handleDragStart(e, lead.id)}`;
const leadDragNew = `onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, lead.id); }}`;
content = content.replace(leadDragOld, leadDragNew);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
