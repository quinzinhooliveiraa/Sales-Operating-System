const fs = require('fs');

let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

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
                                      {isOverdue ? (t?.overdue || 'Atrasado') : nextTask.dueDate}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex -space-x-2">`;

if (crm.includes(cardOld)) {
    crm = crm.replace(cardOld, cardNew);
    fs.writeFileSync('client/src/pages/CRMView.tsx', crm);
    console.log("Next step added");
} else if (crm.includes('Próximo Passo:')) {
    console.log("Next step already exists. We should check if it's being rendered correctly.");
} else {
    console.log("Could not find insertion point.");
}

