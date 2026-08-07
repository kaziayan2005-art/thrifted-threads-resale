import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isMockMode } from "@/lib/supabase";
import type { GradingDefinition } from "@/lib/database.types";

const mockGradingDefinitions: GradingDefinition[] = [
  { id: "1", label: "New with Tags",     description: "Never worn. Original tags attached. Mint condition.",                              sort_order: 1, created_at: "" },
  { id: "2", label: "Photoshoot Sample", description: "Worn exclusively for a photoshoot or campaign. No signs of personal wear.",       sort_order: 2, created_at: "" },
  { id: "3", label: "Worn Once",         description: "Worn a single time. No visible flaws unless explicitly noted.",                   sort_order: 3, created_at: "" },
  { id: "4", label: "Gently Used",       description: "Shows light signs of wear. Any flaws are photographed and described in detail.", sort_order: 4, created_at: "" },
];

export function useGradingScale() {
  return useQuery({
    queryKey: ["grading-definitions"],
    queryFn: async (): Promise<GradingDefinition[]> => {
      if (isMockMode) return mockGradingDefinitions;
      const { data, error } = await supabase.from("grading_definitions").select("*").order("sort_order");
      if (error) throw error;
      return data as GradingDefinition[];
    },
  });
}

export function useCreateGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ label, description, sort_order }: { label: string; description: string; sort_order?: number }) => {
      if (isMockMode) return;
      const { data: existing } = await supabase.from("grading_definitions").select("sort_order");
      const nextSortOrder = sort_order ?? ((existing?.length ?? 0) + 1);
      const { error } = await supabase.from("grading_definitions").insert({ label, description, sort_order: nextSortOrder });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grading-definitions"] }),
  });
}

export function useDeleteGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isMockMode) return;
      const { error } = await supabase.from("grading_definitions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grading-definitions"] }),
  });
}
