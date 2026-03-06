import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  Bell,
  ChefHat,
  LayoutDashboard,
  Leaf,
  ShoppingBasket,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getDaysUntilExpiry, useListFoods } from "./hooks/useQueries";
import Alimentos from "./pages/Alimentos";
import Dashboard from "./pages/Dashboard";
import Recetas from "./pages/Recetas";

type Page = "dashboard" | "alimentos" | "recetas";

function NavBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[oklch(var(--expiry-urgent))] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const { data: foods = [] } = useListFoods();

  const urgentCount = foods.filter((f) => {
    const days = getDaysUntilExpiry(f);
    return days >= 0 && days <= 3;
  }).length;

  // Update page title
  useEffect(() => {
    const titles: Record<Page, string> = {
      dashboard: "FreshAlert — Inicio",
      alimentos: "FreshAlert — Mis Alimentos",
      recetas: "FreshAlert — Recetas",
    };
    document.title = titles[currentPage];
  }, [currentPage]);

  const navItems = [
    {
      id: "dashboard" as Page,
      label: "Inicio",
      icon: LayoutDashboard,
      ocid: "nav.dashboard.link",
    },
    {
      id: "alimentos" as Page,
      label: "Mis Alimentos",
      icon: ShoppingBasket,
      ocid: "nav.alimentos.link",
      badge: urgentCount,
    },
    {
      id: "recetas" as Page,
      label: "Recetas",
      icon: ChefHat,
      ocid: "nav.recetas.link",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container max-w-5xl flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <button
            type="button"
            onClick={() => setCurrentPage("dashboard")}
            className="flex items-center gap-2.5 group"
            aria-label="FreshAlert — Ir al inicio"
          >
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Fresh<span className="text-primary">Alert</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav
            className="hidden sm:flex items-center gap-1"
            aria-label="Navegación principal"
          >
            {navItems.map((nav) => {
              const Icon = nav.icon;
              const isActive = currentPage === nav.id;
              return (
                <button
                  type="button"
                  key={nav.id}
                  data-ocid={nav.ocid}
                  onClick={() => setCurrentPage(nav.id)}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="relative">
                    <Icon className="h-4 w-4" />
                    {nav.badge !== undefined && <NavBadge count={nav.badge} />}
                  </div>
                  {nav.label}
                </button>
              );
            })}
          </nav>

          {/* Urgent alert bell (mobile) */}
          {urgentCount > 0 && (
            <div className="sm:hidden flex items-center gap-1.5 px-2 py-1 rounded-full bg-[oklch(var(--expiry-urgent)/0.15)] border border-[oklch(var(--expiry-urgent)/0.3)]">
              <Bell className="h-3.5 w-3.5 text-[oklch(var(--expiry-urgent))]" />
              <span className="text-xs font-semibold text-[oklch(var(--expiry-urgent))]">
                {urgentCount}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1">
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "alimentos" && <Alimentos />}
        {currentPage === "recetas" && <Recetas />}
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/90 backdrop-blur-md"
        aria-label="Navegación móvil"
      >
        <div className="flex items-stretch h-16">
          {navItems.map((nav) => {
            const Icon = nav.icon;
            const isActive = currentPage === nav.id;
            return (
              <button
                type="button"
                key={nav.id}
                data-ocid={nav.ocid}
                onClick={() => setCurrentPage(nav.id)}
                className={cn(
                  "relative flex-1 flex flex-col items-center justify-center gap-0.5 pt-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {nav.badge !== undefined && <NavBadge count={nav.badge} />}
                </div>
                <span className="text-[10px] font-medium">{nav.label}</span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <footer className="hidden sm:block border-t border-border bg-card/40 py-4 mb-0">
        <div className="container max-w-5xl">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}. Hecho con{" "}
            <span role="img" aria-label="amor">
              ❤️
            </span>{" "}
            usando{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Mobile bottom nav spacer */}
      <div className="sm:hidden h-16" />

      <Toaster position="top-right" richColors />
    </div>
  );
}
