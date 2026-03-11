const fs = require('fs');

// We need to fix the React hook rendering error completely that caused "deu não" (didn't work)
// The issue is likely that "settings" state initialization was problematic or Layout was re-rendered badly.

let appContext = fs.readFileSync('client/src/context/AppContext.tsx', 'utf8');

// Ensure that language fallback doesn't crash
appContext = appContext.replace(
  `const handleSetSettings = (newSettings: UserSettings | ((prev: UserSettings) => UserSettings)) => {
    setSettings(prev => {
      const next = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      // Also update document title/html lang attribute for good measure
      document.documentElement.lang = next.language.split('-')[0];
      return next;
    });
  };`,
  `const handleSetSettings = (newSettings: UserSettings | ((prev: UserSettings) => UserSettings)) => {
    setSettings(prev => {
      const next = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      if (next && next.language) {
        document.documentElement.lang = next.language.split('-')[0];
      }
      return next;
    });
  };`
);

// Fix formatCurrency which was throwing error for nulls or undefined
appContext = appContext.replace(
  `const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
    if (isNaN(num)) return value.toString();
    
    return new Intl.NumberFormat(settings.language, {
      style: 'currency',
      currency: settings.currency,
      maximumFractionDigits: 0
    }).format(num);
  };`,
  `const formatCurrency = (value: number | string) => {
    if (!value) return "R$ 0";
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
    if (isNaN(num)) return typeof value === 'string' ? value : value.toString();
    
    return new Intl.NumberFormat(settings?.language || 'pt-BR', {
      style: 'currency',
      currency: settings?.currency || 'BRL',
      maximumFractionDigits: 0
    }).format(num);
  };`
);

fs.writeFileSync('client/src/context/AppContext.tsx', appContext);
console.log("Context fixed");

