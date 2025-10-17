import { db } from "./db";
import { users, resumeSessions, type User, type UpsertUser, type ResumeSession, type InsertResumeSession } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Resume session operations
  createResumeSession(session: InsertResumeSession): Promise<ResumeSession>;
  getResumeSession(id: string): Promise<ResumeSession | undefined>;
  updateResumeSession(id: string, updates: Partial<ResumeSession>): Promise<ResumeSession | undefined>;
  getUserResumeSessions(userId: string): Promise<ResumeSession[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Resume session operations
  async createResumeSession(sessionData: InsertResumeSession): Promise<ResumeSession> {
    const [session] = await db
      .insert(resumeSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getResumeSession(id: string): Promise<ResumeSession | undefined> {
    const [session] = await db
      .select()
      .from(resumeSessions)
      .where(eq(resumeSessions.id, id));
    return session;
  }

  async updateResumeSession(id: string, updates: Partial<ResumeSession>): Promise<ResumeSession | undefined> {
    const [session] = await db
      .update(resumeSessions)
      .set(updates)
      .where(eq(resumeSessions.id, id))
      .returning();
    return session;
  }

  async getUserResumeSessions(userId: string): Promise<ResumeSession[]> {
    return await db
      .select()
      .from(resumeSessions)
      .where(eq(resumeSessions.userId, userId));
  }
}

export const storage = new DatabaseStorage();
