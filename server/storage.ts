import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import type { PushSubscription } from "web-push";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  savePushSubscription(subscription: PushSubscription): Promise<void>;
  removePushSubscription(endpoint: string): Promise<void>;
  getAllPushSubscriptions(): Promise<PushSubscription[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pushSubscriptions: Map<string, PushSubscription>;

  constructor() {
    this.users = new Map();
    this.pushSubscriptions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async savePushSubscription(subscription: PushSubscription): Promise<void> {
    this.pushSubscriptions.set(subscription.endpoint, subscription);
  }

  async removePushSubscription(endpoint: string): Promise<void> {
    this.pushSubscriptions.delete(endpoint);
  }

  async getAllPushSubscriptions(): Promise<PushSubscription[]> {
    return Array.from(this.pushSubscriptions.values());
  }
}

export const storage = new MemStorage();
