import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function ensureMvpData() {
  let profile = await storage.getChildProfile(1);

  if (!profile) {
    profile = await storage.createChildProfile({
      name: "Alex",
      avatar: "alex.png",
      theme: "calm",
      complexityLevel: 1,
      interfaceType: "hybrid",
      sensoryPreferences: {
        sound: true,
        vibration: true,
        visualFeedback: true,
      },
    });
  }

  const existingPrompts = await storage.getPrompts();
  if (existingPrompts.length === 0) {
    await storage.createPrompt({
      skillCategory: "social",
      promptText: "Greet someone",
      options: ["Hello", "Goodbye", "Wait"],
      expectedResponse: "Hello",
      complexityLevel: 1,
      isActive: true,
    });
    await storage.createPrompt({
      skillCategory: "communication",
      promptText: "Request a toy",
      options: ["Toy", "Food", "Drink"],
      expectedResponse: "Toy",
      complexityLevel: 1,
      isActive: true,
    });
    await storage.createPrompt({
      skillCategory: "communication",
      promptText: "Ask for help opening a jar",
      options: ["Help", "Stop", "Bathroom"],
      expectedResponse: "Help",
      complexityLevel: 2,
      isActive: true,
    });
    await storage.createPrompt({
      skillCategory: "emotional-regulation",
      promptText: "Tell someone you need a break",
      options: ["Stop", "More", "Hello"],
      expectedResponse: "Stop",
      complexityLevel: 2,
      isActive: true,
    });
  }

  return profile;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // GET /api/child-profile (Hardcoded ID 1 for MVP)
  app.get(api.childProfile.get.path, async (req, res) => {
    const profile = await ensureMvpData();
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
    await ensureMvpData();
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
    await ensureMvpData();
    const promptsList = await storage.getPrompts();
    res.json(promptsList);
  });

  // GET /api/skill-assessment (latest for child 1)
  app.get(api.skillAssessment.getLatest.path, async (req, res) => {
    await ensureMvpData();
    const latest = await storage.getLatestSkillAssessment(1);
    res.json(latest ?? null);
  });

  // POST /api/skill-assessment
  app.post(api.skillAssessment.submit.path, async (req, res) => {
    try {
      await ensureMvpData();
      const input = api.skillAssessment.submit.input.parse(req.body);
      const assessment = await storage.createSkillAssessment(input);
      res.status(201).json(assessment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      const message = err instanceof Error ? err.message : "Internal Server Error";
      console.error("[skill-assessment]", err);
      res.status(500).json({ message });
    }
  });

  // POST /api/assessment/analyze – run scale + free-response answers through model for needs summary
  app.post(api.assessmentAnalyze.path, async (req, res) => {
    try {
      const { scaleAnswers, freeResponses } = api.assessmentAnalyze.input.parse(req.body);
      const apiKey = process.env.OPENAI_API_KEY;
      let summary: string;
      let suggestedDomainScores: Record<string, number> | undefined;
      let suggestedSupportLevel: number | undefined;

      if (apiKey) {
        const prompt = `You are an autism support assessor. Based on the following caregiver assessment data, provide a brief, professional summary of support needs (communication, social, adaptive, play, physical, advanced) and recommend a support tier. Do not diagnose. Use plain language for caregivers.

Scale answers (1=limited, 2=emerging, 3=consistent): ${JSON.stringify(scaleAnswers)}

Free-text responses: ${JSON.stringify(freeResponses)}

Respond with a JSON object only: { "summary": "2-4 sentences", "suggestedDomainScores": { "communication": 1-3, "social": 1-3, "adaptive": 1-3, "play": 1-3, "physical": 1-3, "advanced": 1-3 }, "suggestedSupportLevel": 1 or 2 or 3 }`;

        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
          }),
        });
        if (!openaiRes.ok) {
          const errText = await openaiRes.text();
          return res.status(502).json({ message: `LLM error: ${errText.slice(0, 200)}` });
        }
        const data = (await openaiRes.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = data.choices?.[0]?.message?.content?.trim() ?? "";
        const parsed = JSON.parse(content.replace(/^```json?\s*|\s*```$/g, "")) as {
          summary?: string;
          suggestedDomainScores?: Record<string, number>;
          suggestedSupportLevel?: number;
        };
        summary = parsed.summary ?? "Summary not generated.";
        suggestedDomainScores = parsed.suggestedDomainScores;
        suggestedSupportLevel = parsed.suggestedSupportLevel;
      } else {
        const vals = Object.values(scaleAnswers).filter((v) => typeof v === "number");
        const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 2;
        const tier = avg <= 1.5 ? 3 : avg <= 2.5 ? 2 : 1;
        const freeText = Object.entries(freeResponses ?? {})
          .filter(([, v]) => v?.trim())
          .map(([k, v]) => `${k}: ${(v as string).slice(0, 80)}...`)
          .join("; ");
        summary = `Based on the scale answers (average ${avg.toFixed(1)}), support needs align with tier ${tier}. ${freeText ? `Caregiver notes: ${freeText}` : "No free-text notes provided."} Set OPENAI_API_KEY for an AI-generated summary.`;
        suggestedSupportLevel = tier;
      }

      res.json(api.assessmentAnalyze.responses[200].parse({ summary, suggestedDomainScores, suggestedSupportLevel }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      const message = err instanceof Error ? err.message : "Analysis failed";
      console.error("[assessment/analyze]", err);
      res.status(500).json({ message });
    }
  });

  return httpServer;
}