const fs = require('fs');

let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// The issue right now is that I used t.moveLeadPromptTitle which might not exist right away if 't' is undefined in context.
// Let's make sure it handles undefined safely in CRMView.tsx
if (!crm.includes('t?.moveLeadPromptTitle')) {
    crm = crm.replace(/\{t\.moveLeadPromptTitle/g, '{t?.moveLeadPromptTitle');
    crm = crm.replace(/\{t\.moveLeadPromptDesc/g, '{t?.moveLeadPromptDesc');
    crm = crm.replace(/\{t\.keepCadence/g, '{t?.keepCadence');
    crm = crm.replace(/\{t\.restartCadence/g, '{t?.restartCadence');
    crm = crm.replace(/\{t\.overdue/g, '{t?.overdue');
    fs.writeFileSync('client/src/pages/CRMView.tsx', crm);
}
