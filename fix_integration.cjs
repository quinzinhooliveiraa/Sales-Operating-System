const fs = require('fs');
let dashboard = fs.readFileSync('client/src/pages/Dashboard.tsx', 'utf8');
let tasks = fs.readFileSync('client/src/pages/TasksView.tsx', 'utf8');
let calendar = fs.readFileSync('client/src/pages/CalendarView.tsx', 'utf8');

// I need to update Dashboard, Tasks, and Calendar to pull data directly from AppContext instead of static mocks.

// Dashboard.tsx
dashboard = dashboard.replace(/const INITIAL_LEADS/g, '// const INITIAL_LEADS');
const dashboardContextOld = `export default function Dashboard() {`;
const dashboardContextNew = `import { useAppContext } from "@/context/AppContext";

export default function Dashboard() {
  const { leads, tasks, events } = useAppContext();
  
  // Calculate overdue touches based on tasks
  const pendingCadenceTasks = tasks.filter(t => t.type === 'Cadência Automática' && t.status === 'pending');
  const overdueTouches = pendingCadenceTasks.filter(t => new Date(t.dueDate) < new Date()).length;
  
  // Get upcoming meetings
  const today = new Date().toISOString().split('T')[0];
  const upcomingMeetings = events.filter(e => e.type === 'meeting' && e.date >= today).sort((a,b) => a.date.localeCompare(b.date));
`;
dashboard = dashboard.replace(dashboardContextOld, dashboardContextNew);

// In Dashboard: metrics and loops
dashboard = dashboard.replace(/<div className="text-2xl font-bold">12<\/div>/g, `<div className="text-2xl font-bold">{leads.filter(l => l.stage === 'new').length}</div>`);
dashboard = dashboard.replace(/<div className="text-2xl font-bold">4<\/div>/g, `<div className="text-2xl font-bold">{events.filter(e => e.type === 'meeting').length}</div>`);
dashboard = dashboard.replace(/<div className="text-2xl font-bold">18<\/div>/g, `<div className="text-2xl font-bold">{tasks.filter(t => t.status === 'pending').length}</div>`);
dashboard = dashboard.replace(/<p className="text-xs text-destructive\/80 font-medium mt-1">5 follow-ups atrasados<\/p>/g, `<p className="text-xs text-destructive/80 font-medium mt-1">{overdueTouches} follow-ups atrasados</p>`);

// Update the Cadence mapping in dashboard
const dashboardCadenceListOld = `const overdueCadences = [
    { time: "Atrasado", title: "Ligar para Acme Corp (Touch 2)", type: "call", priority: "high", contact: "Sarah M." },
    { time: "10:00", title: "Enviar email de follow-up: TechFlow (Touch 3)", type: "email", priority: "medium", contact: "Mike T." },
    { time: "14:30", title: "Mensagem no LinkedIn: Global Ind.", type: "message", priority: "normal", contact: "Alex P." },
  ];`;
const dashboardCadenceListNew = `const overdueCadences = pendingCadenceTasks.map(t => ({
    id: t.id,
    time: t.dueDate < today ? "Atrasado" : "Hoje",
    title: t.title,
    type: t.title.toLowerCase().includes("ligar") ? "call" : t.title.toLowerCase().includes("email") ? "email" : "message",
    priority: t.dueDate < today ? "high" : "medium",
    contact: leads.find(l => l.id === t.linkedLeadId)?.name || "Lead"
  })).slice(0, 5);`;
dashboard = dashboard.replace(dashboardCadenceListOld, dashboardCadenceListNew);

const dashCadenceMapOld = `overdueCadences.map((task, i) => (`;
const dashCadenceMapNew = `overdueCadences.map((task, i) => (`;

// TasksView.tsx
const tasksContextOld = `export default function TasksView() {`;
const tasksContextNew = `import { useAppContext } from "@/context/AppContext";

export default function TasksView() {
  const { tasks, setTasks, leads } = useAppContext();
  
  const handleCompleteTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
  };
`;
tasks = tasks.replace(tasksContextOld, tasksContextNew);

// Replace INITIAL_TASKS in TasksView with context
const tasksListOld = `const TASKS = [
    { id: 1, title: "Ligar para Acme Corp", time: "Hoje, 10:00", type: "call", status: "pending", priority: "do-now" },
    { id: 2, title: "Preparar proposta TechFlow", time: "Hoje, 14:00", type: "task", status: "pending", priority: "schedule" },
    { id: 3, title: "Follow-up email Global Ind.", time: "Amanhã, 09:00", type: "email", status: "pending", priority: "delegate" },
    { id: 4, title: "Atualizar CRM com notas da call", time: "Sem data", type: "task", status: "completed", priority: "eliminate" },
  ];`;
const tasksListNew = `// Using tasks from context`;
tasks = tasks.replace(tasksListOld, tasksListNew);

// Find the map over TASKS
tasks = tasks.replace(/TASKS\.filter/g, `tasks.filter`);
tasks = tasks.replace(/task\.time/g, `task.dueDate`);
tasks = tasks.replace(/type === "call"/g, `title.toLowerCase().includes('ligar')`);
tasks = tasks.replace(/type === "email"/g, `title.toLowerCase().includes('email')`);
// Fix toggle complete
tasks = tasks.replace(/<button className=\{`w-5 h-5 rounded-full border flex items-center justify-center \${task.status === 'completed'/g, `<button onClick={() => handleCompleteTask(task.id)} className={\`w-5 h-5 rounded-full border flex items-center justify-center \${task.status === 'completed'`);


// CalendarView.tsx
const calendarContextOld = `export default function CalendarView() {`;
const calendarContextNew = `import { useAppContext } from "@/context/AppContext";

export default function CalendarView() {
  const { events, leads } = useAppContext();
`;
calendar = calendar.replace(calendarContextOld, calendarContextNew);

const calendarEventsOld = `const SCHEDULED_EVENTS = [
    { id: 1, title: "Call de Descoberta - Acme", time: "10:00 - 11:00", type: "meeting", top: "100px", height: "60px", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { id: 2, title: "Demo TechFlow", time: "14:00 - 15:00", type: "meeting", top: "340px", height: "60px", color: "bg-primary/20 text-primary border-primary/30" },
    { id: 3, title: "Follow-up Cadência", time: "16:30 - 17:00", type: "task", top: "490px", height: "30px", color: "bg-secondary text-foreground border-border" },
  ];`;
const calendarEventsNew = `const SCHEDULED_EVENTS = events.map(e => {
    return {
      id: e.id,
      title: e.title,
      time: \`\${e.hour}:00 - \${e.hour + e.duration}:00\`,
      type: e.type,
      top: \`\${(e.hour - 8) * 60 + 40}px\`, // Assuming starts at 8AM
      height: \`\${e.duration * 60}px\`,
      color: e.type === 'meeting' ? "bg-primary/20 text-primary border-primary/30" : "bg-secondary text-foreground border-border"
    };
  });`;
calendar = calendar.replace(calendarEventsOld, calendarEventsNew);

fs.writeFileSync('client/src/pages/Dashboard.tsx', dashboard);
fs.writeFileSync('client/src/pages/TasksView.tsx', tasks);
fs.writeFileSync('client/src/pages/CalendarView.tsx', calendar);

console.log('Integrations added');
