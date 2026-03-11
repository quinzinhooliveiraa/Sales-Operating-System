const fs = require('fs');

// Verify integration in CRMView.tsx
let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

if (!crm.includes('updateLeadStage(draggedLeadId, stageId);')) {
  console.log('CRM updateLeadStage missing');
} else {
  console.log('CRM updateLeadStage found');
}

// In CRMView.tsx, check if handleAddLead calls addTask or addEvent if there's a cadence
// In AppContext, updateLeadStage handles the cadence automation.
// But what about when a lead is created? It goes to "new" stage. Let's make sure it triggers updateLeadStage logic.
let appContext = fs.readFileSync('client/src/context/AppContext.tsx', 'utf8');
if (appContext.includes('setLeads(prev => [...prev, newLead]);')) {
    console.log('AppContext addLead found');
} else {
    // Need to update AppContext to expose addLead which also fires cadence for the initial stage
    appContext = appContext.replace(
      `updateLeadStage: (leadId: number, stageId: string) => void;`,
      `updateLeadStage: (leadId: number, stageId: string) => void;\n  addLead: (lead: Omit<Lead, 'id'>) => Lead;`
    );
    appContext = appContext.replace(
      `addTask: (task: Omit<Task, 'id'>) => void;`,
      `addTask: (task: Omit<Task, 'id'>) => Task;`
    );
    appContext = appContext.replace(
      `addEvent: (event: Omit<CalendarEvent, 'id'>) => void;`,
      `addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;`
    );
    
    const addLeadFunc = `
  const addLead = (lead: Omit<Lead, 'id'>) => {
    const newLead = { ...lead, id: Math.floor(Math.random() * 100000) } as Lead;
    setLeads(prev => [...prev, newLead]);
    
    // Auto-trigger cadence for initial stage
    const stage = stages.find(s => s.id === newLead.stage);
    if (stage && stage.cadence && stage.cadence.length > 0) {
      stage.cadence.forEach((action, idx) => {
        const d = new Date();
        d.setDate(d.getDate() + action.intervalHours / 24);
        const actionText = action.type === 'call' ? 'Ligar para' : action.type === 'email' ? 'Email para' : 'Mensagem para';
        const newTask = addTask({
          title: \`\${actionText} \${newLead.name} (Touch \${idx + 1})\`,
          description: \`Gerado automaticamente ao criar lead na etapa \${stage.name}\`,
          priority: 'do-now',
          dueDate: d.toISOString().split('T')[0],
          responsibleUser: newLead.owner || 'Quinzinho',
          status: 'pending',
          type: 'Cadência Automática',
          linkedLeadId: newLead.id,
          linkedStageId: newLead.stage
        });
        
        if (action.type === 'call') {
            addEvent({
              title: \`[Tarefa] \${actionText} \${newLead.name}\`,
              date: d.toISOString().split('T')[0],
              hour: 9 + (idx % 8), // Spread hours a bit
              duration: 0.5,
              type: 'task',
              linkedLeadId: newLead.id,
              linkedTaskId: newTask.id,
              style: "border-muted-foreground bg-secondary text-muted-foreground"
            });
        }
      });
    }
    
    return newLead;
  };
`;
    appContext = appContext.replace(
      `const updateLeadStage = (leadId: number, stageId: string) => {`,
      `${addLeadFunc}\n  const updateLeadStage = (leadId: number, stageId: string) => {`
    );
    appContext = appContext.replace(
      `<AppContext.Provider value={{ stages, setStages, leads, setLeads, tasks, setTasks, events, setEvents, updateLeadStage, addTask, addEvent }}>`,
      `<AppContext.Provider value={{ stages, setStages, leads, setLeads, tasks, setTasks, events, setEvents, updateLeadStage, addTask, addEvent, addLead }}>`
    );
    fs.writeFileSync('client/src/context/AppContext.tsx', appContext);
    console.log('AppContext addLead added');
}

// Update CRMView to use addLead from context instead of just setLeads
crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');
if (!crm.includes('const { stages, setStages, leads, setLeads, updateLeadStage, addLead } = useAppContext();')) {
    crm = crm.replace(
        `const { stages, setStages, leads, setLeads, updateLeadStage } = useAppContext();`,
        `const { stages, setStages, leads, setLeads, updateLeadStage, addLead } = useAppContext();`
    );
    crm = crm.replace(
        `setLeads([...leads, leadToSave]);`,
        `addLead(leadToSave);`
    );
    fs.writeFileSync('client/src/pages/CRMView.tsx', crm);
    console.log('CRMView addLead updated');
}

