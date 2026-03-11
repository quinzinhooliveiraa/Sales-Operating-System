const fs = require('fs');
let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

if (crm.includes('const [movePrompt, setMovePrompt] = useState<{isOpen: boolean, leadId: number | null, targetStageId: string | null}>({isOpen: false, leadId: null, targetStageId: null});')) {
  // It's possible there are still duplicates
  let count = (crm.match(/const \[movePrompt, setMovePrompt\] = useState/g) || []).length;
  if (count > 1) {
    console.log("Found duplicate movePrompt");
    crm = crm.replace('  const [movePrompt, setMovePrompt] = useState<{isOpen: boolean, leadId: number | null, targetStageId: string | null}>({isOpen: false, leadId: null, targetStageId: null});\n', '');
    fs.writeFileSync('client/src/pages/CRMView.tsx', crm);
  } else {
    console.log("Only one movePrompt found");
  }
}
