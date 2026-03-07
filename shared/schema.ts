import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type SensoryPreferences = {
  sound: boolean;
  vibration: boolean;
  visualFeedback: boolean;
};

export const childProfiles = pgTable("child_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull().default('default-avatar.png'),
  theme: text("theme").notNull().default('calm'),
  complexityLevel: integer("complexity_level").notNull().default(1),
  interfaceType: text("interface_type").notNull().default('hybrid'),
  sensoryPreferences: jsonb("sensory_preferences")
    .$type<SensoryPreferences>()
    .default({ sound: true, vibration: true, visualFeedback: true }),
});

export const sessionLogs = pgTable("session_logs", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  eventType: text("event_type").notNull(), 
  details: text("details").notNull(),
  isCorrect: boolean("is_correct"), 
  responseTimeMs: integer("response_time_ms"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  skillCategory: text("skill_category").notNull(),
  promptText: text("prompt_text").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  expectedResponse: text("expected_response").notNull(),
  complexityLevel: integer("complexity_level").notNull().default(1),
  isActive: boolean("is_active").default(true),
});

export const insertChildProfileSchema = createInsertSchema(childProfiles).omit({ id: true });
export const insertSessionLogSchema = createInsertSchema(sessionLogs).omit({ id: true, createdAt: true });
export const insertPromptSchema = createInsertSchema(prompts).omit({ id: true });

export type ChildProfile = typeof childProfiles.$inferSelect;
export type InsertChildProfile = z.infer<typeof insertChildProfileSchema>;
export type SessionLog = typeof sessionLogs.$inferSelect;
export type InsertSessionLog = z.infer<typeof insertSessionLogSchema>;
export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;

export type UpdateChildProfileRequest = Partial<InsertChildProfile>;

// ABA-aligned skill assessment: core + physical + advanced; support tier is descriptive
export type AssessmentDomainScores = {
  communication: number;
  social: number;
  adaptive: number;
  play: number;
  physical?: number;  // motor, sensory-motor
  advanced?: number; // executive function, academic readiness
};

export const skillAssessments = pgTable("skill_assessments", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  domainScores: jsonb("domain_scores").$type<AssessmentDomainScores>().notNull(),
  supportLevel: integer("support_level").notNull(),
  recommendedComplexity: integer("recommended_complexity").notNull().default(1),
  freeResponseData: jsonb("free_response_data").$type<Record<string, string>>(),
  aiSummary: text("ai_summary"),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertSkillAssessmentSchema = createInsertSchema(skillAssessments).omit({
  id: true,
  completedAt: true,
});

export type SkillAssessment = typeof skillAssessments.$inferSelect;
export type InsertSkillAssessment = z.infer<typeof insertSkillAssessmentSchema>;