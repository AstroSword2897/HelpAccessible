import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type SessionLogInput } from "@shared/routes";
import { z } from "zod";

export function useSessionLogs() {
  return useQuery({
    queryKey: [api.sessionLogs.list.path],
    queryFn: async () => {
      const res = await fetch(api.sessionLogs.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch session logs");
      
      const data = await res.json();
      // Handle potential date string to Date object coercion issues explicitly if needed,
      // but assuming the shared schema parses correctly if it uses z.coerce.date()
      try {
        return api.sessionLogs.list.responses[200].parse(data);
      } catch (err) {
        console.error("[Zod] sessionLogs.list validation failed:", err);
        throw err;
      }
    },
  });
}

export function useCreateSessionLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SessionLogInput) => {
      // Coerce numeric inputs just in case they come from HTML forms as strings
      const coercedData = {
        ...data,
        childId: Number(data.childId),
        responseTimeMs: data.responseTimeMs ? Number(data.responseTimeMs) : undefined,
      };
      
      const validated = api.sessionLogs.create.input.parse(coercedData);
      
      const res = await fetch(api.sessionLogs.create.path, {
        method: api.sessionLogs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.sessionLogs.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create session log");
      }
      return api.sessionLogs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sessionLogs.list.path] });
    },
  });
}
