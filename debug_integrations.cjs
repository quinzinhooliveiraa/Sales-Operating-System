const fs = require('fs');

// Check AppContext.tsx to see what's actually there
let appContext = fs.readFileSync('client/src/context/AppContext.tsx', 'utf8');

console.log("--- APP CONTEXT INTEGRATION CHECK ---");
if (appContext.includes('updateLeadStage: (leadId: number, stageId: string) => void;')) {
    console.log("updateLeadStage is present");
}
if (appContext.includes('addLead: (lead: Omit<Lead, \\'id\\'>) => Lead;')) {
    console.log("addLead is present");
}
if (appContext.includes('addTask: (task: Omit<Task, \\'id\\'>) => Task;')) {
    console.log("addTask is present");
}
if (appContext.includes('formatCurrency: (value: number | string) => string;')) {
    console.log("formatCurrency is present");
}

let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');
console.log("--- CRM VIEW INTEGRATION CHECK ---");
if (crm.includes('updateLeadStage(draggedLeadId, stageId);')) {
    console.log("Drag & drop updates global context");
}
if (crm.includes('addLead(')) {
    console.log("Adding lead uses global context");
}

let tasks = fs.readFileSync('client/src/pages/TasksView.tsx', 'utf8');
console.log("--- TASKS VIEW INTEGRATION CHECK ---");
if (tasks.includes('const { tasks, setTasks, leads } = useAppContext();')) {
    console.log("Tasks read from context");
}
if (!tasks.includes('const TASKS = [')) {
    console.log("Tasks static mock removed");
}

let calendar = fs.readFileSync('client/src/pages/CalendarView.tsx', 'utf8');
console.log("--- CALENDAR VIEW INTEGRATION CHECK ---");
if (calendar.includes('const { events, leads, addEvent, addTask } = useAppContext();')) {
    console.log("Calendar reads from context");
}
if (!calendar.includes('const SCHEDULED_EVENTS = [')) {
    console.log("Calendar static mock removed");
}

let dashboard = fs.readFileSync('client/src/pages/Dashboard.tsx', 'utf8');
console.log("--- DASHBOARD INTEGRATION CHECK ---");
if (dashboard.includes('const { leads, tasks, events } = useAppContext();')) {
    console.log("Dashboard reads from context");
}

