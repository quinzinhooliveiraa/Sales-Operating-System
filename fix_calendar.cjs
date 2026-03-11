const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CalendarView.tsx', 'utf8');

// Fix specific Tailwind colors
content = content.replace(/bg-background/g, 'bg-background');
content = content.replace(/bg-blue-600/g, 'bg-primary');
content = content.replace(/text-blue-500/g, 'text-primary');
content = content.replace(/bg-emerald-600/g, 'bg-primary');
content = content.replace(/bg-blue-500\/20/g, 'bg-primary/20');
content = content.replace(/hover:bg-blue-700/g, 'hover:bg-primary/90');

fs.writeFileSync('client/src/pages/CalendarView.tsx', content);
console.log('Done');
