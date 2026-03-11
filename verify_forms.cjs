const fs = require('fs');

// Scheduling view to Calendar Events
let scheduling = fs.readFileSync('client/src/pages/SchedulingView.tsx', 'utf8');

// I need to connect the creation of meetings in SchedulingView to the AppContext so they show up in CalendarView and Dashboard.
let appContextContext = `import { useAppContext } from "@/context/AppContext";`;
if (!scheduling.includes(appContextContext)) {
  const schedContextOld = `export default function SchedulingView() {`;
  const schedContextNew = `import { useAppContext } from "@/context/AppContext";\n\nexport default function SchedulingView() {
  const { addEvent } = useAppContext();`;
  scheduling = scheduling.replace(schedContextOld, schedContextNew);
  fs.writeFileSync('client/src/pages/SchedulingView.tsx', scheduling);
  console.log('SchedulingView wired');
}

