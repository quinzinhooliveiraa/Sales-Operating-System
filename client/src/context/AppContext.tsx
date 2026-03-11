import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Priority = 'do-now' | 'schedule' | 'delegate' | 'eliminate';

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  responsibleUser: string;
  linkedLeadId?: number;
  linkedStageId?: string;
  status: 'pending' | 'completed';
  type: 'Manual' | 'Cadência Automática';
};

export type CadenceAction = {
  type: 'call' | 'email' | 'message';
  intervalHours: number;
};

export type Stage = {
  id: string;
  name: string;
  cadence: CadenceAction[];
  scenarioType?: string;
};

export type UserSettings = {
  language: 'pt-BR' | 'en-US' | 'es-ES';
  currency: 'BRL' | 'USD' | 'EUR';
};

export type LeadActivity = {
  id: string;
  type: 'call' | 'meeting' | 'task' | 'stage_change' | 'note';
  description: string;
  date: string;
};

export type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  value: string;
  stage: string;
  owner: string;
  tags: string[];
  score: number;
  formResponses: Record<string, string>;
  notes: string;
  history: LeadActivity[];
  meetingDate?: string;
  nextTask?: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  duration: number; // hours
  type: 'meeting' | 'task';
  linkedLeadId?: number;
  linkedTaskId?: string;
  style?: string;
};

interface AppContextType {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  stages: Stage[];
  setStages: (stages: Stage[]) => void;
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
  updateLeadStage: (leadId: number, stageId: string) => void;
  addLead: (lead: Omit<Lead, 'id'>) => Lead;
  addTask: (task: Omit<Task, 'id'>) => Task;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  formatCurrency: (value: number | string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_STAGES: Stage[] = [
  { id: 'new', name: 'Novos Leads', scenarioType: 'Cold call funnel', cadence: [{ type: 'email', intervalHours: 0 }, { type: 'call', intervalHours: 24 }] },
  { id: 'qualified', name: 'Qualificados', scenarioType: 'Meeting follow-up funnel', cadence: [{ type: 'call', intervalHours: 48 }] },
  { id: 'demo', name: 'Demo Agendada', cadence: [] },
  { id: 'negotiation', name: 'Negociação', cadence: [{ type: 'email', intervalHours: 72 }, { type: 'call', intervalHours: 120 }] },
  { id: 'won', name: 'Fechado/Ganho', cadence: [] },
];

const INITIAL_LEADS: Lead[] = [
  { id: 1, name: "Acme Corp", email: "sarah@acme.com", phone: "+55 11 99999-9999", company: "Acme Corp", value: "R$ 12.000", stage: "new", owner: "Quinzinho", tags: ["SaaS", "Inbound"], score: 85, formResponses: { "Tamanho da empresa": "50-200", "Desafio": "Vendas inconsistentes" }, notes: "Lead muito interessado, priorizar.", history: [{ id: 'h1', type: 'stage_change', description: 'Entrou no pipeline', date: new Date().toISOString() }] },
  { id: 2, name: "TechFlow", email: "mike@techflow.io", phone: "+55 11 98888-8888", company: "TechFlow", value: "R$ 5.500", stage: "qualified", owner: "João", tags: ["E-commerce"], score: 62, formResponses: { "Tamanho da empresa": "1-10", "Desafio": "Custo de aquisição alto" }, notes: "", history: [] },
  { id: 3, name: "Global Ind.", email: "alex@globalind.com", phone: "+55 11 97777-7777", company: "Global Industries", value: "R$ 24.000", stage: "demo", owner: "Quinzinho", tags: ["Enterprise"], score: 95, formResponses: { "Tamanho da empresa": "500+", "Desafio": "Escalar operação global" }, notes: "Preparar case study similar.", history: [] },
  { id: 4, name: "Startup Inc", email: "john@startup.inc", phone: "+55 11 96666-6666", company: "Startup Inc", value: "R$ 2.000", stage: "new", owner: "Maria", tags: ["Outbound"], score: 40, formResponses: {}, notes: "", history: [] },
  { id: 5, name: "Inovação S.A.", email: "lisa@inovacao.sa", phone: "+55 11 95555-5555", company: "Inovação S.A.", value: "R$ 8.500", stage: "negotiation", owner: "Quinzinho", tags: ["SaaS"], score: 78, formResponses: { "Tamanho da empresa": "11-50" }, notes: "Aguardando aprovação do financeiro.", history: [] },
];

const getToday = () => new Date().toISOString().split('T')[0];
const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: "Email de follow-up para Acme Corp", description: "Mandar o template 2", priority: 'do-now', dueDate: getToday(), responsibleUser: 'Quinzinho', status: 'pending', type: 'Cadência Automática', linkedLeadId: 1 },
  { id: 't2', title: "Preparar ambiente de demo para TechFlow", description: "Configurar integrações básicas", priority: 'schedule', dueDate: getTomorrow(), responsibleUser: 'Quinzinho', status: 'pending', type: 'Manual', linkedLeadId: 2 },
  { id: 't3', title: "Enviar contrato para Global Ind.", description: "Revisar cláusula 4 antes de enviar", priority: 'do-now', dueDate: getToday(), responsibleUser: 'Quinzinho', status: 'completed', type: 'Manual', linkedLeadId: 3 },
  { id: 't4', title: "Atualizar registros de CRM", description: "Limpar leads antigos", priority: 'delegate', dueDate: getTomorrow(), responsibleUser: 'João', status: 'pending', type: 'Manual' },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: "Call de Descoberta: Acme", date: getToday(), hour: 10, duration: 1, type: "meeting", linkedLeadId: 1, style: "border-blue-500 bg-blue-500/10 text-foreground" },
  { id: 'e2', title: "Demo: Global Ind.", date: getTomorrow(), hour: 14, duration: 1.5, type: "meeting", linkedLeadId: 3, style: "border-primary bg-primary/10 text-foreground" },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<UserSettings>({ language: 'pt-BR', currency: 'BRL' });
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);

  
  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
    if (isNaN(num)) return value.toString();
    
    return new Intl.NumberFormat(settings.language, {
      style: 'currency',
      currency: settings.currency,
      maximumFractionDigits: 0
    }).format(num);
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9) };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  
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
          title: `${actionText} ${newLead.name} (Touch ${idx + 1})`,
          description: `Gerado automaticamente ao criar lead na etapa ${stage.name}`,
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
              title: `[Tarefa] ${actionText} ${newLead.name}`,
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

  const updateLeadStage = (leadId: number, stageId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: stageId } : l));
    
    // Generate tasks based on cadence
    const stage = stages.find(s => s.id === stageId);
    if (stage && stage.cadence.length > 0) {
      stage.cadence.forEach((action, idx) => {
        const d = new Date();
        d.setDate(d.getDate() + action.intervalHours / 24);
        const actionText = action.type === 'call' ? 'Ligar para' : action.type === 'email' ? 'Email para' : 'Mensagem para';
        const lead = leads.find(l => l.id === leadId);
        const newTask = addTask({
          title: `${actionText} ${lead?.name || 'Lead'} (Touch ${idx + 1})`,
          description: `Gerado automaticamente ao mover para a etapa ${stage.name}`,
          priority: 'do-now',
          dueDate: d.toISOString().split('T')[0],
          responsibleUser: 'Quinzinho', // Default
          status: 'pending',
          type: 'Cadência Automática',
          linkedLeadId: leadId,
          linkedStageId: stageId
        });
        
        // Optionally auto-schedule in calendar (e.g. at 9 AM) if it's a call
        addEvent({
          title: `[Tarefa] ${actionText} ${lead?.name || 'Lead'}`,
          date: d.toISOString().split('T')[0],
          hour: 9,
          duration: 0.5,
          type: 'task',
          linkedLeadId: leadId,
          linkedTaskId: newTask.id,
          style: "border-muted-foreground bg-secondary text-muted-foreground"
        });
      });
    }
  };

  return (
    <AppContext.Provider value={{ settings, setSettings, stages, setStages, leads, setLeads, tasks, setTasks, events, setEvents, updateLeadStage, addTask, addEvent, addLead, formatCurrency }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};