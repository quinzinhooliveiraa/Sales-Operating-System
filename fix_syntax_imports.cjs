const fs = require('fs');

// Fix TasksView.tsx
let tasks = fs.readFileSync('client/src/pages/TasksView.tsx', 'utf8');
tasks = tasks.replace(/import \{ useAppContext \} from "@\/context\/AppContext";\n\nimport \{ useAppContext \} from "@\/context\/AppContext";/g, 'import { useAppContext } from "@/context/AppContext";');
tasks = tasks.replace(/import type \{ Task, Priority \} from "@\/context\/AppContext";\n\nimport \{ useAppContext \} from "@\/context\/AppContext";/, 'import { useAppContext, type Task, type Priority } from "@/context/AppContext";');
fs.writeFileSync('client/src/pages/TasksView.tsx', tasks);

// Fix CalendarView.tsx
let calendar = fs.readFileSync('client/src/pages/CalendarView.tsx', 'utf8');
calendar = calendar.replace(/import \{ useAppContext \} from "@\/context\/AppContext";\n\nimport \{ useAppContext \} from "@\/context\/AppContext";/g, 'import { useAppContext } from "@/context/AppContext";');
fs.writeFileSync('client/src/pages/CalendarView.tsx', calendar);

