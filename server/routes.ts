import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { zapierStore, triggerWebhook } from "./zapier";
import webpush from "web-push";
import { z } from "zod";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:admin@olivaros.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

const notificationSchema = z.object({
  title: z.string().default("Olivar OS"),
  body: z.string(),
  url: z.string().optional(),
  tag: z.string().optional(),
  requireInteraction: z.boolean().optional(),
});

function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key =
    (req.headers["x-api-key"] as string) ||
    (req.query.api_key as string);
  if (!key || !zapierStore.validateApiKey(key)) {
    return res.status(401).json({ error: "Invalid or missing API key" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ─── Push Notification Routes ────────────────────────────────────────
  app.get("/api/push/vapid-public-key", (_req, res) => {
    if (!VAPID_PUBLIC_KEY) {
      return res.status(500).json({ error: "VAPID keys not configured" });
    }
    res.json({ publicKey: VAPID_PUBLIC_KEY });
  });

  app.post("/api/push/subscribe", async (req, res) => {
    const result = subscriptionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid subscription" });
    }
    await storage.savePushSubscription(result.data as any);
    res.status(201).json({ success: true });
  });

  app.post("/api/push/unsubscribe", async (req, res) => {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ error: "Endpoint required" });
    await storage.removePushSubscription(endpoint);
    res.json({ success: true });
  });

  app.post("/api/push/send", async (req, res) => {
    const result = notificationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid notification payload" });
    }
    const subscriptions = await storage.getAllPushSubscriptions();
    if (subscriptions.length === 0) {
      return res.json({ success: true, sent: 0, message: "No subscribers" });
    }
    const payload = JSON.stringify(result.data);
    let sent = 0;
    let failed = 0;
    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub, payload);
          sent++;
        } catch (err: any) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await storage.removePushSubscription(sub.endpoint);
          }
          failed++;
        }
      })
    );
    res.json({ success: true, sent, failed });
  });

  // ─── Zapier Config Routes (internal) ─────────────────────────────────
  app.get("/api/zapier/config", (_req, res) => {
    res.json(zapierStore.getConfig());
  });

  app.post("/api/zapier/config", (req, res) => {
    const { webhookUrls } = req.body;
    if (webhookUrls) {
      zapierStore.updateWebhooks(webhookUrls);
    }
    res.json({ success: true, config: zapierStore.getConfig() });
  });

  app.post("/api/zapier/rotate-key", (_req, res) => {
    const newKey = zapierStore.rotateApiKey();
    res.json({ success: true, apiKey: newKey });
  });

  // ─── Zapier Outbound Trigger (called by frontend on events) ──────────
  app.post("/api/zapier/trigger", async (req, res) => {
    const { event, payload } = req.body;
    const config = zapierStore.getConfig();
    const urlMap: Record<string, string> = {
      new_lead: config.webhookUrls.newLead,
      stage_change: config.webhookUrls.stageChange,
      task_completed: config.webhookUrls.taskCompleted,
      new_task: config.webhookUrls.newTask,
    };
    const url = urlMap[event];
    const sent = await triggerWebhook(url, event, payload);
    res.json({ success: true, sent });
  });

  // ─── Zapier Inbound REST API (API key required) ───────────────────────
  app.post("/api/zapier/inbound/lead", requireApiKey, (req, res) => {
    const data = req.body;
    if (!data.name) {
      return res.status(400).json({ error: "Lead name is required" });
    }
    zapierStore.addToQueue({ type: "lead", data });
    res.status(201).json({
      success: true,
      message: "Lead queued for import",
      id: Date.now(),
    });
  });

  app.post("/api/zapier/inbound/task", requireApiKey, (req, res) => {
    const data = req.body;
    if (!data.title) {
      return res.status(400).json({ error: "Task title is required" });
    }
    zapierStore.addToQueue({ type: "task", data });
    res.status(201).json({
      success: true,
      message: "Task queued for import",
      id: Date.now(),
    });
  });

  // ─── Frontend polls this to pick up Zapier-sent items ────────────────
  app.get("/api/zapier/inbound/queue", (_req, res) => {
    const pending = zapierStore.getPendingQueue();
    res.json({ items: pending });
  });

  app.post("/api/zapier/inbound/consume", (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "id required" });
    zapierStore.consumeItem(id);
    res.json({ success: true });
  });

  // ─── Zapier REST Triggers (Zapier polls these) ────────────────────────
  app.get("/api/zapier/leads", requireApiKey, (_req, res) => {
    res.json({
      message: "Connect from the CRM frontend to retrieve live data",
      sample: [
        {
          id: 1,
          name: "Sample Lead",
          email: "lead@example.com",
          company: "Acme Corp",
          stage: "Novo",
          value: "R$ 10.000",
        },
      ],
    });
  });

  return httpServer;
}
