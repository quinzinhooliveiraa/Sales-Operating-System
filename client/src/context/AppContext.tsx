import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react';

export type Priority = 'do-now' | 'schedule' | 'delegate' | 'eliminate';

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  responsibleUser: string;
  linkedLeadId?: number | null;
  linkedStageId?: string | null;
  status: 'pending' | 'completed';
  type: 'Manual' | 'Cadência Automática';
};

export type CadenceAction = {
  type: 'call' | 'email' | 'message';
  intervalValue: number;
  intervalUnit: 'minutes' | 'hours' | 'days' | 'months' | 'years';
};

export type Stage = {
  id: string;
  name: string;
  cadence: CadenceAction[];
  scenarioType?: string | null;
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
  meetingDate?: string | null;
  nextTask?: string | null;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  hour: number;
  duration: number;
  type: 'meeting' | 'task';
  linkedLeadId?: number | null;
  linkedTaskId?: string | null;
  style?: string | null;
};

// ─── API helpers ──────────────────────────────────────────────────────────────
async function apiFetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Normalize DB rows to frontend types ─────────────────────────────────────
function normalizeLead(r: any): Lead {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    company: r.company,
    value: r.value,
    stage: r.stage,
    owner: r.owner,
    tags: r.tags ?? [],
    score: r.score ?? 0,
    formResponses: r.formResponses ?? r.form_responses ?? {},
    notes: r.notes ?? '',
    history: r.history ?? [],
    meetingDate: r.meetingDate ?? r.meeting_date ?? null,
    nextTask: r.nextTask ?? r.next_task ?? null,
  };
}
function normalizeTask(r: any): Task {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    priority: r.priority as Priority,
    dueDate: r.dueDate ?? r.due_date ?? '',
    responsibleUser: r.responsibleUser ?? r.responsible_user ?? '',
    linkedLeadId: r.linkedLeadId ?? r.linked_lead_id ?? null,
    linkedStageId: r.linkedStageId ?? r.linked_stage_id ?? null,
    status: r.status as 'pending' | 'completed',
    type: r.type as 'Manual' | 'Cadência Automática',
  };
}
function normalizeEvent(r: any): CalendarEvent {
  return {
    id: r.id,
    title: r.title,
    date: r.date,
    hour: r.hour ?? 9,
    duration: parseFloat(r.duration ?? '1'),
    type: r.type as 'meeting' | 'task',
    linkedLeadId: r.linkedLeadId ?? r.linked_lead_id ?? null,
    linkedTaskId: r.linkedTaskId ?? r.linked_task_id ?? null,
    style: r.style ?? null,
  };
}
function normalizeStage(r: any): Stage {
  return {
    id: r.id,
    name: r.name,
    cadence: (r.cadence as CadenceAction[]) ?? [],
    scenarioType: r.scenarioType ?? r.scenario_type ?? null,
  };
}

// ─── Context type ─────────────────────────────────────────────────────────────
interface AppContextType {
  settings: UserSettings;
  setSettings: (settings: UserSettings | ((prev: UserSettings) => UserSettings)) => void;
  stages: Stage[];
  setStages: (stages: Stage[]) => void;
  leads: Lead[];
  setLeads: (leads: Lead[] | ((prev: Lead[]) => Lead[])) => void;
  tasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])) => void;
  updateLeadStage: (leadId: number, stageId: string, restartCadence?: boolean) => void;
  addLead: (lead: Omit<Lead, 'id'>) => Lead;
  addTask: (task: Omit<Task, 'id'>) => Task;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  deleteLead: (id: number) => void;
  deleteTask: (id: string) => void;
  formatCurrency: (value: number | string) => string;
  t: Record<string, string>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettingsState] = useState<UserSettings>({ language: 'pt-BR', currency: 'BRL' });
  const [stages, setStagesState] = useState<Stage[]>([]);
  const [leads, setLeadsState] = useState<Lead[]>([]);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [events, setEventsState] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Track server state for diffing
  const serverLeads = useRef<Map<number, Lead>>(new Map());
  const serverTasks = useRef<Map<string, Task>>(new Map());

  // ─── Load all data from API on mount ───────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiFetch('/api/settings'),
      apiFetch('/api/stages'),
      apiFetch('/api/leads'),
      apiFetch('/api/tasks'),
      apiFetch('/api/events'),
    ]).then(([s, stg, l, t, e]) => {
      if (s) setSettingsState({ language: s.language, currency: s.currency });
      const normalizedStages = (stg as any[]).map(normalizeStage);
      setStagesState(normalizedStages);
      const normalizedLeads = (l as any[]).map(normalizeLead);
      setLeadsState(normalizedLeads);
      serverLeads.current = new Map(normalizedLeads.map(l => [l.id, l]));
      const normalizedTasks = (t as any[]).map(normalizeTask);
      setTasksState(normalizedTasks);
      serverTasks.current = new Map(normalizedTasks.map(t => [t.id, t]));
      setEventsState((e as any[]).map(normalizeEvent));
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  // ─── Settings ───────────────────────────────────────────────────────────
  const setSettings = useCallback((newSettings: UserSettings | ((prev: UserSettings) => UserSettings)) => {
    setSettingsState(prev => {
      const next = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      if (next?.language) document.documentElement.lang = next.language.split('-')[0];
      apiFetch('/api/settings', { method: 'PATCH', body: JSON.stringify(next) }).catch(console.error);
      return next;
    });
  }, []);

  // ─── Leads ──────────────────────────────────────────────────────────────
  const setLeads = useCallback((updater: Lead[] | ((prev: Lead[]) => Lead[])) => {
    setLeadsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      // Sync changed leads to API
      next.forEach(lead => {
        const old = serverLeads.current.get(lead.id);
        if (old && (old.stage !== lead.stage || JSON.stringify(old) !== JSON.stringify(lead))) {
          apiFetch(`/api/leads/${lead.id}`, { method: 'PATCH', body: JSON.stringify({
            stage: lead.stage, name: lead.name, email: lead.email, phone: lead.phone,
            company: lead.company, value: lead.value, owner: lead.owner, tags: lead.tags,
            score: lead.score, notes: lead.notes, history: lead.history,
            formResponses: lead.formResponses, meetingDate: lead.meetingDate, nextTask: lead.nextTask,
          }) }).then(updated => {
            serverLeads.current.set(lead.id, normalizeLead(updated));
          }).catch(console.error);
        }
      });
      serverLeads.current = new Map(next.map(l => [l.id, l]));
      return next;
    });
  }, []);

  // ─── Tasks ───────────────────────────────────────────────────────────────
  const setTasks = useCallback((updater: Task[] | ((prev: Task[]) => Task[])) => {
    setTasksState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      next.forEach(task => {
        const old = serverTasks.current.get(task.id);
        if (old && JSON.stringify(old) !== JSON.stringify(task)) {
          apiFetch(`/api/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({
            status: task.status, title: task.title, description: task.description,
            priority: task.priority, dueDate: task.dueDate, responsibleUser: task.responsibleUser,
          }) }).then(updated => {
            serverTasks.current.set(task.id, normalizeTask(updated));
          }).catch(console.error);
        }
      });
      serverTasks.current = new Map(next.map(t => [t.id, t]));
      return next;
    });
  }, []);

  // ─── Events ──────────────────────────────────────────────────────────────
  const setEvents = useCallback((updater: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])) => {
    setEventsState(prev => typeof updater === 'function' ? updater(prev) : updater);
  }, []);

  // ─── Stages ──────────────────────────────────────────────────────────────
  const setStages = useCallback((newStages: Stage[]) => {
    setStagesState(newStages);
    newStages.forEach((stage, idx) => {
      apiFetch(`/api/stages/${stage.id}`, {
        method: 'PUT',
        body: JSON.stringify({ id: stage.id, name: stage.name, scenarioType: stage.scenarioType, cadence: stage.cadence, position: idx }),
      }).catch(console.error);
    });
  }, []);

  // ─── Format currency ─────────────────────────────────────────────────────
  const formatCurrency = useCallback((value: number | string) => {
    if (!value) return "R$ 0";
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
    if (isNaN(num)) return typeof value === 'string' ? value : value.toString();
    return new Intl.NumberFormat(settings?.language || 'pt-BR', {
      style: 'currency', currency: settings?.currency || 'BRL', maximumFractionDigits: 0
    }).format(num);
  }, [settings]);

  // ─── addTask ─────────────────────────────────────────────────────────────
  const addTask = useCallback((task: Omit<Task, 'id'>): Task => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const optimistic: Task = { ...task, id: tempId };
    setTasksState(prev => [...prev, optimistic]);
    apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify({
      title: task.title, description: task.description, priority: task.priority,
      dueDate: task.dueDate, responsibleUser: task.responsibleUser,
      linkedLeadId: task.linkedLeadId, linkedStageId: task.linkedStageId,
      status: task.status, type: task.type,
    }) }).then(created => {
      const normalized = normalizeTask(created);
      setTasksState(prev => prev.map(t => t.id === tempId ? normalized : t));
      serverTasks.current.set(normalized.id, normalized);
    }).catch(console.error);
    return optimistic;
  }, []);

  // ─── addEvent ────────────────────────────────────────────────────────────
  const addEvent = useCallback((event: Omit<CalendarEvent, 'id'>): CalendarEvent => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const optimistic: CalendarEvent = { ...event, id: tempId };
    setEventsState(prev => [...prev, optimistic]);
    apiFetch('/api/events', { method: 'POST', body: JSON.stringify({
      title: event.title, date: event.date, hour: event.hour,
      duration: String(event.duration), type: event.type,
      linkedLeadId: event.linkedLeadId, linkedTaskId: event.linkedTaskId, style: event.style,
    }) }).then(created => {
      const normalized = normalizeEvent(created);
      setEventsState(prev => prev.map(e => e.id === tempId ? normalized : e));
    }).catch(console.error);
    return optimistic;
  }, []);

  // ─── addLead ─────────────────────────────────────────────────────────────
  const addLead = useCallback((lead: Omit<Lead, 'id'>): Lead => {
    const tempId = Math.floor(Math.random() * -1000000);
    const optimistic: Lead = { ...lead, id: tempId };
    setLeadsState(prev => [...prev, optimistic]);

    apiFetch('/api/leads', { method: 'POST', body: JSON.stringify({
      name: lead.name, email: lead.email, phone: lead.phone, company: lead.company,
      value: lead.value, stage: lead.stage, owner: lead.owner, tags: lead.tags,
      score: lead.score, formResponses: lead.formResponses, notes: lead.notes,
      history: lead.history, meetingDate: lead.meetingDate, nextTask: lead.nextTask,
    }) }).then(created => {
      const normalized = normalizeLead(created);
      setLeadsState(prev => prev.map(l => l.id === tempId ? normalized : l));
      serverLeads.current.set(normalized.id, normalized);
      // Trigger cadence
      const stage = stages.find(s => s.id === normalized.stage);
      if (stage?.cadence?.length) {
        stage.cadence.forEach((action, idx) => {
          const d = new Date();
          if (action.intervalUnit === 'minutes') d.setMinutes(d.getMinutes() + action.intervalValue);
          else if (action.intervalUnit === 'hours') d.setHours(d.getHours() + action.intervalValue);
          else if (action.intervalUnit === 'days') d.setDate(d.getDate() + action.intervalValue);
          const actionText = action.type === 'call' ? 'Ligar para' : action.type === 'email' ? 'Email para' : 'Mensagem para';
          const newTask = addTask({
            title: `${actionText} ${normalized.name} (Touch ${idx + 1})`,
            description: `Gerado automaticamente ao criar lead na etapa ${stage.name}`,
            priority: 'do-now', dueDate: d.toISOString().split('T')[0],
            responsibleUser: normalized.owner || 'Quinzinho',
            status: 'pending', type: 'Cadência Automática',
            linkedLeadId: normalized.id, linkedStageId: normalized.stage,
          });
          if (action.type === 'call') {
            addEvent({
              title: `[Tarefa] ${actionText} ${normalized.name}`,
              date: d.toISOString().split('T')[0], hour: 9 + (idx % 8), duration: 0.5,
              type: 'task', linkedLeadId: normalized.id, linkedTaskId: newTask.id,
              style: "border-muted-foreground bg-secondary text-muted-foreground",
            });
          }
        });
      }
    }).catch(console.error);

    return optimistic;
  }, [stages, addTask, addEvent]);

  // ─── deleteLead ──────────────────────────────────────────────────────────
  const deleteLead = useCallback((id: number) => {
    setLeadsState(prev => prev.filter(l => l.id !== id));
    serverLeads.current.delete(id);
    apiFetch(`/api/leads/${id}`, { method: 'DELETE' }).catch(console.error);
  }, []);

  // ─── deleteTask ──────────────────────────────────────────────────────────
  const deleteTask = useCallback((id: string) => {
    setTasksState(prev => prev.filter(t => t.id !== id));
    serverTasks.current.delete(id);
    apiFetch(`/api/tasks/${id}`, { method: 'DELETE' }).catch(console.error);
  }, []);

  // ─── updateLeadStage ─────────────────────────────────────────────────────
  const updateLeadStage = useCallback((leadId: number, stageId: string, restartCadence: boolean = true) => {
    setLeadsState(prev => {
      const updated = prev.map(l => l.id === leadId ? { ...l, stage: stageId } : l);
      const lead = updated.find(l => l.id === leadId);
      if (lead) {
        const history = [...(lead.history || []), {
          id: Math.random().toString(36).substr(2, 9),
          type: 'stage_change' as const,
          description: `Movido para ${stages.find(s => s.id === stageId)?.name || stageId}`,
          date: new Date().toISOString(),
        }];
        apiFetch(`/api/leads/${leadId}`, { method: 'PATCH', body: JSON.stringify({ stage: stageId, history }) })
          .then(updated => serverLeads.current.set(leadId, normalizeLead(updated)))
          .catch(console.error);
      }
      return updated;
    });

    if (restartCadence) {
      const stage = stages.find(s => s.id === stageId);
      if (stage?.cadence?.length) {
        stage.cadence.forEach((action, idx) => {
          const d = new Date();
          if (action.intervalUnit === 'minutes') d.setMinutes(d.getMinutes() + action.intervalValue);
          else if (action.intervalUnit === 'hours') d.setHours(d.getHours() + action.intervalValue);
          else if (action.intervalUnit === 'days') d.setDate(d.getDate() + action.intervalValue);
          const actionText = action.type === 'call' ? 'Ligar para' : action.type === 'email' ? 'Email para' : 'Mensagem para';
          const lead = leads.find(l => l.id === leadId);
          const newTask = addTask({
            title: `${actionText} ${lead?.name || 'Lead'} (Touch ${idx + 1})`,
            description: `Gerado automaticamente ao mover para a etapa ${stage.name}`,
            priority: 'do-now', dueDate: d.toISOString().split('T')[0],
            responsibleUser: 'Quinzinho', status: 'pending', type: 'Cadência Automática',
            linkedLeadId: leadId, linkedStageId: stageId,
          });
          addEvent({
            title: `[Tarefa] ${actionText} ${lead?.name || 'Lead'}`,
            date: d.toISOString().split('T')[0], hour: 9, duration: 0.5,
            type: 'task', linkedLeadId: leadId, linkedTaskId: newTask.id,
            style: "border-muted-foreground bg-secondary text-muted-foreground",
          });
        });
      }
    }
  }, [stages, leads, addTask, addEvent]);

  const t = getGlobalTranslations(settings?.language || 'pt-BR');

  return (
    <AppContext.Provider value={{
      settings, setSettings, stages, setStages, leads, setLeads, tasks, setTasks,
      events, setEvents, updateLeadStage, addTask, addEvent, addLead,
      deleteLead, deleteTask, formatCurrency, t, isLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
