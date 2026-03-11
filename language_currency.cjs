const fs = require('fs');

// Add language and currency to AppContext
let appContext = fs.readFileSync('client/src/context/AppContext.tsx', 'utf8');

const contextSettingsOld = `export type LeadActivity = {`;
const contextSettingsNew = `export type UserSettings = {
  language: 'pt-BR' | 'en-US' | 'es-ES';
  currency: 'BRL' | 'USD' | 'EUR';
};

export type LeadActivity = {`;
appContext = appContext.replace(contextSettingsOld, contextSettingsNew);

const contextTypeOld = `interface AppContextType {
  stages: Stage[];`;
const contextTypeNew = `interface AppContextType {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  stages: Stage[];`;
appContext = appContext.replace(contextTypeOld, contextTypeNew);

const contextInitOld = `export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);`;
const contextInitNew = `export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<UserSettings>({ language: 'pt-BR', currency: 'BRL' });
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);`;
appContext = appContext.replace(contextInitOld, contextInitNew);

const contextProviderOld = `<AppContext.Provider value={{ stages, setStages, leads, setLeads, tasks, setTasks, events, setEvents, updateLeadStage, addTask, addEvent, addLead }}>`;
const contextProviderNew = `<AppContext.Provider value={{ settings, setSettings, stages, setStages, leads, setLeads, tasks, setTasks, events, setEvents, updateLeadStage, addTask, addEvent, addLead }}>`;
appContext = appContext.replace(contextProviderOld, contextProviderNew);

fs.writeFileSync('client/src/context/AppContext.tsx', appContext);

// Update Settings Modal in Layout.tsx to include Language & Currency options
let layout = fs.readFileSync('client/src/components/layout/Layout.tsx', 'utf8');

if (!layout.includes('const { settings, setSettings } = useAppContext()')) {
    layout = layout.replace(
        `import { Bell, Search, Menu, MessageSquare, Plus, Settings } from "lucide-react";`,
        `import { Bell, Search, Menu, MessageSquare, Plus, Settings, Globe, DollarSign } from "lucide-react";\nimport { useAppContext } from "@/context/AppContext";`
    );
    
    // We need to find the Topbar component where Settings is used
    layout = layout.replace(
        `function Topbar({ onMenuClick }: { onMenuClick: () => void }) {`,
        `function Topbar({ onMenuClick }: { onMenuClick: () => void }) {\n  const { settings, setSettings } = useAppContext();`
    );
    
    const settingsMenuOld = `<DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Faturamento</DropdownMenuItem>
            <DropdownMenuItem>Equipe</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>`;
          
    const settingsMenuNew = `<DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2"><Globe className="w-3 h-3" /> Idioma</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setSettings({...settings, language: 'pt-BR'})} className={settings.language === 'pt-BR' ? 'bg-secondary' : ''}>Português (BR)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSettings({...settings, language: 'en-US'})} className={settings.language === 'en-US' ? 'bg-secondary' : ''}>English (US)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSettings({...settings, language: 'es-ES'})} className={settings.language === 'es-ES' ? 'bg-secondary' : ''}>Español (ES)</DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2"><DollarSign className="w-3 h-3" /> Moeda</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setSettings({...settings, currency: 'BRL'})} className={settings.currency === 'BRL' ? 'bg-secondary' : ''}>BRL (R$)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSettings({...settings, currency: 'USD'})} className={settings.currency === 'USD' ? 'bg-secondary' : ''}>USD ($)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSettings({...settings, currency: 'EUR'})} className={settings.currency === 'EUR' ? 'bg-secondary' : ''}>EUR (€)</DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>`;
    layout = layout.replace(settingsMenuOld, settingsMenuNew);
    
    fs.writeFileSync('client/src/components/layout/Layout.tsx', layout);
}

// Add a generic currency formatter in AppContext that views can use
let contextContent = fs.readFileSync('client/src/context/AppContext.tsx', 'utf8');
if (!contextContent.includes('formatCurrency')) {
    contextContent = contextContent.replace(
        `addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;`,
        `addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;\n  formatCurrency: (value: number | string) => string;`
    );
    
    const formatterFunc = `
  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
    if (isNaN(num)) return value.toString();
    
    return new Intl.NumberFormat(settings.language, {
      style: 'currency',
      currency: settings.currency,
      maximumFractionDigits: 0
    }).format(num);
  };
`;
    contextContent = contextContent.replace(
        `const addTask = (task: Omit<Task, 'id'>) => {`,
        `${formatterFunc}\n  const addTask = (task: Omit<Task, 'id'>) => {`
    );
    
    contextContent = contextContent.replace(
        `<AppContext.Provider value={{ settings, setSettings, stages, setStages, leads, setLeads, tasks, setTasks, events, setEvents, updateLeadStage, addTask, addEvent, addLead }}>`,
        `<AppContext.Provider value={{ settings, setSettings, stages, setStages, leads, setLeads, tasks, setTasks, events, setEvents, updateLeadStage, addTask, addEvent, addLead, formatCurrency }}>`
    );
    
    fs.writeFileSync('client/src/context/AppContext.tsx', contextContent);
}


// Replace static currency in CRMView.tsx
let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');
if (crm.includes('const { stages, setStages, leads, setLeads, updateLeadStage, addLead } = useAppContext();')) {
    crm = crm.replace(
        `const { stages, setStages, leads, setLeads, updateLeadStage, addLead } = useAppContext();`,
        `const { stages, setStages, leads, setLeads, updateLeadStage, addLead, formatCurrency } = useAppContext();`
    );
    
    // In lead cards
    crm = crm.replace(
        `<div className="text-xs font-semibold">{lead.value}</div>`,
        `<div className="text-xs font-semibold">{typeof lead.value === 'string' && lead.value.includes('R$') ? formatCurrency(lead.value) : lead.value}</div>`
    );
    fs.writeFileSync('client/src/pages/CRMView.tsx', crm);
}

