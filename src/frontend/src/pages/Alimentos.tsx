import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, SlidersHorizontal, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Food } from "../backend.d";
import { AddFoodModal } from "../components/AddFoodModal";
import { ExpiryBadge } from "../components/ExpiryBadge";
import {
  foodExpiryDateMs,
  getDaysUntilExpiry,
  useListFoods,
  useMarkFoodConsumed,
} from "../hooks/useQueries";

const CATEGORIES = [
  "Todos",
  "Lácteos",
  "Carnes",
  "Verduras",
  "Frutas",
  "Pescados y mariscos",
  "Huevos",
  "Cereales y granos",
  "Legumbres",
  "Panadería y repostería",
  "Congelados",
  "Snacks y pasabocas",
  "Bebidas",
  "Condimentos y salsas",
  "Enlatados y conservas",
];

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

function FoodCard({
  food,
  index,
  onConsume,
  onDelete,
  isConsuming,
}: {
  food: Food;
  index: number;
  onConsume: (id: bigint) => void;
  onDelete: (id: bigint) => void;
  isConsuming: boolean;
}) {
  const expiryDate = new Date(foodExpiryDateMs(food));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      data-ocid={`food.item.${index}`}
    >
      <Card className="glass-card border-border hover:shadow-sm transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5 shrink-0">
              {CATEGORY_EMOJIS[food.category] ?? "🥫"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm leading-tight truncate">
                  {food.name}
                </h3>
                <ExpiryBadge food={food} className="shrink-0" />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {food.quantity} {food.unit}
                </span>
                <span>·</span>
                <span>{food.category}</span>
                <span>·</span>
                <span>Caduca: {expiryDate.toLocaleDateString("es-ES")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              data-ocid={`food.consume_button.${index}`}
              onClick={() => onConsume(food.id)}
              disabled={isConsuming}
              className="flex-1 gap-1.5 text-xs h-8"
            >
              {isConsuming ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              )}
              Marcar consumido
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid={`food.delete_button.${index}`}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar alimento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se eliminará <strong>{food.name}</strong> de tu despensa.
                    Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="food.delete.cancel_button">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="food.delete.confirm_button"
                    onClick={() => onDelete(food.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Alimentos() {
  const { data: foods = [], isLoading, isError } = useListFoods();
  const markConsumed = useMarkFoodConsumed();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [consumingId, setConsumingId] = useState<bigint | null>(null);

  const filteredFoods = foods
    .filter((f) => activeCategory === "Todos" || f.category === activeCategory)
    .sort((a, b) => foodExpiryDateMs(a) - foodExpiryDateMs(b));

  const handleConsume = async (foodId: bigint) => {
    setConsumingId(foodId);
    try {
      await markConsumed.mutateAsync(foodId);
      toast.success("¡Alimento marcado como consumido!");
    } catch {
      toast.error("Error al actualizar el alimento.");
    } finally {
      setConsumingId(null);
    }
  };

  const handleDelete = async (foodId: bigint) => {
    try {
      await markConsumed.mutateAsync(foodId);
      toast.success("Alimento eliminado de tu despensa.");
    } catch {
      toast.error("Error al eliminar el alimento.");
    }
  };

  if (isError) {
    return (
      <main className="container max-w-5xl py-8">
        <div data-ocid="error.error_state" className="text-center py-16">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-semibold text-destructive">
            Error al cargar los alimentos
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Comprueba tu conexión e inténtalo de nuevo.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container max-w-5xl py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Mis alimentos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {foods.length} alimento{foods.length !== 1 ? "s" : ""} en tu
            despensa
          </p>
        </div>
        <AddFoodModal />
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <TabsList
            data-ocid="food.filter.tab"
            className="flex-wrap h-auto gap-1 bg-muted/50 p-1"
          >
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="text-xs px-3 py-1.5"
              >
                {cat !== "Todos" && (
                  <span className="mr-1">{CATEGORY_EMOJIS[cat]}</span>
                )}
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Food list */}
      {isLoading ? (
        <div
          data-ocid="loading.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : filteredFoods.length === 0 ? (
        <div data-ocid="food.empty_state" className="py-16 text-center">
          <div className="text-5xl mb-4">
            {activeCategory !== "Todos"
              ? CATEGORY_EMOJIS[activeCategory]
              : "🛒"}
          </div>
          <p className="font-semibold text-lg">
            {activeCategory !== "Todos"
              ? `No tienes ${activeCategory.toLowerCase()} registrados`
              : "Tu despensa está vacía"}
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {activeCategory !== "Todos"
              ? "Prueba con otra categoría o añade nuevos alimentos."
              : "Empieza añadiendo alimentos para controlar su caducidad."}
          </p>
          {activeCategory === "Todos" && <AddFoodModal />}
        </div>
      ) : (
        <ul
          data-ocid="food.list"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredFoods.map((food, idx) => (
              <FoodCard
                key={food.id.toString()}
                food={food}
                index={idx + 1}
                onConsume={handleConsume}
                onDelete={handleDelete}
                isConsuming={consumingId === food.id}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </main>
  );
}
