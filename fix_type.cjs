const fs = require('fs');

// Fix task lead matching property that LSP complained about
let tasks = fs.readFileSync('client/src/pages/TasksView.tsx', 'utf8');
tasks = tasks.replace(
  /const lead = leads\.find\(l => l\.name === task\.contact\);/g,
  'const lead = leads.find(l => l.id === task.linkedLeadId);'
);
fs.writeFileSync('client/src/pages/TasksView.tsx', tasks);
