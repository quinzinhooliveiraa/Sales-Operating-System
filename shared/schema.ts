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
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
