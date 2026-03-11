const fs = require('fs');

let content = fs.readFileSync('client/src/pages/CalendarView.tsx', 'utf8');

// Fix horizontal misalignment between the days header and the grid body
// The header has w-16 for the timezone, but the grid body has w-16 for the time column 
// AND the grid body's left boundary is offset. Let's make sure both match perfectly.

content = content.replace(
  /<div className="absolute top-0 left-16 right-0 flex h-6 border-b border-border\/50 bg-background z-10">/g,
  '<div className="absolute top-0 left-16 right-0 flex h-6 border-b border-border/50 bg-background z-10">'
);

content = content.replace(
  /<div className="absolute top-6 left-16 right-0 flex bottom-0">/g,
  '<div className="absolute top-6 left-16 right-0 flex bottom-0">'
);

// Actually, the issue is that in the days header we have:
// <div className="w-16 shrink-0 flex flex-col justify-end pb-2">
// but it's wrapped in:
// <div className="flex shrink-0 ml-14 pt-4 pb-2 z-10 bg-background border-b border-border/50">
// We need to remove the `ml-14` from the header to match the grid body which doesn't have it

content = content.replace(
  /<div className="flex shrink-0 ml-14 pt-4 pb-2 z-10 bg-background border-b border-border\/50">/g,
  '<div className="flex shrink-0 pt-4 pb-2 z-10 bg-background border-b border-border/50">'
);

fs.writeFileSync('client/src/pages/CalendarView.tsx', content);
console.log('Fixed alignment');
