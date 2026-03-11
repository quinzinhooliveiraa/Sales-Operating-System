const fs = require('fs');

let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// I'll make absolutely sure currency updates everywhere, there were multiple values.
crm = crm.replace(/<div className="text-xs font-semibold">{lead\.value}<\/div>/g, '<div className="text-xs font-semibold">{typeof lead.value === "string" && lead.value.includes("R$") ? formatCurrency(lead.value) : formatCurrency(lead.value)}</div>');

crm = crm.replace(/<p className="text-sm font-medium mt-1">{selectedLead\.value}<\/p>/g, '<p className="text-sm font-medium mt-1">{typeof selectedLead.value === "string" ? formatCurrency(selectedLead.value) : formatCurrency(selectedLead.value)}</p>');

fs.writeFileSync('client/src/pages/CRMView.tsx', crm);

