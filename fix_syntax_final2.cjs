const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// I accidentally added the hooks twice or there was already one.
// Let's remove duplicates.
const duplicateHook = `  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});
  
  const toggleStageCollapse = (stageId: string) => {
    setCollapsedStages(prev => ({ ...prev, [stageId]: !prev[stageId] }));
  };`;

// Use replace but only if there's multiple. It's safer to just do a smart regex replacement or indexOf check.
let hookIndex = content.indexOf(duplicateHook);
if (hookIndex !== -1) {
  let secondIndex = content.indexOf(duplicateHook, hookIndex + 1);
  if (secondIndex !== -1) {
    // Replace the second occurrence with empty string
    content = content.substring(0, secondIndex) + content.substring(secondIndex + duplicateHook.length);
  }
}

// Ensure the closing divs are correct
// Let's just make sure there are no other syntax errors.
fs.writeFileSync('client/src/pages/CRMView.tsx', content);
