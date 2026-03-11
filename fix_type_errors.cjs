const fs = require('fs');

// Fix task lead matching property
let tasks = fs.readFileSync('client/src/pages/TasksView.tsx', 'utf8');
tasks = tasks.replace(
  /const lead = leads\.find\(l => l\.name === task\.contact\);/g,
  'const lead = leads.find(l => l.id === task.linkedLeadId);'
);
fs.writeFileSync('client/src/pages/TasksView.tsx', tasks);

// Fix Calendar type issues
let calendar = fs.readFileSync('client/src/pages/CalendarView.tsx', 'utf8');
calendar = calendar.replace(/let daysToRender = \[\];/g, 'let daysToRender: any[] = [];');
calendar = calendar.replace(/event.type === 'crm'/g, 'event.type === \'task\'');
fs.writeFileSync('client/src/pages/CalendarView.tsx', calendar);

