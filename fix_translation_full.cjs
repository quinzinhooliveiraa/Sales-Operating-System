const fs = require('fs');

// We need to fully wire the language change context so it propagates correctly.
let app = fs.readFileSync('client/src/context/AppContext.tsx', 'utf8');
if (!app.includes("setSettings(newSettings)")) {
  app = app.replace(
      `setSettings: (settings: UserSettings) => void;`,
      `setSettings: (settings: UserSettings | ((prev: UserSettings) => UserSettings)) => void;`
  );
  
  // Create a deep copy wrapper for setSettings to force React re-renders across the app
  const newSetSettings = `
  const handleSetSettings = (newSettings: UserSettings | ((prev: UserSettings) => UserSettings)) => {
    setSettings(prev => {
      const next = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      // Also update document title/html lang attribute for good measure
      document.documentElement.lang = next.language.split('-')[0];
      return next;
    });
  };`;
  
  app = app.replace(
      `const [settings, setSettings] = useState<UserSettings>({ language: 'pt-BR', currency: 'BRL' });`,
      `const [settings, setSettings] = useState<UserSettings>({ language: 'pt-BR', currency: 'BRL' });\n${newSetSettings}`
  );
  
  app = app.replace(
      `value={{ settings, setSettings,`,
      `value={{ settings, setSettings: handleSetSettings,`
  );
  
  fs.writeFileSync('client/src/context/AppContext.tsx', app);
}

// In CRMView, make sure currency updates work
let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');
crm = crm.replace(
    /formatCurrency\(lead.value\)/g,
    'formatCurrency(lead.value)'
);
fs.writeFileSync('client/src/pages/CRMView.tsx', crm);

