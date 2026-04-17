import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { zapierStore, triggerWebhook } from "./zapier";
import webpush from "web-push";
import { z } from "zod";
import { insertLeadSchema, insertTaskSchema, insertCalendarEventSchema, insertStageSchema } from "@shared/schema";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:admin@olivaros.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key = (req.headers["x-api-key"] as string) || (req.query.api_key as string);
  if (!key || !zapierStore.validateApiKey(key)) {
    return res.status(401).json({ error: "Invalid or missing API key" });
  }
  next();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ─── Settings ───────────────────────────────────────────────────────────
  app.get("/api/settings", async (_req, res) => {
    res.json(await storage.getSettings());
  });
  app.patch("/api/settings", async (req, res) => {
    res.json(await storage.upsertSettings(req.body));
  });

  // ─── Stages ─────────────────────────────────────────────────────────────
  app.get("/api/stages", async (_req, res) => {
    res.json(await storage.getStages());
  });
  app.put("/api/stages/:id", async (req, res) => {
    const result = insertStageSchema.safeParse({ ...req.body, id: req.params.id });
    if (!result.success) return res.status(400).json({ error: result.error });
    res.json(await storage.upsertStage(result.data));
  });
  app.delete("/api/stages/:id", async (req, res) => {
    await storage.deleteStage(req.params.id);
    res.json({ success: true });
  });

  // ─── Leads ──────────────────────────────────────────────────────────────
  app.get("/api/leads", async (_req, res) => {
    res.json(await storage.getLeads());
  });
  app.get("/api/leads/:id", async (req, res) => {
    const lead = await storage.getLead(Number(req.params.id));
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  });
  app.post("/api/leads", async (req, res) => {
    const result = insertLeadSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const lead = await storage.createLead(result.data);
    res.status(201).json(lead);
  });
  app.patch("/api/leads/:id", async (req, res) => {
    const lead = await storage.updateLead(Number(req.params.id), req.body);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  });
  app.delete("/api/leads/:id", async (req, res) => {
    await storage.deleteLead(Number(req.params.id));
    res.json({ success: true });
  });

  // ─── Tasks ──────────────────────────────────────────────────────────────
  app.get("/api/tasks", async (_req, res) => {
    res.json(await storage.getTasks());
  });
  app.post("/api/tasks", async (req, res) => {
    const result = insertTaskSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const task = await storage.createTask(result.data);
    res.status(201).json(task);
  });
  app.patch("/api/tasks/:id", async (req, res) => {
    const task = await storage.updateTask(req.params.id, req.body);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  });
  app.delete("/api/tasks/:id", async (req, res) => {
    await storage.deleteTask(req.params.id);
    res.json({ success: true });
  });

  // ─── Calendar Events ─────────────────────────────────────────────────────
  app.get("/api/events", async (_req, res) => {
    res.json(await storage.getEvents());
  });
  app.post("/api/events", async (req, res) => {
    const result = insertCalendarEventSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const event = await storage.createEvent(result.data);
    res.status(201).json(event);
  });
  app.patch("/api/events/:id", async (req, res) => {
    const event = await storage.updateEvent(req.params.id, req.body);
    res.json(event);
  });
  app.delete("/api/events/:id", async (req, res) => {
    await storage.deleteEvent(req.params.id);
    res.json({ success: true });
  });

  // ─── Push Notifications ──────────────────────────────────────────────────
  app.get("/api/push/vapid-public-key", (_req, res) => {
    if (!VAPID_PUBLIC_KEY) return res.status(500).json({ error: "VAPID keys not configured" });
    res.json({ publicKey: VAPID_PUBLIC_KEY });
  });
  app.post("/api/push/subscribe", async (req, res) => {
    await storage.savePushSubscription(req.body);
    res.status(201).json({ success: true });
  });
  app.post("/api/push/unsubscribe", async (req, res) => {
    if (!req.body.endpoint) return res.status(400).json({ error: "Endpoint required" });
    await storage.removePushSubscription(req.body.endpoint);
    res.json({ success: true });
  });
  app.post("/api/push/send", async (req, res) => {
    const subscriptions = await storage.getAllPushSubscriptions();
    if (!subscriptions.length) return res.json({ success: true, sent: 0 });
    const payload = JSON.stringify(req.body);
    let sent = 0, failed = 0;
    await Promise.all(subscriptions.map(async (sub) => {
      try { await webpush.sendNotification(sub, payload); sent++; }
      catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) await storage.removePushSubscription(sub.endpoint);
        failed++;
      }
    }));
    res.json({ success: true, sent, failed });
  });

  // ─── Zapier ──────────────────────────────────────────────────────────────
  app.get("/api/zapier/config", (_req, res) => res.json(zapierStore.getConfig()));
  app.post("/api/zapier/config", (req, res) => {
    if (req.body.webhookUrls) zapierStore.updateWebhooks(req.body.webhookUrls);
    res.json({ success: true, config: zapierStore.getConfig() });
  });
  app.post("/api/zapier/rotate-key", (_req, res) => {
    res.json({ success: true, apiKey: zapierStore.rotateApiKey() });
  });
  app.post("/api/zapier/trigger", async (req, res) => {
    const { event, payload } = req.body;
    const config = zapierStore.getConfig();
    const urlMap: Record<string, string> = {
      new_lead: config.webhookUrls.newLead,
      stage_change: config.webhookUrls.stageChange,
      task_completed: config.webhookUrls.taskCompleted,
      new_task: config.webhookUrls.newTask,
    };
    const sent = await triggerWebhook(urlMap[event] || "", event, payload);
    res.json({ success: true, sent });
  });
  app.post("/api/zapier/inbound/lead", requireApiKey, async (req, res) => {
    if (!req.body.name) return res.status(400).json({ error: "Lead name is required" });
    zapierStore.addToQueue({ type: "lead", data: req.body });
    res.status(201).json({ success: true, message: "Lead queued for import" });
  });
  app.post("/api/zapier/inbound/task", requireApiKey, async (req, res) => {
    if (!req.body.title) return res.status(400).json({ error: "Task title is required" });
    zapierStore.addToQueue({ type: "task", data: req.body });
    res.status(201).json({ success: true, message: "Task queued for import" });
  });
  app.get("/api/zapier/inbound/queue", (_req, res) => {
    res.json({ items: zapierStore.getPendingQueue() });
  });
  app.post("/api/zapier/inbound/consume", (req, res) => {
    if (!req.body.id) return res.status(400).json({ error: "id required" });
    zapierStore.consumeItem(req.body.id);
    res.json({ success: true });
  });
  app.get("/api/zapier/leads", requireApiKey, async (_req, res) => {
    const allLeads = await storage.getLeads();
    res.json(allLeads);
  });

  return httpServer;
}
