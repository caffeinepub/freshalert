import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChefHat, Leaf, Sparkles, Star } from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { useState } from "react";
import type { Recipe } from "../backend.d";
import { RecipeDetailModal } from "../components/RecipeDetailModal";
import { useListRecipes, useRecommendRecipes } from "../hooks/useQueries";

// ─── Animation variants ──────────────────────────────────────────────────────

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariant: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// ─── RecipeCard ───────────────────────────────────────────────────────────────

function RecipeCard({
  recipe,
  onClick,
  highlighted,
  index,
  ocidPrefix,
}: {
  recipe: Recipe;
  onClick: () => void;
  highlighted?: boolean;
  index: number;
  ocidPrefix: string;
}) {
  return (
    <motion.li
      variants={itemVariant}
      data-ocid={`${ocidPrefix}.item.${index}`}
      className="list-none"
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left h-full"
      >
        <Card
          className={cn(
            "glass-card border-border h-full cursor-pointer group transition-all duration-200 hover:shadow-md",
            highlighted && "border-accent/40 bg-accent/5",
          )}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="font-display text-base leading-tight group-hover:text-primary transition-colors">
                {recipe.name}
              </CardTitle>
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                  highlighted ? "bg-accent/20" : "bg-primary/10",
                )}
              >
                {highlighted ? (
                  <Sparkles className="h-4 w-4 text-accent-foreground" />
                ) : (
                  <ChefHat className="h-4 w-4 text-primary" />
                )}
              </div>
            </div>
            <CardDescription className="text-xs line-clamp-2 mt-1">
              {recipe.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {recipe.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Leaf className="h-3 w-3" />
                <span>{recipe.ingredients.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </button>
    </motion.li>
  );
}

// ─── Section loading skeleton ─────────────────────────────────────────────────

function SectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          // biome-ignore lint/suspicious/noArrayIndexKey: loading placeholder
          key={i}
          className="h-36 rounded-xl"
          data-ocid="recipes.loading_state"
        />
      ))}
    </div>
  );
}

// ─── Section empty state ──────────────────────────────────────────────────────

function SectionEmpty({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="glass-card border-dashed" data-ocid="recipes.empty_state">
      <CardContent className="py-10 text-center">
        <div className="text-4xl mb-2">{emoji}</div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  emoji,
  title,
  subtitle,
  iconBg,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  iconBg: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0",
          iconBg,
        )}
      >
        <span role="img" aria-label={title}>
          {emoji}
        </span>
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ─── Recetas page ─────────────────────────────────────────────────────────────

export default function Recetas() {
  const {
    data: recipes = [],
    isLoading: recipesLoading,
    isError,
  } = useListRecipes();
  const { data: recommended = [], isLoading: recommendedLoading } =
    useRecommendRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // ── Receta del día — deterministic daily rotation ──────────────────────────
  const dayIndex =
    recipes.length > 0
      ? Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % recipes.length
      : 0;
  const recipeOfTheDay = recipes.length > 0 ? recipes[dayIndex] : null;

  // ── Filtered sections ──────────────────────────────────────────────────────
  const fastRecipes = recipes.filter((r) =>
    r.tags.some(
      (t) =>
        t.toLowerCase().includes("rápida") ||
        t.toLowerCase().includes("rapida"),
    ),
  );
  const healthyRecipes = recipes.filter((r) =>
    r.tags.some((t) => t.toLowerCase().includes("saludable")),
  );
  const kidsRecipes = recipes.filter((r) =>
    r.tags.some(
      (t) =>
        t.toLowerCase().includes("niños") || t.toLowerCase().includes("ninos"),
    ),
  );

  if (isError) {
    return (
      <main className="container max-w-5xl py-8">
        <div data-ocid="recipes.error_state" className="text-center py-16">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-semibold text-destructive">
            Error al cargar las recetas
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Comprueba tu conexión e inténtalo de nuevo.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container max-w-5xl py-8 space-y-12 animate-fade-in">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Recetas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Descubre recetas para aprovechar tus alimentos antes de que caduquen.
        </p>
      </div>

      {/* ── ⭐ Receta del día ────────────────────────────────────────────── */}
      <section aria-labelledby="recipe-of-day-heading">
        <SectionHeader
          emoji="⭐"
          title="Receta del día"
          subtitle="Una sugerencia fresca cada día"
          iconBg="bg-yellow-100"
        />

        {recipesLoading ? (
          <Skeleton
            className="h-52 rounded-2xl"
            data-ocid="recipes.loading_state"
          />
        ) : recipeOfTheDay ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <button
              type="button"
              onClick={() => setSelectedRecipe(recipeOfTheDay)}
              className="w-full text-left"
              data-ocid="recipes.daily.primary_button"
            >
              <Card className="relative overflow-hidden cursor-pointer group border-2 border-[oklch(0.82_0.15_70/0.6)] hover:border-[oklch(0.72_0.18_55/0.8)] transition-all duration-300 hover:shadow-xl">
                {/* Decorative background gradient */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 100% at 100% 0%, oklch(0.95 0.08 70 / 0.35) 0%, transparent 65%), radial-gradient(ellipse 60% 80% at 0% 100%, oklch(0.88 0.06 145 / 0.2) 0%, transparent 55%)",
                  }}
                />
                {/* Star decoration */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-25">
                  {[...Array(3)].map((_, i) => (
                    <Star
                      // biome-ignore lint/suspicious/noArrayIndexKey: decorative stars
                      key={i}
                      className="h-4 w-4 fill-current text-yellow-500"
                    />
                  ))}
                </div>

                <CardHeader className="relative pb-3 pt-6 px-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 border border-yellow-200/60 flex items-center justify-center shrink-0 shadow-sm">
                      <ChefHat className="h-7 w-7 text-[oklch(0.55_0.18_55)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-[oklch(0.82_0.15_70/0.3)] text-[oklch(0.38_0.14_55)] border-[oklch(0.72_0.18_55/0.4)] border text-xs font-semibold px-2.5">
                          ⭐ Receta del día
                        </Badge>
                      </div>
                      <CardTitle className="font-display text-2xl leading-tight group-hover:text-primary transition-colors">
                        {recipeOfTheDay.name}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2 mt-2 text-muted-foreground">
                        {recipeOfTheDay.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative px-6 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {recipeOfTheDay.tags.slice(0, 4).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0 ml-3">
                      <div className="flex items-center gap-1">
                        <Leaf className="h-4 w-4" />
                        <span>
                          {recipeOfTheDay.ingredients.length} ingredientes
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          </motion.div>
        ) : (
          <SectionEmpty
            emoji="⭐"
            title="Sin receta del día"
            description="Las recetas se añadirán automáticamente al sistema."
          />
        )}
      </section>

      {/* ── 🥦 Recetas con alimentos por caducar ────────────────────────── */}
      <section aria-labelledby="expiring-recipes-heading">
        <SectionHeader
          emoji="🥦"
          title="Recetas con alimentos por caducar"
          subtitle="Aprovecha lo que tienes antes de que se eche a perder"
          iconBg="bg-green-100"
        />

        {recommendedLoading ? (
          <SectionSkeleton count={3} />
        ) : recommended.length === 0 ? (
          <SectionEmpty
            emoji="🛒"
            title="Sin recomendaciones por ahora"
            description="Añade alimentos a tu despensa para recibir recetas personalizadas basadas en lo que está por caducar."
          />
        ) : (
          <motion.ul
            data-ocid="recipes.recommended.list"
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {recommended.map((recipe, idx) => (
              <RecipeCard
                key={recipe.id.toString()}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
                highlighted
                index={idx + 1}
                ocidPrefix="recipes.recommended"
              />
            ))}
          </motion.ul>
        )}
      </section>

      {/* ── ⚡ Recetas rápidas ───────────────────────────────────────────── */}
      <section aria-labelledby="fast-recipes-heading">
        <SectionHeader
          emoji="⚡"
          title="Recetas rápidas"
          subtitle="Listas en menos de 15 minutos"
          iconBg="bg-amber-100"
        />

        {recipesLoading ? (
          <SectionSkeleton count={3} />
        ) : fastRecipes.length === 0 ? (
          <SectionEmpty
            emoji="⚡"
            title="Sin recetas rápidas"
            description="No hay recetas rápidas disponibles en este momento."
          />
        ) : (
          <motion.ul
            data-ocid="recipes.fast.list"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {fastRecipes.map((recipe, idx) => (
              <RecipeCard
                key={recipe.id.toString()}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
                index={idx + 1}
                ocidPrefix="recipes.fast"
              />
            ))}
          </motion.ul>
        )}
      </section>

      {/* ── 🥗 Recetas saludables ─────────────────────────────────────────── */}
      <section aria-labelledby="healthy-recipes-heading">
        <SectionHeader
          emoji="🥗"
          title="Recetas saludables"
          subtitle="Nutre tu cuerpo con lo mejor"
          iconBg="bg-emerald-100"
        />

        {recipesLoading ? (
          <SectionSkeleton count={3} />
        ) : healthyRecipes.length === 0 ? (
          <SectionEmpty
            emoji="🥗"
            title="Sin recetas saludables"
            description="No hay recetas saludables disponibles en este momento."
          />
        ) : (
          <motion.ul
            data-ocid="recipes.healthy.list"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {healthyRecipes.map((recipe, idx) => (
              <RecipeCard
                key={recipe.id.toString()}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
                index={idx + 1}
                ocidPrefix="recipes.healthy"
              />
            ))}
          </motion.ul>
        )}
      </section>

      {/* ── 👶 Recetas para niños ─────────────────────────────────────────── */}
      <section aria-labelledby="kids-recipes-heading">
        <SectionHeader
          emoji="👶"
          title="Recetas para niños"
          subtitle="Nutritivas, divertidas y fáciles de preparar"
          iconBg="bg-pink-100"
        />

        {recipesLoading ? (
          <SectionSkeleton count={3} />
        ) : kidsRecipes.length === 0 ? (
          <SectionEmpty
            emoji="👶"
            title="Sin recetas para niños"
            description="No hay recetas especiales para niños disponibles en este momento."
          />
        ) : (
          <motion.ul
            data-ocid="recipes.kids.list"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {kidsRecipes.map((recipe, idx) => (
              <RecipeCard
                key={recipe.id.toString()}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
                index={idx + 1}
                ocidPrefix="recipes.kids"
              />
            ))}
          </motion.ul>
        )}
      </section>

      {/* ── All recipes (fallback catalog) ───────────────────────────────── */}
      <section aria-labelledby="all-recipes-heading">
        <SectionHeader
          emoji="📖"
          title="Todas las recetas"
          subtitle={`${recipes.length} receta${recipes.length !== 1 ? "s" : ""} disponible${recipes.length !== 1 ? "s" : ""}`}
          iconBg="bg-primary/10"
        />

        {recipesLoading ? (
          <SectionSkeleton count={6} />
        ) : recipes.length === 0 ? (
          <SectionEmpty
            emoji="📖"
            title="No hay recetas disponibles"
            description="Las recetas se añadirán automáticamente al sistema."
          />
        ) : (
          <motion.ul
            data-ocid="recipes.all.list"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {recipes.map((recipe, idx) => (
              <RecipeCard
                key={recipe.id.toString()}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
                index={idx + 1}
                ocidPrefix="recipes.all"
              />
            ))}
          </motion.ul>
        )}
      </section>

      <AnimatePresence>
        {selectedRecipe && (
          <RecipeDetailModal
            recipe={selectedRecipe}
            open={!!selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
