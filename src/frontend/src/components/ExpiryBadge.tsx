import { cn } from "@/lib/utils";
import type { Food } from "../backend.d";
import { getExpiryLabel, getExpiryStatus } from "../hooks/useQueries";

interface ExpiryBadgeProps {
  food: Food;
  className?: string;
}

export function ExpiryBadge({ food, className }: ExpiryBadgeProps) {
  const status = getExpiryStatus(food);
  const label = getExpiryLabel(food);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border",
        status === "expired" && "expiry-expired",
        status === "urgent" && "expiry-urgent",
        status === "warning" && "expiry-warning",
        status === "safe" && "expiry-safe",
        className,
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "expired" && "bg-[oklch(var(--expiry-expired))]",
          status === "urgent" && "bg-[oklch(var(--expiry-urgent))]",
          status === "warning" && "bg-[oklch(var(--expiry-warning))]",
          status === "safe" && "bg-[oklch(var(--expiry-safe))]",
        )}
      />
      {label}
    </span>
  );
}
