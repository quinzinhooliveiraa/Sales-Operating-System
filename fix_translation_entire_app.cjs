const fs = require('fs');

// 1. Add general translation dictionary to AppContext so it's accessible everywhere
let appContext = fs.readFileSync('client/src/context/AppContext.tsx', 'utf8');

if (!appContext.includes('export const getGlobalTranslations')) {
    const translations = `
export const getGlobalTranslations = (lang: string) => {
  switch(lang) {
    case 'en-US': return {
      dashboard: "Dashboard", scheduling: "Scheduling", crm: "CRM Pipeline", tasks: "Tasks", calendar: "Calendar", settings: "Settings",
      newLead: "New Lead", managePipeline: "Manage Pipeline", searchLeads: "Search leads...",
      budget: "Budget", authority: "Authority", need: "Need", timeline: "Timeline", notes: "Notes",
      stage: "Stage", value: "Value", company: "Company", contact: "Contact", addLeadBtn: "Create Lead",
      save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit",
      moveLeadPromptTitle: "Restart Cadence?",
      moveLeadPromptDesc: "You moved this lead. Do you want to restart the cadence timers for the new stage or keep the existing scheduled tasks?",
      restartCadence: "Restart Cadence", keepCadence: "Keep Existing Tasks",
      overdue: "Overdue", today: "Today", tomorrow: "Tomorrow",
      doNow: "Do Now", schedule: "Schedule", delegate: "Delegate", eliminate: "Eliminate"
    };
    case 'es-ES': return {
      dashboard: "Panel", scheduling: "Citas", crm: "Pipeline CRM", tasks: "Tareas", calendar: "Calendario", settings: "Ajustes",
      newLead: "Nuevo Lead", managePipeline: "Gestionar Pipeline", searchLeads: "Buscar leads...",
      budget: "Presupuesto", authority: "Autoridad", need: "Necesidad", timeline: "Urgencia", notes: "Notas",
      stage: "Etapa", value: "Valor", company: "Empresa", contact: "Contacto", addLeadBtn: "Crear Lead",
      save: "Guardar", cancel: "Cancelar", delete: "Eliminar", edit: "Editar",
      moveLeadPromptTitle: "¿Reiniciar Cadencia?",
      moveLeadPromptDesc: "Has movido este lead. ¿Deseas reiniciar los temporizadores de cadencia para la nueva etapa o mantener las tareas programadas existentes?",
      restartCadence: "Reiniciar Cadencia", keepCadence: "Mantener Tareas",
      overdue: "Atrasado", today: "Hoy", tomorrow: "Mañana",
      doNow: "Hacer Ahora", schedule: "Programar", delegate: "Delegar", eliminate: "Eliminar"
    };
    default: return {
      dashboard: "Dashboard", scheduling: "Agendamentos", crm: "Pipeline CRM", tasks: "Tarefas", calendar: "Calendário", settings: "Configurações",
      newLead: "Novo Lead", managePipeline: "Gerenciar Pipeline", searchLeads: "Buscar leads...",
      budget: "Caixa (Budget)", authority: "Decisor (Authority)", need: "Necessidade (Need)", timeline: "Urgência (Timeline)", notes: "Anotações",
      stage: "Etapa", value: "Valor", company: "Empresa", contact: "Contato", addLeadBtn: "Criar Lead",
      save: "Salvar", cancel: "Cancelar", delete: "Excluir", edit: "Editar",
      moveLeadPromptTitle: "Reiniciar Lembretes?",
      moveLeadPromptDesc: "Você moveu este lead. Deseja gerar novas tarefas de cadência para esta etapa ou manter as antigas?",
      restartCadence: "Gerar Novas Tarefas", keepCadence: "Manter Antigas",
      overdue: "Atrasado", today: "Hoje", tomorrow: "Amanhã",
      doNow: "Fazer Agora", schedule: "Agendar", delegate: "Delegar", eliminate: "Eliminar"
    };
  }
};
`;
    appContext = appContext.replace(
        `export const AppProvider = ({ children }: { children: ReactNode }) => {`,
        `${translations}\nexport const AppProvider = ({ children }: { children: ReactNode }) => {`
    );
    
    // Make context provide translations helper
    appContext = appContext.replace(
        `formatCurrency: (value: number | string) => string;`,
        `formatCurrency: (value: number | string) => string;\n  t: Record<string, string>;`
    );
    
    appContext = appContext.replace(
        `<AppContext.Provider value={{ settings, setSettings: handleSetSettings, stages, setStages, leads, setLeads, tasks, setTasks, events, setEvents, updateLeadStage, addTask, addEvent, addLead, formatCurrency }}>`,
        `const t = getGlobalTranslations(settings?.language || 'pt-BR');\n  <AppContext.Provider value={{ settings, setSettings: handleSetSettings, stages, setStages, leads, setLeads, tasks, setTasks, events, setEvents, updateLeadStage, addTask, addEvent, addLead, formatCurrency, t }}>`
    );

    // Let's modify updateLeadStage so it accepts an optional 'restartCadence' boolean.
    // If restartCadence is true, we delete old pending tasks for this lead before adding new ones.
    appContext = appContext.replace(
        `updateLeadStage: (leadId: number, stageId: string) => void;`,
        `updateLeadStage: (leadId: number, stageId: string, restartCadence?: boolean) => void;`
    );
    
    appContext = appContext.replace(
        `const updateLeadStage = (leadId: number, stageId: string) => {`,
        `const updateLeadStage = (leadId: number, stageId: string, restartCadence: boolean = true) => {`
    );
    
    const oldCadenceLogic = `if (stage && stage.cadence && stage.cadence.length > 0) {`;
    const newCadenceLogic = `if (restartCadence) {
      setTasks(prev => prev.filter(t => !(t.linkedLeadId === leadId && t.status === 'pending' && t.type === 'Cadência Automática')));
    }
    
    if (restartCadence && stage && stage.cadence && stage.cadence.length > 0) {`;
    appContext = appContext.replace(oldCadenceLogic, newCadenceLogic);
    
    fs.writeFileSync('client/src/context/AppContext.tsx', appContext);
}

// 2. Update CRMView.tsx to ask user about cadence on drag & drop
let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

if (!crm.includes('const { t } = useAppContext();')) {
    crm = crm.replace(
        `const { stages, setStages, leads, setLeads, updateLeadStage, addLead, formatCurrency } = useAppContext();`,
        `const { stages, setStages, leads, setLeads, updateLeadStage, addLead, formatCurrency, t } = useAppContext();`
    );
}

// Implement Cadence Prompt Dialog for Drag and Drop
if (!crm.includes('isMovePromptOpen')) {
    crm = crm.replace(
        `const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);`,
        `const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);\n  const [movePrompt, setMovePrompt] = useState<{isOpen: boolean, leadId: number | null, targetStageId: string | null}>({isOpen: false, leadId: null, targetStageId: null});`
    );
    
    // Intercept drop
    crm = crm.replace(
        `updateLeadStage(draggedLeadId, stageId);`,
        `setMovePrompt({ isOpen: true, leadId: draggedLeadId, targetStageId: stageId });`
    );
    
    // Add the dialog to the render
    const moveDialog = `
      <Dialog open={movePrompt.isOpen} onOpenChange={(open) => !open && setMovePrompt({isOpen: false, leadId: null, targetStageId: null})}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.moveLeadPromptTitle}</DialogTitle>
            <DialogDescription>
              {t.moveLeadPromptDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => {
              if (movePrompt.leadId && movePrompt.targetStageId) {
                updateLeadStage(movePrompt.leadId, movePrompt.targetStageId, false);
                setMovePrompt({isOpen: false, leadId: null, targetStageId: null});
              }
            }}>
              {t.keepCadence}
            </Button>
            <Button onClick={() => {
              if (movePrompt.leadId && movePrompt.targetStageId) {
                updateLeadStage(movePrompt.leadId, movePrompt.targetStageId, true);
                setMovePrompt({isOpen: false, leadId: null, targetStageId: null});
              }
            }}>
              {t.restartCadence}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    `;
    
    crm = crm.replace(
        `{/* Add Lead Form */}`,
        `${moveDialog}\n\n      {/* Add Lead Form */}`
    );
    
    fs.writeFileSync('client/src/pages/CRMView.tsx', crm);
}

console.log("Translation and cadence logic updated");
