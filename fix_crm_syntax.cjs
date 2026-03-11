const fs = require('fs');
let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// Identifier 'movePrompt' has already been declared.
// It seems the line was duplicated.
crm = crm.replace(
  `  const [movePrompt, setMovePrompt] = useState<{isOpen: boolean, leadId: number | null, targetStageId: string | null}>({isOpen: false, leadId: null, targetStageId: null});\n  const [movePrompt, setMovePrompt] = useState<{isOpen: boolean, leadId: number | null, targetStageId: string | null}>({isOpen: false, leadId: null, targetStageId: null});`,
  `  const [movePrompt, setMovePrompt] = useState<{isOpen: boolean, leadId: number | null, targetStageId: string | null}>({isOpen: false, leadId: null, targetStageId: null});`
);

fs.writeFileSync('client/src/pages/CRMView.tsx', crm);
console.log("Fixed duplicate declaration");
