import {
  type User, type InsertUser,
  type Stage, type InsertStage,
  type Lead, type InsertLead,
  type Task, type InsertTask,
  type CalendarEvent, type InsertCalendarEvent,
  type Settings, type InsertSettings,
  users, stages, leads, tasks, calendarEvents, settings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { PushSubscription } from "web-push";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Settings
  getSettings(): Promise<Settings>;
  upsertSettings(s: Partial<InsertSettings>): Promise<Settings>;

  // Stages
  getStages(): Promise<Stage[]>;
  upsertStage(stage: InsertStage): Promise<Stage>;
  deleteStage(id: string): Promise<void>;

  // Leads
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, data: Partial<InsertLead>): Promise<Lead>;
  deleteLead(id: number): Promise<void>;

  // Tasks
  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, data: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Calendar Events
  getEvents(): Promise<CalendarEvent[]>;
  createEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateEvent(id: string, data: Partial<InsertCalendarEvent>): Promise<CalendarEvent>;
  deleteEvent(id: string): Promise<void>;

  // Push subscriptions (in memory)
  savePushSubscription(subscription: PushSubscription): Promise<void>;
  removePushSubscription(endpoint: string): Promise<void>;
  getAllPushSubscriptions(): Promise<PushSubscription[]>;
}

export class DbStorage implements IStorage {
  private pushSubscriptions = new Map<string, PushSubscription>();

  // ─── Users ──────────────────────────────────────────────────────────────
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser: InsertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // ─── Settings ────────────────────────────────────────────────────────────
  async getSettings() {
    const [row] = await db.select().from(settings).where(eq(settings.id, "default"));
    if (row) return row;
    const [created] = await db.insert(settings).values({ id: "default", language: "pt-BR", currency: "BRL" }).returning();
    return created;
  }
  async upsertSettings(data: Partial<InsertSettings>) {
    const existing = await this.getSettings();
    const [updated] = await db
      .update(settings)
      .set(data)
      .where(eq(settings.id, "default"))
      .returning();
    return updated || existing;
  }

  // ─── Stages ──────────────────────────────────────────────────────────────
  async getStages() {
    return db.select().from(stages).orderBy(stages.position);
  }
  async upsertStage(stage: InsertStage) {
    const [row] = await db
      .insert(stages)
      .values(stage)
      .onConflictDoUpdate({ target: stages.id, set: { name: stage.name, scenarioType: stage.scenarioType, cadence: stage.cadence, position: stage.position } })
      .returning();
    return row;
  }
  async deleteStage(id: string) {
    await db.delete(stages).where(eq(stages.id, id));
  }

  // ─── Leads ───────────────────────────────────────────────────────────────
  async getLeads() {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }
  async getLead(id: number) {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }
  async createLead(lead: InsertLead) {
    const [row] = await db.insert(leads).values(lead).returning();
    return row;
  }
  async updateLead(id: number, data: Partial<InsertLead>) {
    const [row] = await db.update(leads).set(data).where(eq(leads.id, id)).returning();
    return row;
  }
  async deleteLead(id: number) {
    await db.delete(leads).where(eq(leads.id, id));
  }

  // ─── Tasks ───────────────────────────────────────────────────────────────
  async getTasks() {
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }
  async createTask(task: InsertTask) {
    const [row] = await db.insert(tasks).values(task).returning();
    return row;
  }
  async updateTask(id: string, data: Partial<InsertTask>) {
    const [row] = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
    return row;
  }
  async deleteTask(id: string) {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // ─── Calendar Events ─────────────────────────────────────────────────────
  async getEvents() {
    return db.select().from(calendarEvents).orderBy(calendarEvents.date);
  }
  async createEvent(event: InsertCalendarEvent) {
    const [row] = await db.insert(calendarEvents).values(event).returning();
    return row;
  }
  async updateEvent(id: string, data: Partial<InsertCalendarEvent>) {
    const [row] = await db.update(calendarEvents).set(data).where(eq(calendarEvents.id, id)).returning();
    return row;
  }
  async deleteEvent(id: string) {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  // ─── Push Subscriptions (in-memory) ──────────────────────────────────────
  async savePushSubscription(sub: PushSubscription) {
    this.pushSubscriptions.set(sub.endpoint, sub);
  }
  async removePushSubscription(endpoint: string) {
    this.pushSubscriptions.delete(endpoint);
  }
  async getAllPushSubscriptions() {
    return Array.from(this.pushSubscriptions.values());
  }
}

export const storage = new DbStorage();
