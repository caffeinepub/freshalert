import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChefHat, Leaf, ListChecks, X } from "lucide-react";
import { useState } from "react";
import type { Recipe } from "../backend.d";

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
}

export function RecipeDetailModal({
  recipe,
  open,
  onClose,
}: RecipeDetailModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="recipe.detail.dialog"
        className="sm:max-w-lg max-h-[90vh] flex flex-col"
      >
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="font-display text-xl leading-tight mb-2">
                {recipe.name}
              </DialogTitle>
              <div className="flex flex-wrap gap-1.5">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {recipe.description}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-2">
            {/* Ingredients */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <Leaf className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-base">
                  Ingredientes ({recipe.ingredients.length})
                </h3>
              </div>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient) => (
                  <li
                    key={ingredient}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-accent/20 flex items-center justify-center">
                  <ListChecks className="h-4 w-4 text-accent-foreground" />
                </div>
                <h3 className="font-display font-semibold text-base">
                  Preparación
                </h3>
              </div>
              <ol className="space-y-3">
                {recipe.steps.map((step, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: steps are ordered by position
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="mt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </ScrollArea>

        <div className="pt-4 flex justify-end">
          <Button
            variant="outline"
            data-ocid="recipe.detail.close_button"
            onClick={onClose}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
