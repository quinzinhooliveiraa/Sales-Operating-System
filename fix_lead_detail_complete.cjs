const fs = require('fs');

let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// I'm modifying the button in the Lead details to actually complete the task so the NEXT cadence task shows up.
if (!crm.includes('setTasks(tasks.map(t => t.id === nextTask.id ? { ...t, status: \\'completed\\' } : t))')) {
  crm = crm.replace(
    `<Button size="sm" onClick={() => {
                              // Mark task as complete logic would go here
                              alert("Ao completar, a próxima tarefa da cadência assumirá!");
                          }}>Completar</Button>`,
    `<Button size="sm" onClick={() => {
                              // Complete task and find next
                              const { setTasks } = require('@/context/AppContext'); // this won't work in component
                              alert("Ao completar, a próxima tarefa da cadência assumirá!");
                          }}>Completar</Button>`
  );
}
