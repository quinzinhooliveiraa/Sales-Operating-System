const fs = require('fs');

// 1. Update AppContext.tsx
let appContext = fs.readFileSync('client/src/context/AppContext.tsx', 'utf8');

// Replace type definition
appContext = appContext.replace(
  `export type CadenceAction = {
  type: 'call' | 'email' | 'message';
  intervalHours: number;
};`,
  `export type CadenceAction = {
  type: 'call' | 'email' | 'message';
  intervalValue: number;
  intervalUnit: 'minutes' | 'hours' | 'days' | 'months' | 'years';
};`
);

// Replace INITIAL_STAGES
appContext = appContext.replace(
  `cadence: [{ type: 'email', intervalHours: 0 }, { type: 'call', intervalHours: 24 }]`,
  `cadence: [{ type: 'email', intervalValue: 0, intervalUnit: 'minutes' }, { type: 'call', intervalValue: 1, intervalUnit: 'days' }]`
);
appContext = appContext.replace(
  `cadence: [{ type: 'call', intervalHours: 48 }]`,
  `cadence: [{ type: 'call', intervalValue: 2, intervalUnit: 'days' }]`
);
appContext = appContext.replace(
  `cadence: [{ type: 'email', intervalHours: 72 }, { type: 'call', intervalHours: 120 }]`,
  `cadence: [{ type: 'email', intervalValue: 3, intervalUnit: 'days' }, { type: 'call', intervalValue: 5, intervalUnit: 'days' }]`
);

// Helper function to calculate future date
const dateHelper = `
        const d = new Date();
        if (action.intervalUnit === 'minutes') d.setMinutes(d.getMinutes() + action.intervalValue);
        else if (action.intervalUnit === 'hours') d.setHours(d.getHours() + action.intervalValue);
        else if (action.intervalUnit === 'days') d.setDate(d.getDate() + action.intervalValue);
        else if (action.intervalUnit === 'months') d.setMonth(d.getMonth() + action.intervalValue);
        else if (action.intervalUnit === 'years') d.setFullYear(d.getFullYear() + action.intervalValue);
`;

// Replace date addition in addLead
appContext = appContext.replace(
  `const d = new Date();\n        d.setDate(d.getDate() + action.intervalHours / 24);`,
  dateHelper.trim()
);

// Replace date addition in updateLeadStage
appContext = appContext.replace(
  `const d = new Date();\n        d.setDate(d.getDate() + action.intervalHours / 24);`,
  dateHelper.trim()
);

fs.writeFileSync('client/src/context/AppContext.tsx', appContext);

// 2. Update CRMView.tsx
let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// Replace default pushes
crm = crm.replace(
  `return { ...s, cadence: [...s.cadence, { type: 'email', intervalHours: 24 }] };`,
  `return { ...s, cadence: [...s.cadence, { type: 'email', intervalValue: 1, intervalUnit: 'days' }] };`
);
crm = crm.replace(
  `currentTouches.push({ type: 'email', intervalHours: 24 });`,
  `currentTouches.push({ type: 'email', intervalValue: 1, intervalUnit: 'days' });`
);

// Replace handleUpdateTouch logic
crm = crm.replace(
  `newCadence[touchIndex] = { ...newCadence[touchIndex], [field]: field === 'intervalHours' ? Number(value) : value };`,
  `newCadence[touchIndex] = { ...newCadence[touchIndex], [field]: field === 'intervalValue' ? Number(value) : value };`
);

// Replace inputs in the render
const oldInput = `<Input 
                                          type="number" 
                                          className="w-20 h-8 text-xs" 
                                          value={action.intervalHours} 
                                          onChange={(e) => handleUpdateTouch(stage.id, i, 'intervalHours', e.target.value)}
                                        />
                                        <span className="text-xs text-muted-foreground">horas depois</span>`;

const newInput = `<Input 
                                          type="number" 
                                          className="w-16 h-8 text-xs" 
                                          value={action.intervalValue} 
                                          onChange={(e) => handleUpdateTouch(stage.id, i, 'intervalValue', e.target.value)}
                                        />
                                        <select 
                                          className="h-8 text-xs bg-transparent border border-border rounded-md px-2 focus:ring-1 focus:ring-primary outline-none"
                                          value={action.intervalUnit || 'days'}
                                          onChange={(e) => handleUpdateTouch(stage.id, i, 'intervalUnit', e.target.value)}
                                        >
                                          <option value="minutes" className="bg-background">Minuto(s)</option>
                                          <option value="hours" className="bg-background">Hora(s)</option>
                                          <option value="days" className="bg-background">Dia(s)</option>
                                          <option value="months" className="bg-background">Mês(es)</option>
                                          <option value="years" className="bg-background">Ano(s)</option>
                                        </select>
                                        <span className="text-xs text-muted-foreground">depois</span>`;

crm = crm.replace(oldInput, newInput);

fs.writeFileSync('client/src/pages/CRMView.tsx', crm);

console.log("Cadence intervals updated to support minutes, hours, days, months, and years.");
