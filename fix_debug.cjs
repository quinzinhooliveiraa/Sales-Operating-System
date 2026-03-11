const fs = require('fs');

let appContext = fs.readFileSync('client/src/context/AppContext.tsx', 'utf8');
console.log("--- APP CONTEXT ---");
console.log("Has updateLeadStage: " + appContext.includes('updateLeadStage: (leadId: number, stageId: string) => void;'));
console.log("Has addLead: " + appContext.includes('addLead: (lead: Omit<Lead, \'id\'>) => Lead;'));
console.log("Has formatCurrency: " + appContext.includes('formatCurrency: (value: number | string) => string;'));

let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');
console.log("--- CRM ---");
console.log("Has updateLeadStage use: " + crm.includes('updateLeadStage(draggedLeadId, stageId);'));

