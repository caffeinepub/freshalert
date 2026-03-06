import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ChefHat,
  Clock,
  Package,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { type Variants, motion } from "motion/react";
import { useState } from "react";
import type { Recipe } from "../backend.d";
import { AddFoodModal } from "../components/AddFoodModal";
import { RecipeDetailModal } from "../components/RecipeDetailModal";
import {
  foodExpiryDateMs,
  getDaysUntilExpiry,
  getExpiryStatus,
  useListFoods,
  useRecommendRecipes,
} from "../hooks/useQueries";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// ─── Category emoji mapping ───────────────────────────────────────────────────
const CATEGORY_EMOJIS: Record<string, string> = {
  Lácteos: "🥛",
  Carnes: "🥩",
  Verduras: "🥦",
  Frutas: "🍎",
  "Pescados y mariscos": "🐟",
  Huevos: "🥚",
  "Cereales y granos": "🌾",
  Legumbres: "🫘",
  "Panadería y repostería": "🍞",
  Congelados: "🧊",
  "Snacks y pasabocas": "🍿",
  Bebidas: "🥤",
  "Condimentos y salsas": "🧂",
  "Enlatados y conservas": "🥫",
};

function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJIS[category] ?? "🥫";
}

export default function Dashboard() {
  const { data: foods = [], isLoading: foodsLoading } = useListFoods();
  const { data: recommended = [], isLoading: recipesLoading } =
    useRecommendRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const expiringSoon = foods.filter((f) => {
    const days = getDaysUntilExpiry(f);
    return days > 0 && days <= 7;
  });
  const expired = foods.filter((f) => getDaysUntilExpiry(f) <= 0);
  const urgentFoods = foods
    .filter((f) => {
      const days = getDaysUntilExpiry(f);
      return days <= 3;
    })
    .sort((a, b) => foodExpiryDateMs(a) - foodExpiryDateMs(b));

  return (
    <main className="container max-w-5xl py-8 space-y-8 animate-fade-in">
      {/* Hero greeting */}
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          ¡Bienvenido a FreshAlert!
        </h1>
        <p className="text-muted-foreground text-base">
          Controla la caducidad de tus alimentos y reduce el desperdicio con
          recetas inteligentes.
        </p>
      </div>

      {/* Summary stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div variants={item}>
          <Card
            data-ocid="dashboard.total_card"
            className="glass-card border-border"
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total alimentos
              </CardTitle>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {foodsLoading ? (
                <Skeleton
                  className="h-8 w-12"
                  data-ocid="loading.loading_state"
                />
              ) : (
                <p className="font-display text-3xl font-bold">
                  {foods.length}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                en tu despensa
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card
            data-ocid="dashboard.expiring_card"
            className="glass-card border-border"
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Caducan pronto
              </CardTitle>
              <div className="w-9 h-9 rounded-xl bg-[oklch(var(--expiry-warning)/0.15)] flex items-center justify-center">
                <Clock className="h-5 w-5 text-[oklch(var(--expiry-warning))]" />
              </div>
            </CardHeader>
            <CardContent>
              {foodsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="font-display text-3xl font-bold text-[oklch(var(--expiry-warning))]">
                  {expiringSoon.length}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                en los próximos 7 días
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card
            data-ocid="dashboard.expired_card"
            className="glass-card border-border"
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Caducados
              </CardTitle>
              <div className="w-9 h-9 rounded-xl bg-[oklch(var(--expiry-expired)/0.15)] flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-[oklch(var(--expiry-expired))]" />
              </div>
            </CardHeader>
            <CardContent>
              {foodsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="font-display text-3xl font-bold text-[oklch(var(--expiry-expired))]">
                  {expired.length}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                requieren atención
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Urgent alerts */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[oklch(var(--expiry-urgent))]" />
            <h2 className="font-display text-lg font-semibold">
              Alertas urgentes
            </h2>
          </div>
          {urgentFoods.length > 0 && (
            <Badge className="bg-[oklch(var(--expiry-urgent)/0.15)] text-[oklch(var(--expiry-urgent))] border-[oklch(var(--expiry-urgent)/0.3)] border hover:bg-[oklch(var(--expiry-urgent)/0.2)]">
              {urgentFoods.length} alimento{urgentFoods.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {foodsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : urgentFoods.length === 0 ? (
          <Card className="glass-card border-dashed">
            <CardContent className="py-8 text-center">
              <div className="text-4xl mb-2">🌿</div>
              <p className="font-medium text-foreground">¡Todo bajo control!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ningún alimento caduca en los próximos 3 días.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ul data-ocid="dashboard.alerts.list" className="space-y-3">
            {urgentFoods.slice(0, 5).map((food, idx) => {
              const days = getDaysUntilExpiry(food);
              const status = getExpiryStatus(food);
              return (
                <li
                  key={food.id.toString()}
                  data-ocid={`dashboard.alerts.item.${idx + 1}`}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border",
                    status === "expired" &&
                      "bg-[oklch(var(--expiry-expired)/0.07)] border-[oklch(var(--expiry-expired)/0.2)]",
                    status === "urgent" &&
                      "bg-[oklch(var(--expiry-urgent)/0.07)] border-[oklch(var(--expiry-urgent)/0.2)]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {getCategoryEmoji(food.category)}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{food.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {food.quantity} {food.unit} · {food.category}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      status === "expired" &&
                        "text-[oklch(var(--expiry-expired))]",
                      status === "urgent" &&
                        "text-[oklch(var(--expiry-urgent))]",
                    )}
                  >
                    {days <= 0
                      ? "Caducado"
                      : days === 1
                        ? "Caduca hoy"
                        : `${days} días`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {urgentFoods.length === 0 && foods.length === 0 && !foodsLoading && (
          <div className="mt-4 flex justify-center">
            <AddFoodModal />
          </div>
        )}
      </motion.section>

      {/* Recommended recipes */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 className="font-display text-lg font-semibold">
            Recetas recomendadas
          </h2>
        </div>

        {recipesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : recommended.length === 0 ? (
          <Card className="glass-card border-dashed">
            <CardContent className="py-8 text-center">
              <div className="text-4xl mb-2">👨‍🍳</div>
              <p className="font-medium text-foreground">
                Sin recomendaciones aún
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Añade alimentos a tu despensa para recibir recetas
                personalizadas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ul
            data-ocid="dashboard.recipes.list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {recommended.slice(0, 3).map((recipe, idx) => (
              <li
                key={recipe.id.toString()}
                data-ocid={`dashboard.recipes.item.${idx + 1}`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedRecipe(recipe)}
                  className="w-full text-left"
                >
                  <Card className="glass-card border-border h-full hover:shadow-md transition-shadow duration-200 cursor-pointer group">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="font-display text-base leading-tight group-hover:text-primary transition-colors">
                          {recipe.name}
                        </CardTitle>
                        <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                          <ChefHat className="h-4 w-4 text-accent-foreground" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {recipe.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {recipe.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground">
                          {recipe.ingredients.length} ingredientes
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </li>
            ))}
          </ul>
        )}
      </motion.section>

      <RecipeDetailModal
        recipe={selectedRecipe}
        open={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </main>
  );
}
