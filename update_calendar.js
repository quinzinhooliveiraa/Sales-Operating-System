const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CalendarView.tsx', 'utf8');

// Replace standard light theme classes with Tailwind semantic classes for dark mode support
content = content.replace(/bg-white text-slate-900/g, 'bg-background text-foreground');
content = content.replace(/bg-white/g, 'bg-background');
content = content.replace(/border-gray-100/g, 'border-border/50');
content = content.replace(/border-gray-200/g, 'border-border/50');
content = content.replace(/border-gray-300/g, 'border-border/50');
content = content.replace(/text-gray-400/g, 'text-muted-foreground/40');
content = content.replace(/text-gray-500/g, 'text-muted-foreground');
content = content.replace(/text-gray-600/g, 'text-foreground');
content = content.replace(/text-gray-700/g, 'text-foreground');
content = content.replace(/text-gray-800/g, 'text-foreground');
content = content.replace(/hover:bg-gray-50/g, 'hover:bg-secondary/50');
content = content.replace(/hover:bg-gray-100/g, 'hover:bg-secondary/50');
content = content.replace(/bg-gray-100\/80/g, 'bg-secondary/30');
content = content.replace(/bg-blue-50 text-blue-700/g, 'bg-blue-500/20 text-blue-500');
content = content.replace(/text-blue-600/g, 'text-blue-500');

// Fix Layout height
content = content.replace(/h-\[calc\(100vh-6rem\)\]/g, 'h-[calc(100vh-3.5rem)]');

fs.writeFileSync('client/src/pages/CalendarView.tsx', content);
console.log('Done');
