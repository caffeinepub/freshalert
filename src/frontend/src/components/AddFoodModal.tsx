import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddFood } from "../hooks/useQueries";

const CATEGORIES = [
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

interface AddFoodModalProps {
  trigger?: React.ReactNode;
}

export function AddFoodModal({ trigger }: AddFoodModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const addFood = useAddFood();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !quantity || !unit || !expiryDate) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      await addFood.mutateAsync({
        name: name.trim(),
        category,
        quantity: Number.parseFloat(quantity),
        unit: unit.trim(),
        expiryDate: new Date(expiryDate),
      });
      toast.success(`¡${name} añadido correctamente!`);
      setOpen(false);
      setName("");
      setCategory("");
      setQuantity("");
      setUnit("");
      setExpiryDate("");
    } catch {
      toast.error("Error al añadir el alimento. Inténtalo de nuevo.");
    }
  };

  const defaultTrigger = (
    <Button data-ocid="food.add_button" className="gap-2">
      <Plus className="h-4 w-4" />
      Añadir alimento
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent data-ocid="food.form.dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Añadir alimento
          </DialogTitle>
          <DialogDescription>
            Registra un alimento con su fecha de caducidad para recibir alertas
            a tiempo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="food-name">Nombre</Label>
            <Input
              id="food-name"
              data-ocid="food.form.name.input"
              placeholder="Ej: Leche entera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="food-category">Categoría</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger
                id="food-category"
                data-ocid="food.form.category.select"
              >
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="food-quantity">Cantidad</Label>
              <Input
                id="food-quantity"
                data-ocid="food.form.quantity.input"
                type="number"
                min="0"
                step="0.1"
                placeholder="Ej: 1.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="food-unit">Unidad</Label>
              <Input
                id="food-unit"
                data-ocid="food.form.unit.input"
                placeholder="kg, litros, uds."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="food-expiry">Fecha de caducidad</Label>
            <Input
              id="food-expiry"
              data-ocid="food.form.expiry.input"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="food.form.cancel_button"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              data-ocid="food.form.submit_button"
              disabled={addFood.isPending}
              className="gap-2"
            >
              {addFood.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {addFood.isPending ? "Añadiendo..." : "Añadir alimento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
