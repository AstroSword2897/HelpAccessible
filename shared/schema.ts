import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const childProfiles = pgTable("child_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull().default('default-avatar.png'),
  theme: text("theme").notNull().default('calm'),
  complexityLevel: integer("complexity_level").notNull().default(1),
  interfaceType: text("interface_type").notNull().default('hybrid'),
  sensoryPreferences: jsonb("sensory_preferences").default({ sound: true, vibration: true, visualFeedback: true }),
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
  options: jsonb("options").notNull(), // array of strings
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