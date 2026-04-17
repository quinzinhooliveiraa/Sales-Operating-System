import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/push/vapid-public-key", (_req, res) => {
    if (!VAPID_PUBLIC_KEY) {
      return res.status(500).json({ error: "VAPID keys not configured" });
    }
    res.json({ publicKey: VAPID_PUBLIC_KEY });
  });

  app.post("/api/push/subscribe", async (req, res) => {
    const result = subscriptionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid subscription", details: result.error });
    }
    await storage.savePushSubscription(result.data as any);
    res.status(201).json({ success: true });
  });

  app.post("/api/push/unsubscribe", async (req, res) => {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: "Endpoint required" });
    }
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

  return httpServer;
}
