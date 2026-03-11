const fs = require('fs');

let layout = fs.readFileSync('client/src/components/layout/Layout.tsx', 'utf8');

// The Layout sidebar was using its own local getTranslations. Let's make it use the context 't'.
layout = layout.replace(/const getTranslations = \(lang: string\) => \{[\s\S]*?^\};/m, '');
layout = layout.replace(
  `const { settings } = useAppContext();\n  const lang = settings?.language || 'pt-BR';\n  const t = getTranslations(lang);`,
  `const { t } = useAppContext();`
);
fs.writeFileSync('client/src/components/layout/Layout.tsx', layout);
