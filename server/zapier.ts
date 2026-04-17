import { randomUUID } from "crypto";
import type { Lead, Task } from "../client/src/context/AppContext";

export interface ZapierConfig {
  apiKey: string;
  webhookUrls: {
    newLead: string;
    stageChange: string;
    taskCompleted: string;
    newTask: string;
  };
}

export interface InboundQueueItem {
  id: string;
  type: "lead" | "task";
  data: Partial<Lead> | Partial<Task>;
  receivedAt: string;
  consumed: boolean;
}

class ZapierStore {
  private config: ZapierConfig = {
    apiKey: randomUUID(),
    webhookUrls: {
      newLead: "",
      stageChange: "",
      taskCompleted: "",
      newTask: "",
    },
  };

  private inboundQueue: InboundQueueItem[] = [];

  getConfig(): ZapierConfig {
    return this.config;
  }

  updateWebhooks(webhookUrls: Partial<ZapierConfig["webhookUrls"]>) {
    this.config.webhookUrls = { ...this.config.webhookUrls, ...webhookUrls };
  }

  rotateApiKey(): string {
    this.config.apiKey = randomUUID();
    return this.config.apiKey;
  }

  validateApiKey(key: string): boolean {
    return key === this.config.apiKey;
  }

  addToQueue(item: Omit<InboundQueueItem, "id" | "receivedAt" | "consumed">) {
    this.inboundQueue.push({
      ...item,
      id: randomUUID(),
      receivedAt: new Date().toISOString(),
      consumed: false,
    });
  }

  getPendingQueue(): InboundQueueItem[] {
    return this.inboundQueue.filter((i) => !i.consumed);
  }

  consumeItem(id: string) {
    const item = this.inboundQueue.find((i) => i.id === id);
    if (item) item.consumed = true;
  }
}

export const zapierStore = new ZapierStore();

export async function triggerWebhook(
  url: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: eventType,
        timestamp: new Date().toISOString(),
        ...payload,
      }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
