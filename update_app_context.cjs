const fs = require('fs');

let content = fs.readFileSync('client/src/context/AppContext.tsx', 'utf8');

// Update CadenceAction to support hours
content = content.replace(
  /export type CadenceAction = {[\s\S]*?};/,
  `export type CadenceAction = {
  type: 'call' | 'email' | 'message';
  intervalHours: number;
};`
);

// Update Stage
content = content.replace(
  /export type Stage = {[\s\S]*?};/,
  `export type Stage = {
  id: string;
  name: string;
  cadence: CadenceAction[];
  scenarioType?: string;
};`
);

// Update Lead
content = content.replace(
  /export type Lead = {[\s\S]*?};/,
  `export type LeadActivity = {
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
};`
);

// Update INITIAL_STAGES
content = content.replace(
  /const INITIAL_STAGES: Stage\[\] = \[[\s\S]*?\];/,
  `const INITIAL_STAGES: Stage[] = [
  { id: 'new', name: 'Novos Leads', scenarioType: 'Cold call funnel', cadence: [{ type: 'email', intervalHours: 0 }, { type: 'call', intervalHours: 24 }] },
  { id: 'qualified', name: 'Qualificados', scenarioType: 'Meeting follow-up funnel', cadence: [{ type: 'call', intervalHours: 48 }] },
  { id: 'demo', name: 'Demo Agendada', cadence: [] },
  { id: 'negotiation', name: 'Negociação', cadence: [{ type: 'email', intervalHours: 72 }, { type: 'call', intervalHours: 120 }] },
  { id: 'won', name: 'Fechado/Ganho', cadence: [] },
];`
);

// Update INITIAL_LEADS
content = content.replace(
  /const INITIAL_LEADS: Lead\[\] = \[[\s\S]*?\];/,
  `const INITIAL_LEADS: Lead[] = [
  { id: 1, name: "Acme Corp", email: "sarah@acme.com", phone: "+55 11 99999-9999", company: "Acme Corp", value: "R$ 12.000", stage: "new", owner: "Quinzinho", tags: ["SaaS", "Inbound"], score: 85, formResponses: { "Tamanho da empresa": "50-200", "Desafio": "Vendas inconsistentes" }, notes: "Lead muito interessado, priorizar.", history: [{ id: 'h1', type: 'stage_change', description: 'Entrou no pipeline', date: new Date().toISOString() }] },
  { id: 2, name: "TechFlow", email: "mike@techflow.io", phone: "+55 11 98888-8888", company: "TechFlow", value: "R$ 5.500", stage: "qualified", owner: "João", tags: ["E-commerce"], score: 62, formResponses: { "Tamanho da empresa": "1-10", "Desafio": "Custo de aquisição alto" }, notes: "", history: [] },
  { id: 3, name: "Global Ind.", email: "alex@globalind.com", phone: "+55 11 97777-7777", company: "Global Industries", value: "R$ 24.000", stage: "demo", owner: "Quinzinho", tags: ["Enterprise"], score: 95, formResponses: { "Tamanho da empresa": "500+", "Desafio": "Escalar operação global" }, notes: "Preparar case study similar.", history: [] },
  { id: 4, name: "Startup Inc", email: "john@startup.inc", phone: "+55 11 96666-6666", company: "Startup Inc", value: "R$ 2.000", stage: "new", owner: "Maria", tags: ["Outbound"], score: 40, formResponses: {}, notes: "", history: [] },
  { id: 5, name: "Inovação S.A.", email: "lisa@inovacao.sa", phone: "+55 11 95555-5555", company: "Inovação S.A.", value: "R$ 8.500", stage: "negotiation", owner: "Quinzinho", tags: ["SaaS"], score: 78, formResponses: { "Tamanho da empresa": "11-50" }, notes: "Aguardando aprovação do financeiro.", history: [] },
];`
);

// Update intervalDays to intervalHours in updateLeadStage
content = content.replace(/action\.intervalDays/g, 'action.intervalHours / 24');

// Also update where we read lead.contact to lead.name/lead.company? We'll fix it in CRMView anyway.

fs.writeFileSync('client/src/context/AppContext.tsx', content);
console.log('AppContext updated');
