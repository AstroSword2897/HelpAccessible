import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type SkillAssessmentResponse, type SkillAssessmentInput, type AssessmentAnalyzeInput, type AssessmentAnalyzeResponse } from "@shared/routes";

export function useSkillAssessment() {
  return useQuery({
    queryKey: [api.skillAssessment.getLatest.path],
    queryFn: async () => {
      const res = await fetch(api.skillAssessment.getLatest.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch skill assessment");
      const data = await res.json();
      return data as SkillAssessmentResponse;
    },
  });
}

export function useSubmitSkillAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SkillAssessmentInput) => {
      const res = await fetch(api.skillAssessment.submit.path, {
        method: api.skillAssessment.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        const msg = body?.message || res.statusText || "Failed to save assessment";
        throw new Error(msg);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.skillAssessment.getLatest.path] });
    },
  });
}

export function useAssessmentAnalyze() {
  return useMutation({
    mutationFn: async (input: AssessmentAnalyzeInput): Promise<AssessmentAnalyzeResponse> => {
      const res = await fetch(api.assessmentAnalyze.path, {
        method: api.assessmentAnalyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(body?.message ?? res.statusText ?? "Analysis failed");
      }
      return res.json();
    },
  });
}
