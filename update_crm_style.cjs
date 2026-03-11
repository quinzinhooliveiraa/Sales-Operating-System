const fs = require('fs');

let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// The layout issue: The main outer container needs better styling and bounding
content = content.replace(
  /<div className="h-\[calc\(100vh-8rem\)\] flex flex-col space-y-4">/,
  '<div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">'
);

// We need to make sure the columns are properly spaced
content = content.replace(
  /<div className="flex gap-4 h-full min-w-max">/,
  '<div className="flex gap-4 h-full min-w-max px-1">'
);

// The columns shouldn't be so wide
content = content.replace(
  /className="w-80 flex flex-col bg-secondary\/20 rounded-xl border border-border\/50"/g,
  'className="w-72 flex flex-col bg-secondary/10 rounded-xl border border-border/50 shadow-sm"'
);

// We need to improve the Lead Card design to be cleaner
content = content.replace(
  /className={`bg-card border p-3\.5 rounded-lg shadow-sm hover:border-primary\/50 transition-all cursor-grab active:cursor-grabbing group relative \$\{draggedLeadId === lead\.id \? 'opacity-50' : ''\}`}/g,
  'className={`bg-card border p-3 rounded-lg shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing group relative ${draggedLeadId === lead.id ? \'opacity-50\' : \'\'}`}'
);

fs.writeFileSync('client/src/pages/CRMView.tsx', content);
console.log('CRM styles updated');
