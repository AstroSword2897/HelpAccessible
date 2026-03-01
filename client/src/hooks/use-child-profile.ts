import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ChildProfileResponse, type ChildProfileUpdateInput } from "@shared/routes";

export function useChildProfile() {
  return useQuery({
    queryKey: [api.childProfile.get.path],
    queryFn: async () => {
      const res = await fetch(api.childProfile.get.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch child profile");
      }
      return api.childProfile.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateChildProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: ChildProfileUpdateInput) => {
      const validated = api.childProfile.update.input.parse(updates);
      const res = await fetch(api.childProfile.update.path, {
        method: api.childProfile.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.childProfile.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to update profile");
      }
      return api.childProfile.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.childProfile.get.path] });
    },
  });
}
