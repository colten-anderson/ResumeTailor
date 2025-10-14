import { type ResumeSession, type InsertResumeSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createResumeSession(session: InsertResumeSession): Promise<ResumeSession>;
  getResumeSession(id: string): Promise<ResumeSession | undefined>;
  updateResumeSession(id: string, updates: Partial<ResumeSession>): Promise<ResumeSession | undefined>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, ResumeSession>;

  constructor() {
    this.sessions = new Map();
  }

  async createResumeSession(insertSession: InsertResumeSession): Promise<ResumeSession> {
    const id = randomUUID();
    const session: ResumeSession = { 
      ...insertSession, 
      id,
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async getResumeSession(id: string): Promise<ResumeSession | undefined> {
    return this.sessions.get(id);
  }

  async updateResumeSession(id: string, updates: Partial<ResumeSession>): Promise<ResumeSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updates };
    this.sessions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
