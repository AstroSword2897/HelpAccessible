import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function usePrompts() {
  return useQuery({
    queryKey: [api.prompts.list.path],
    queryFn: async () => {
      const res = await fetch(api.prompts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch prompts");
      
      const data = await res.json();
      try {
        return api.prompts.list.responses[200].parse(data);
      } catch (err) {
        console.error("[Zod] prompts.list validation failed:", err);
        throw err;
      }
    },
  });
}
