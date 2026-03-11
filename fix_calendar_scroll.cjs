const fs = require('fs');

let content = fs.readFileSync('client/src/pages/CalendarView.tsx', 'utf8');

// Fix styling to make calendar actually scroll correctly and avoid weird viewport issues
// Making the calendar area strictly bounded so the internal area scrolls
content = content.replace(/className="flex-1 flex overflow-hidden"/g, 'className="flex-1 flex overflow-hidden min-h-0"');
content = content.replace(/className="flex-1 flex flex-col overflow-hidden bg-background relative"/g, 'className="flex-1 flex flex-col overflow-hidden bg-background relative min-w-0"');

fs.writeFileSync('client/src/pages/CalendarView.tsx', content);
console.log('Done');
