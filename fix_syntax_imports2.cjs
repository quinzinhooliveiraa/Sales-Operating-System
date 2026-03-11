const fs = require('fs');

// Fix TasksView.tsx
let tasks = fs.readFileSync('client/src/pages/TasksView.tsx', 'utf8');
tasks = tasks.replace(/import \{ useAppContext \} from "@\/context\/AppContext";\n\nimport \{ useAppContext, type Task, type Priority \} from "@\/context\/AppContext";/g, 'import { useAppContext, type Task, type Priority } from "@/context/AppContext";');
tasks = tasks.replace(/import type \{ Task, Priority \} from "@\/context\/AppContext";\n\nimport \{ useAppContext \} from "@\/context\/AppContext";/g, 'import { useAppContext, type Task, type Priority } from "@/context/AppContext";');
// Fallback if the previous replacements didn't catch it
let taskLines = tasks.split('\n');
taskLines = taskLines.filter(line => !line.includes('import { useAppContext } from "@/context/AppContext";') && !line.includes('import type { Task, Priority } from "@/context/AppContext";'));
taskLines.unshift('import { useAppContext, type Task, type Priority } from "@/context/AppContext";');
fs.writeFileSync('client/src/pages/TasksView.tsx', taskLines.join('\n'));

// Fix CalendarView.tsx
let calendar = fs.readFileSync('client/src/pages/CalendarView.tsx', 'utf8');
let calendarLines = calendar.split('\n');
calendarLines = calendarLines.filter(line => !line.includes('import { useAppContext } from "@/context/AppContext";'));
calendarLines.unshift('import { useAppContext } from "@/context/AppContext";');
fs.writeFileSync('client/src/pages/CalendarView.tsx', calendarLines.join('\n'));

