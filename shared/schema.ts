import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({ username: true, password: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ─── Stages ───────────────────────────────────────────────────────────────────
export const stages = pgTable("stages", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  scenarioType: text("scenario_type"),
  cadence: jsonb("cadence").notNull().default(sql`'[]'::jsonb`),
  position: integer("position").notNull().default(0),
});

export const insertStageSchema = createInsertSchema(stages).omit({});
export type InsertStage = z.infer<typeof insertStageSchema>;
export type Stage = typeof stages.$inferSelect;

// ─── Leads ────────────────────────────────────────────────────────────────────
export const leads = pgTable("leads", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  company: text("company").notNull().default(""),
  value: text("value").notNull().default("R$ 0"),
  stage: text("stage").notNull().default("new"),
  owner: text("owner").notNull().default(""),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  score: integer("score").notNull().default(0),
  formResponses: jsonb("form_responses").notNull().default(sql`'{}'::jsonb`),
  notes: text("notes").notNull().default(""),
  history: jsonb("history").notNull().default(sql`'[]'::jsonb`),
  meetingDate: text("meeting_date"),
  nextTask: text("next_task"),
  archived: boolean("archived").notNull().default(false),
  archivedAt: timestamp("archived_at"),
  closeChance: integer("close_chance").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  priority: text("priority").notNull().default("schedule"),
  dueDate: text("due_date").notNull(),
  responsibleUser: text("responsible_user").notNull().default(""),
  linkedLeadId: integer("linked_lead_id"),
  linkedStageId: text("linked_stage_id"),
  status: text("status").notNull().default("pending"),
  type: text("type").notNull().default("Manual"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// ─── Calendar Events ──────────────────────────────────────────────────────────
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  date: text("date").notNull(),
  hour: integer("hour").notNull().default(9),
  duration: text("duration").notNull().default("1"),
  type: text("type").notNull().default("meeting"),
  linkedLeadId: integer("linked_lead_id"),
  linkedTaskId: text("linked_task_id"),
  style: text("style"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true, createdAt: true });
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`'default'`),
  language: text("language").notNull().default("pt-BR"),
  currency: text("currency").notNull().default("BRL"),
  crmConfig: jsonb("crm_config").default(sql`'{}'::jsonb`),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// ─── CRM Config types (stored as JSONB in settings) ───────────────────────────
export type ScoreEvent = { id: string; name: string; points: number };
export type ScoreBand = { id: string; name: string; minScore: number; maxScore: number; color: string; emoji: string };
export type CadenceStep = { id: string; day: number; channel: 'openphone' | 'email' | 'manual'; messageTemplate: string; condition: 'always' | 'if_no_reply' | 'if_replied' };
export type NamedCadence = { id: string; name: string; trigger: 'manual' | 'on_schedule' | 'on_noshow' | 'on_postsale' | 'on_cancel'; steps: CadenceStep[] };
export type CallOutcome = { id: string; name: string; points: number; cadenceId?: string; targetStageId?: string };
export type CRMConfig = {
  scoreEvents: ScoreEvent[];
  scoreBands: ScoreBand[];
  displayFormat: 'fraction' | 'percent';
  alertThreshold: number;
  cadences: NamedCadence[];
  callOutcomes: CallOutcome[];
};

export const DEFAULT_CRM_CONFIG: CRMConfig = {
  scoreEvents: [
    { id: 'e1', name: 'Respondeu mensagem 1', points: 30 },
    { id: 'e2', name: 'Respondeu mensagem 2', points: 30 },
    { id: 'e3', name: 'Respondeu rápido (< 2h)', points: 20 },
    { id: 'e4', name: 'Agendou uma call', points: 20 },
    { id: 'e5', name: 'Sem resposta após 24h', points: -15 },
    { id: 'e6', name: 'Sem resposta após 48h', points: -25 },
    { id: 'e7', name: 'Pediu cancelamento', points: -50 },
    { id: 'e8', name: 'Apareceu na call', points: 50 },
    { id: 'e9', name: 'No-show', points: -40 },
    { id: 'e10', name: 'Abriu email', points: 5 },
    { id: 'e11', name: 'Clicou em link', points: 15 },
  ],
  scoreBands: [
    { id: 'b1', name: 'Muito Quente', minScore: 120, maxScore: 9999, color: '#22c55e', emoji: '🔥' },
    { id: 'b2', name: 'Quente', minScore: 80, maxScore: 119, color: '#86efac', emoji: '✅' },
    { id: 'b3', name: 'Morno', minScore: 40, maxScore: 79, color: '#eab308', emoji: '⚡' },
    { id: 'b4', name: 'Frio', minScore: 10, maxScore: 39, color: '#f97316', emoji: '⚠️' },
    { id: 'b5', name: 'Sem Contato', minScore: 0, maxScore: 9, color: '#ef4444', emoji: '🧊' },
  ],
  displayFormat: 'fraction',
  alertThreshold: 20,
  cadences: [
    {
      id: 'c1', name: 'Pós-Agendamento', trigger: 'on_schedule',
      steps: [
        { id: 's1', day: 1, channel: 'openphone', condition: 'always', messageTemplate: 'Oi {first_name}! Confirmando sua call em {call_date} às {call_time}. Para remarcar: {reschedule_link}' },
        { id: 's2', day: 2, channel: 'openphone', condition: 'always', messageTemplate: 'Oi {first_name}, lembrete rápido — vamos te ligar às {call_time} amanhã. Nos vemos lá!' },
        { id: 's3', day: 2, channel: 'manual', condition: 'always', messageTemplate: 'Ligar para {first_name} — verificar se apareceu e registrar resultado' },
      ]
    },
    {
      id: 'c2', name: 'Reaquecimento', trigger: 'manual',
      steps: [
        { id: 's4', day: 1, channel: 'openphone', condition: 'always', messageTemplate: 'Oi {first_name}, tudo bem? Estava pensando em você e queria ver se ainda faz sentido conversar sobre {company}.' },
        { id: 's5', day: 3, channel: 'email', condition: 'if_no_reply', messageTemplate: 'Olá {first_name}, deixei uma mensagem alguns dias atrás. Seria ótimo retomar nossa conversa quando você puder.' },
      ]
    },
  ],
  callOutcomes: [
    { id: 'o1', name: 'Apareceu - Interessado', points: 50, cadenceId: '' },
    { id: 'o2', name: 'Apareceu - Não é o fit', points: 10 },
    { id: 'o3', name: 'No-show', points: -40, cadenceId: '' },
    { id: 'o4', name: 'Remarcou', points: -10 },
  ]
};
