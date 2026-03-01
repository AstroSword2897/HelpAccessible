import { z } from 'zod';
import { insertChildProfileSchema, insertSessionLogSchema, insertPromptSchema, childProfiles, sessionLogs, prompts } from './schema';

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