import { db, isDatabaseConfigured } from "./db";
import {
  childProfiles,
  sessionLogs,
  prompts,
  skillAssessments,
  type InsertChildProfile,
  type InsertSessionLog,
  type InsertPrompt,
  type InsertSkillAssessment,
  type ChildProfile,
  type SessionLog,
  type Prompt,
  type SkillAssessment,
  type UpdateChildProfileRequest,
  type AssessmentDomainScores,
} from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  getChildProfile(id: number): Promise<ChildProfile | undefined>;
  updateChildProfile(id: number, profile: UpdateChildProfileRequest): Promise<ChildProfile | undefined>;
  createChildProfile(profile: InsertChildProfile): Promise<ChildProfile>;
  
  createSessionLog(log: InsertSessionLog): Promise<SessionLog>;
  getSessionLogs(childId: number): Promise<SessionLog[]>;
  
  getPrompts(): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;

  getLatestSkillAssessment(childId: number): Promise<SkillAssessment | undefined>;
  createSkillAssessment(assessment: InsertSkillAssessment): Promise<SkillAssessment>;
}

function requireDatabase() {
  if (!db) {
    throw new Error("Database is not configured.");
  }

  return db;
}

export class DatabaseStorage implements IStorage {
  async getChildProfile(id: number): Promise<ChildProfile | undefined> {
    const database = requireDatabase();
    const [profile] = await database
      .select()
      .from(childProfiles)
      .where(eq(childProfiles.id, id));
    return profile;
  }

  async updateChildProfile(id: number, updates: UpdateChildProfileRequest): Promise<ChildProfile | undefined> {
    const database = requireDatabase();
    const [profile] = await database.update(childProfiles)
      .set(updates)
      .where(eq(childProfiles.id, id))
      .returning();
    return profile;
  }

  async createChildProfile(profile: InsertChildProfile): Promise<ChildProfile> {
    const database = requireDatabase();
    const [newProfile] = await database.insert(childProfiles).values(profile).returning();
    return newProfile;
  }

  async createSessionLog(log: InsertSessionLog): Promise<SessionLog> {
    const database = requireDatabase();
    const [newLog] = await database.insert(sessionLogs).values(log).returning();
    return newLog;
  }

  async getSessionLogs(childId: number): Promise<SessionLog[]> {
    const database = requireDatabase();
    return await database
      .select()
      .from(sessionLogs)
      .where(eq(sessionLogs.childId, childId))
      .orderBy(desc(sessionLogs.createdAt), desc(sessionLogs.id));
  }

  async getPrompts(): Promise<Prompt[]> {
    const database = requireDatabase();
    return await database.select().from(prompts).orderBy(prompts.id);
  }

  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const normalizedOptions = Array.from(
      prompt.options as ArrayLike<unknown>,
      (option) => String(option),
    );
    const database = requireDatabase();
    const [newPrompt] = await database
      .insert(prompts)
      .values({ ...prompt, options: normalizedOptions })
      .returning();
    return newPrompt;
  }

  async getLatestSkillAssessment(childId: number): Promise<SkillAssessment | undefined> {
    const database = requireDatabase();
    const [latest] = await database
      .select()
      .from(skillAssessments)
      .where(eq(skillAssessments.childId, childId))
      .orderBy(desc(skillAssessments.completedAt), desc(skillAssessments.id))
      .limit(1);
    return latest;
  }

  async createSkillAssessment(assessment: InsertSkillAssessment): Promise<SkillAssessment> {
    const database = requireDatabase();
    const [newAssessment] = await database
      .insert(skillAssessments)
      .values({
        ...assessment,
        domainScores: assessment.domainScores as AssessmentDomainScores,
      })
      .returning();
    return newAssessment;
  }
}

export class MemoryStorage implements IStorage {
  private childProfiles = new Map<number, ChildProfile>();
  private sessionLogs: SessionLog[] = [];
  private prompts: Prompt[] = [];
  private nextChildProfileId = 1;
  private nextSessionLogId = 1;
  private nextPromptId = 1;
  private skillAssessments: SkillAssessment[] = [];
  private nextSkillAssessmentId = 1;

  async getChildProfile(id: number): Promise<ChildProfile | undefined> {
    return this.childProfiles.get(id);
  }

  async updateChildProfile(
    id: number,
    updates: UpdateChildProfileRequest,
  ): Promise<ChildProfile | undefined> {
    const existing = this.childProfiles.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: ChildProfile = {
      ...existing,
      ...updates,
      sensoryPreferences:
        updates.sensoryPreferences ?? existing.sensoryPreferences ?? null,
    };

    this.childProfiles.set(id, updated);
    return updated;
  }

  async createChildProfile(profile: InsertChildProfile): Promise<ChildProfile> {
    const newProfile: ChildProfile = {
      id: this.nextChildProfileId++,
      name: profile.name,
      avatar: profile.avatar ?? "default-avatar.png",
      theme: profile.theme ?? "calm",
      complexityLevel: profile.complexityLevel ?? 1,
      interfaceType: profile.interfaceType ?? "hybrid",
      sensoryPreferences:
        profile.sensoryPreferences ?? {
          sound: true,
          vibration: true,
          visualFeedback: true,
        },
    };

    this.childProfiles.set(newProfile.id, newProfile);
    return newProfile;
  }

  async createSessionLog(log: InsertSessionLog): Promise<SessionLog> {
    const newLog: SessionLog = {
      id: this.nextSessionLogId++,
      childId: log.childId,
      eventType: log.eventType,
      details: log.details,
      isCorrect: log.isCorrect ?? null,
      responseTimeMs: log.responseTimeMs ?? null,
      createdAt: new Date(),
    };

    this.sessionLogs.unshift(newLog);
    return newLog;
  }

  async getSessionLogs(childId: number): Promise<SessionLog[]> {
    return this.sessionLogs.filter((log) => log.childId === childId);
  }

  async getPrompts(): Promise<Prompt[]> {
    return [...this.prompts].sort((a, b) => a.id - b.id);
  }

  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const normalizedOptions = Array.from(
      prompt.options as ArrayLike<unknown>,
      (option) => String(option),
    );
    const newPrompt: Prompt = {
      id: this.nextPromptId++,
      skillCategory: prompt.skillCategory,
      promptText: prompt.promptText,
      options: normalizedOptions,
      expectedResponse: prompt.expectedResponse,
      complexityLevel: prompt.complexityLevel ?? 1,
      isActive: prompt.isActive ?? true,
    };

    this.prompts.push(newPrompt);
    return newPrompt;
  }

  async getLatestSkillAssessment(childId: number): Promise<SkillAssessment | undefined> {
    const list = this.skillAssessments
      .filter((a) => a.childId === childId)
      .sort(
        (a, b) =>
          new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime(),
      );
    return list[0];
  }

  async createSkillAssessment(assessment: InsertSkillAssessment): Promise<SkillAssessment> {
    const newAssessment: SkillAssessment = {
      id: this.nextSkillAssessmentId++,
      childId: assessment.childId,
      domainScores: assessment.domainScores as AssessmentDomainScores,
      supportLevel: assessment.supportLevel,
      recommendedComplexity: assessment.recommendedComplexity ?? 1,
      freeResponseData: assessment.freeResponseData ?? null,
      aiSummary: assessment.aiSummary ?? null,
      completedAt: new Date(),
    };
    this.skillAssessments.push(newAssessment);
    return newAssessment;
  }
}

export const storage: IStorage = isDatabaseConfigured
  ? new DatabaseStorage()
  : new MemoryStorage();