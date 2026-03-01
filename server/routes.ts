import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // GET /api/child-profile (Hardcoded ID 1 for MVP)
  app.get(api.childProfile.get.path, async (req, res) => {
    let profile = await storage.getChildProfile(1);
    if (!profile) {
      // Auto-create MVP profile if not exists
      profile = await storage.createChildProfile({
        name: "Alex",
        avatar: "alex.png",
        theme: "calm",
        complexityLevel: 1,
        interfaceType: "hybrid",
        sensoryPreferences: { sound: true, vibration: true, visualFeedback: true }
      });
      
      // Also auto-seed some initial prompts
      const existingPrompts = await storage.getPrompts();
      if (existingPrompts.length === 0) {
        await storage.createPrompt({
          skillCategory: "social",
          promptText: "Greet someone",
          options: ["Hello", "Goodbye", "Wait"],
          expectedResponse: "Hello",
          complexityLevel: 1,
          isActive: true
        });
        await storage.createPrompt({
          skillCategory: "communication",
          promptText: "Request a toy",
          options: ["Toy", "Food", "Drink"],
          expectedResponse: "Toy",
          complexityLevel: 1,
          isActive: true
        });
      }
    }
    res.json(profile);
  });

  // PUT /api/child-profile
  app.put(api.childProfile.update.path, async (req, res) => {
    try {
      const input = api.childProfile.update.input.parse(req.body);
      const profile = await storage.updateChildProfile(1, input);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // GET /api/session-logs
  app.get(api.sessionLogs.list.path, async (req, res) => {
    const logs = await storage.getSessionLogs(1);
    res.json(logs);
  });

  // POST /api/session-logs
  app.post(api.sessionLogs.create.path, async (req, res) => {
    try {
      const input = api.sessionLogs.create.input.parse(req.body);
      const log = await storage.createSessionLog(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // GET /api/prompts
  app.get(api.prompts.list.path, async (req, res) => {
    const promptsList = await storage.getPrompts();
    res.json(promptsList);
  });

  return httpServer;
}