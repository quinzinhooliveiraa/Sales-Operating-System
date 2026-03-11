const fs = require('fs');

// Ensure other files like Dashboard use the global translations
let dash = fs.readFileSync('client/src/pages/Dashboard.tsx', 'utf8');

// Remove the local getTranslations function
dash = dash.replace(/const getTranslations = \(lang: string\) => \{[\s\S]*?^\};/m, '');

// The dashboard is already using "const t = getTranslations..." we need to switch it to the context 't'
dash = dash.replace(
  `const { leads, tasks, events, settings } = useAppContext();\n  const t = getTranslations(settings?.language || 'pt-BR');`,
  `const { leads, tasks, events, settings, t } = useAppContext();`
);

fs.writeFileSync('client/src/pages/Dashboard.tsx', dash);

// Update some elements in CRMView to actually use the 't' object we added
let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

crm = crm.replace(/>Criar Lead</g, '>{t.addLeadBtn}<');
crm = crm.replace(/placeholder="Buscar leads..."/g, 'placeholder={t.searchLeads}');
crm = crm.replace(/>Gerenciar Pipeline</g, '>{t.managePipeline}<');
crm = crm.replace(/>Novo Lead</g, '>{t.newLead}<');

fs.writeFileSync('client/src/pages/CRMView.tsx', crm);
console.log("Dashboard and CRM using global translations");
