const fs = require('fs');

let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// Ensure that t is used correctly in the placeholder
crm = crm.replace(/placeholder=\{t\.searchLeads\}/g, 'placeholder={t?.searchLeads || "Buscar leads..."}');
crm = crm.replace(/>\{t\.addLeadBtn\}</g, '>{t?.addLeadBtn || "Criar Lead"}<');
crm = crm.replace(/>\{t\.managePipeline\}</g, '>{t?.managePipeline || "Gerenciar Pipeline"}<');
crm = crm.replace(/>\{t\.newLead\}</g, '>{t?.newLead || "Novo Lead"}<');

fs.writeFileSync('client/src/pages/CRMView.tsx', crm);

