import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Food, Recipe } from "../backend.d";
import { useActor } from "./useActor";

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function useListFoods() {
  const { actor, isFetching } = useActor();
  return useQuery<Food[]>({
    queryKey: ["foods"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFoods();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListRecipes() {
  const { actor, isFetching } = useActor();
  return useQuery<Recipe[]>({
    queryKey: ["recipes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRecipes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecommendRecipes() {
  const { actor, isFetching } = useActor();
  return useQuery<Recipe[]>({
    queryKey: ["recipes", "recommended"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.recommendRecipes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useExpiringFoods(days = 7) {
  const { actor, isFetching } = useActor();
  return useQuery<Food[]>({
    queryKey: ["foods", "expiring", days],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExpiringFoods(BigInt(days));
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export function useAddFood() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      category: string;
      quantity: number;
      unit: string;
      expiryDate: Date;
    }) => {
      if (!actor) throw new Error("Actor no disponible");
      const expiryNano = BigInt(params.expiryDate.getTime()) * 1_000_000n;
      return actor.addFood(
        params.name,
        params.category,
        params.quantity,
        params.unit,
        expiryNano,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
  });
}

export function useMarkFoodConsumed() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (foodId: bigint) => {
      if (!actor) throw new Error("Actor no disponible");
      return actor.markFoodConsumed(foodId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      queryClient.invalidateQueries({ queryKey: ["recipes", "recommended"] });
    },
  });
}

// ─── Utility ─────────────────────────────────────────────────────────────────

export function foodExpiryDateMs(food: Food): number {
  return Number(food.expiryDate) / 1_000_000;
}

export function getDaysUntilExpiry(food: Food): number {
  const expiryMs = foodExpiryDateMs(food);
  const now = Date.now();
  return Math.ceil((expiryMs - now) / (1000 * 60 * 60 * 24));
}

export type ExpiryStatus = "expired" | "urgent" | "warning" | "safe";

export function getExpiryStatus(food: Food): ExpiryStatus {
  const days = getDaysUntilExpiry(food);
  if (days <= 0) return "expired";
  if (days <= 3) return "urgent";
  if (days <= 7) return "warning";
  return "safe";
}

export function getExpiryLabel(food: Food): string {
  const days = getDaysUntilExpiry(food);
  if (days <= 0) return "Caducado";
  if (days === 1) return "Caduca hoy";
  return `${days} días`;
}
