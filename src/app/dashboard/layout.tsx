"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Home, Users, MessageCircle,
  BarChart3, Settings, LogOut, Loader2, Bell, HandCoins, Search, Contact
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar: string | null;
}

const sidebarItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/crm", label: "CRM", icon: Contact },
  { href: "/dashboard/properties", label: "Mes biens", icon: Home },
  { href: "/dashboard/leads", label: "Prospects", icon: Users },
  { href: "/dashboard/offers", label: "Offres", icon: HandCoins },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/saved-searches", label: "Recherches sauvegardées", icon: Search },
  { href: "/dashboard/analytics", label: "Statistiques", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.success) {
        router.push("/login");
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="relative hidden w-64 overflow-hidden bg-ink text-white md:block">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(45deg, rgba(202,138,4,0.04) 1px, transparent 1px)",
            backgroundSize: "80px 80px, 80px 80px, 40px 40px",
          }}
          aria-hidden="true"
        />
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/15 blur-[70px]" aria-hidden="true" />
        <div className="hero-orb-slower absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gold/10 blur-[70px]" aria-hidden="true" />
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent"
          aria-hidden="true"
        />

        <div className="relative flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img src="/TAGMI.png" alt="TAGMI" className="h-5 w-auto object-contain" />
          </Link>
          <span className="ml-2 text-xs text-white/40">Dashboard</span>
        </div>

        <nav className="relative p-4">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "border border-white/5 bg-gradient-to-r from-gold/25 to-gold/5 text-gold-light shadow-md shadow-gold/10"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-gold-light")} />
                {item.label}
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold-light" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="brand-orbit flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold/30 to-gold-light/10 ring-1 ring-gold/30">
              <span className="font-display text-sm font-bold text-gold-light">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-white/40">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white/60 hover:bg-white/5 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}