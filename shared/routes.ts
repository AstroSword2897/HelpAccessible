import { z } from 'zod';
import { insertChildProfileSchema, insertSessionLogSchema, insertPromptSchema, insertSkillAssessmentSchema, childProfiles, sessionLogs, prompts, skillAssessments } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  childProfile: {
    get: {
      method: 'GET' as const,
      path: '/api/child-profile' as const,
      responses: {
        200: z.custom<typeof childProfiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/child-profile' as const,
      input: insertChildProfileSchema.partial(),
      responses: {
        200: z.custom<typeof childProfiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  sessionLogs: {
    list: {
      method: 'GET' as const,
      path: '/api/session-logs' as const,
      responses: {
        200: z.array(z.custom<typeof sessionLogs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/session-logs' as const,
      input: insertSessionLogSchema,
      responses: {
        201: z.custom<typeof sessionLogs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  prompts: {
    list: {
      method: 'GET' as const,
      path: '/api/prompts' as const,
      responses: {
        200: z.array(z.custom<typeof prompts.$inferSelect>()),
      },
    },
  },
  skillAssessment: {
    getLatest: {
      method: 'GET' as const,
      path: '/api/skill-assessment' as const,
      responses: {
        200: z.custom<typeof skillAssessments.$inferSelect>().nullable(),
      },
    },
    submit: {
      method: 'POST' as const,
      path: '/api/skill-assessment' as const,
      input: insertSkillAssessmentSchema,
      responses: {
        201: z.custom<typeof skillAssessments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  assessmentAnalyze: {
    method: 'POST' as const,
    path: '/api/assessment/analyze' as const,
    input: z.object({
      scaleAnswers: z.record(z.string(), z.number()),
      freeResponses: z.record(z.string(), z.string()),
    }),
    responses: {
      200: z.object({
        summary: z.string(),
        suggestedDomainScores: z.record(z.string(), z.number()).optional(),
        suggestedSupportLevel: z.number().optional(),
      }),
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ChildProfileResponse = z.infer<typeof api.childProfile.get.responses[200]>;
export type ChildProfileUpdateInput = z.infer<typeof api.childProfile.update.input>;
export type SessionLogListResponse = z.infer<typeof api.sessionLogs.list.responses[200]>;
export type SessionLogInput = z.infer<typeof api.sessionLogs.create.input>;
export type PromptsListResponse = z.infer<typeof api.prompts.list.responses[200]>;
export type SkillAssessmentResponse = z.infer<typeof api.skillAssessment.getLatest.responses[200]>;
export type SkillAssessmentInput = z.infer<typeof api.skillAssessment.submit.input>;
export type AssessmentAnalyzeInput = z.infer<typeof api.assessmentAnalyze.input>;
export type AssessmentAnalyzeResponse = z.infer<typeof api.assessmentAnalyze.responses[200]>;