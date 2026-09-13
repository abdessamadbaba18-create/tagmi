"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Home,
  Flag,
  LogOut,
  Loader2,
  ShieldCheck,
  ReceiptText,
  Menu,
  X,
  Bell,
  CalendarDays,
  Zap,
  MapPin,
  Globe2,
  Share2,
  ChartNoAxesCombined,
  ContactRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Statistiques", icon: ChartNoAxesCombined },
  { href: "/admin/leads", label: "Prospects", icon: ContactRound },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/properties", label: "Propriétés", icon: Home },
  { href: "/admin/orders", label: "Commandes", icon: ReceiptText },
  { href: "/admin/reports", label: "Signalements", icon: Flag },
  { href: "/admin/cities", label: "Villes", icon: MapPin },
  { href: "/admin/neighborhoods", label: "Quartiers", icon: Globe2 },
  { href: "/admin/settings", label: "Réseaux", icon: Share2 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "short",
      }).format(new Date()),
    []
  );

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.success) {
        router.push("/login");
        return;
      }
      if (data.user.role !== "ADMIN" && data.user.role !== "SUPER_ADMIN") {
        router.push("/");
        return;
      }
      setUser(data.user);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="animate-pulse text-xs uppercase tracking-widest text-stone-400">
            Sécurisation de la session...
          </p>
        </div>
      </div>
    );
  }

  const activeSection = pathname.split("/")[1] || "admin";

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ---------- Sidebar ---------- */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-ink text-white transition-transform duration-300 ease-out md:static md:z-auto md:w-64 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(45deg, rgba(202,138,4,0.04) 1px, transparent 1px)",
            backgroundSize: "80px 80px, 80px 80px, 40px 40px",
          }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/15 blur-[70px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-gold-light/10 blur-[60px]" aria-hidden="true" />

        {/* Brand */}
        <div className="relative flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img src="/TAGMI.png" alt="TAGMI" className="h-6 w-auto object-contain" />
          </Link>
          <span className="ml-auto flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[11px] font-semibold text-gold-light">
            <ShieldCheck className="h-3 w-3" />
            Console
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
            Navigation
          </p>
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-gold/25 to-gold/5 text-gold-light"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-gold to-gold-light" />
                  )}
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                      isActive && "text-gold-light"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-gold-light" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gold-light">
              <Zap className="h-3.5 w-3.5" />
              Mode administrateur actif
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/40">
              Toutes les actions sont journalisées via l&apos;audit de sécurité.
            </p>
          </div>
        </nav>

        {/* User footer */}
        <div className="relative border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold/30 to-gold-light/10 font-display text-sm font-bold text-gold-light ring-1 ring-gold/30">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-white/40">{user?.role}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-white/60 hover:bg-white/5 hover:text-white"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Mon espace
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-white/60 hover:bg-white/5 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sortir
            </Button>
          </div>
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-stone-200/70 bg-white/85 px-4 backdrop-blur-lg sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition-colors hover:border-gold/40 hover:text-gold md:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="hidden items-center gap-1.5 text-sm text-stone-400 md:flex">
            <span className="font-medium text-stone-700">Admin</span>
            <span className="text-stone-300">/</span>
            <span className="capitalize text-stone-500">{activeSection}</span>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-500 sm:flex">
              <CalendarDays className="h-3.5 w-3.5 text-gold" />
              {today}
            </span>
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition-colors hover:border-gold/40 hover:text-gold"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />
            </button>
            <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold/30 to-gold-light/10 font-display text-xs font-bold text-gold ring-1 ring-gold/30 sm:flex">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}