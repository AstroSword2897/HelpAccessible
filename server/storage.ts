import { db } from "./db";
import {
  childProfiles,
  sessionLogs,
  prompts,
  type InsertChildProfile,
  type InsertSessionLog,
  type InsertPrompt,
  type ChildProfile,
  type SessionLog,
  type Prompt,
  type UpdateChildProfileRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getChildProfile(id: number): Promise<ChildProfile | undefined>;
  updateChildProfile(id: number, profile: UpdateChildProfileRequest): Promise<ChildProfile | undefined>;
  createChildProfile(profile: InsertChildProfile): Promise<ChildProfile>;
  
  createSessionLog(log: InsertSessionLog): Promise<SessionLog>;
  getSessionLogs(childId: number): Promise<SessionLog[]>;
  
  getPrompts(): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
}

export class DatabaseStorage implements IStorage {
  async getChildProfile(id: number): Promise<ChildProfile | undefined> {
    const [profile] = await db.select().from(childProfiles).where(eq(childProfiles.id, id));
    return profile;
  }

  async updateChildProfile(id: number, updates: UpdateChildProfileRequest): Promise<ChildProfile | undefined> {
    const [profile] = await db.update(childProfiles)
      .set(updates)
      .where(eq(childProfiles.id, id))
      .returning();
    return profile;
  }

  async createChildProfile(profile: InsertChildProfile): Promise<ChildProfile> {
    const [newProfile] = await db.insert(childProfiles).values(profile).returning();
    return newProfile;
  }

  async createSessionLog(log: InsertSessionLog): Promise<SessionLog> {
    const [newLog] = await db.insert(sessionLogs).values(log).returning();
    return newLog;
  }

  async getSessionLogs(childId: number): Promise<SessionLog[]> {
    return await db.select().from(sessionLogs).where(eq(sessionLogs.childId, childId));
  }

  async getPrompts(): Promise<Prompt[]> {
    return await db.select().from(prompts);
  }

  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const [newPrompt] = await db.insert(prompts).values(prompt).returning();
    return newPrompt;
  }
}

export const storage = new DatabaseStorage();