"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  Home,
  UserCheck,
  Flag,
  CircleDollarSign,
  ArrowRight,
  ReceiptText,
  TrendingUp,
  ShoppingCart,
  RefreshCw,
  PackageCheck,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  Building2,
  ArrowUpRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatMAD(value: any) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

const orderConfig: Record<string, { label: string; variant: BadgeVariant; bar: string }> = {
  PENDING: { label: "En attente", variant: "amber", bar: "bg-amber-500" },
  PAID: { label: "Payée", variant: "green", bar: "bg-emerald-500" },
  PROCESSING: { label: "En traitement", variant: "sky", bar: "bg-sky-500" },
  CONFIRMED: { label: "Confirmée", variant: "gold", bar: "bg-gold" },
  COMPLETED: { label: "Terminée", variant: "green", bar: "bg-green-600" },
  CANCELLED: { label: "Annulée", variant: "red", bar: "bg-red-500" },
  REFUNDED: { label: "Remboursée", variant: "stone", bar: "bg-stone-400" },
};

const orderOrder = ["PENDING", "PAID", "PROCESSING", "CONFIRMED", "COMPLETED", "CANCELLED", "REFUNDED"];

const propConfig: Record<string, { label: string; color: string; badge: string }> = {
  PUBLISHED: { label: "Publiées", color: "#10b981", badge: "bg-emerald-100 text-emerald-700" },
  PENDING_REVIEW: { label: "En attente", color: "#f59e0b", badge: "bg-amber-100 text-amber-700" },
  SOLD: { label: "Vendues", color: "#f43f5e", badge: "bg-rose-100 text-rose-700" },
  DRAFT: { label: "Brouillons", color: "#a8a29e", badge: "bg-stone-200 text-stone-600" },
};

const statCards = [
  {
    title: "Utilisateurs",
    key: "users",
    href: "/admin/users",
    icon: Users,
    gradient: "from-gold to-gold-light",
    shadow: "group-hover:shadow-gold/25",
    spark: "text-gold/40",
  },
  {
    title: "Propriétés",
    key: "properties",
    href: "/admin/properties",
    icon: Home,
    gradient: "from-emerald-500 to-green-600",
    shadow: "group-hover:shadow-emerald-500/25",
    spark: "text-emerald-400/60",
  },
  {
    title: "Commandes",
    key: "orders",
    href: "/admin/orders",
    icon: ReceiptText,
    gradient: "from-sky-500 to-indigo-500",
    shadow: "group-hover:shadow-sky-500/25",
    spark: "text-sky-400/60",
  },
  {
    title: "Agents",
    key: "agents",
    href: "/admin/users",
    icon: UserCheck,
    gradient: "from-orange-500 to-amber-600",
    shadow: "group-hover:shadow-orange-500/25",
    spark: "text-orange-400/60",
  },
  {
    title: "Prospects",
    key: "leads",
    href: "/admin/leads",
    icon: CircleDollarSign,
    gradient: "from-teal-500 to-cyan-600",
    shadow: "group-hover:shadow-teal-500/25",
    spark: "text-teal-400/60",
  },
  {
    title: "Signalements",
    key: "pendingReports",
    href: "/admin/reports",
    icon: Flag,
    gradient: "from-rose-500 to-red-600",
    shadow: "group-hover:shadow-rose-500/25",
    spark: "text-rose-400/60",
  },
];

function Sparkline({ value }: { value: number }) {
  const points = useMemo(() => {
    const n = 20;
    const seed = (Math.max(1, value) % 997) + 3;
    const arr: number[] = [];
    let v = (seed % 16) + 6;
    for (let i = 0; i < n; i++) {
      v = Math.max(3, Math.min(28, v + ((seed * (i + 3)) % 7) - 3));
      arr.push(v);
    }
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min || 1;
    return arr
      .map((y, i) => `${((i / (n - 1)) * 100).toFixed(1)},${(32 - ((y - min) / range) * 26).toFixed(1)}`)
      .join(" ");
  }, [value]);

  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-9 w-full">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    []
  );

  const orderCounts: Record<string, number> = {};
  stats?.orderStatus?.forEach((s: any) => {
    orderCounts[s.status] = s._count.status;
  });
  const totalOrders = orderOrder.reduce((acc, s) => acc + (orderCounts[s] || 0), 0);

  const propCounts: Record<string, number> = {};
  stats?.propertyStatus?.forEach((s: any) => {
    propCounts[s.status] = s._count.status;
  });
  const totalProps = stats?.counts?.properties || 0;

  const donutStyle = useMemo(() => {
    const segments = Object.keys(propConfig)
      .filter((k) => propCounts[k] && totalProps > 0)
      .map((k) => ({ value: propCounts[k], color: propConfig[k].color }));
    if (!segments.length) return { background: "conic-gradient(#e7e5e4 0 360deg)" };
    let acc = 0;
    const stops = segments.map((s) => {
      const from = (acc / totalProps) * 360;
      acc += s.value;
      const to = (acc / totalProps) * 360;
      return `${s.color} ${from}deg ${to}deg`;
    });
    return { background: `conic-gradient(from -90deg, ${stops.join(", ")})` };
  }, [propCounts, totalProps]);

  const heroTotalOrders = useCountUp(totalOrders);
  const heroTotalUsers = useCountUp(stats?.counts?.users || 0);
  const heroTotalProps = useCountUp(stats?.counts?.properties || 0);
  const kpiUsers = useCountUp(stats?.counts?.users || 0);
  const kpiProperties = useCountUp(stats?.counts?.properties || 0);
  const kpiOrders = useCountUp(stats?.counts?.orders || 0);
  const kpiAgents = useCountUp(stats?.counts?.agents || 0);
  const kpiLeads = useCountUp(stats?.counts?.leads || 0);
  const kpiReports = useCountUp(stats?.counts?.pendingReports || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-28">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---------- Page header ---------- */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Console d&apos;administration
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
            Tableau de bord
          </h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-stone-500">
            <CalendarDays className="h-3.5 w-3.5" />
            {today}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:border-gold/50 hover:text-gold"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* ---------- Hero ---------- */}
      <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white sm:p-8">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(45deg, rgba(202,138,4,0.05) 1px, transparent 1px)",
            backgroundSize: "80px 80px, 80px 80px, 40px 40px",
          }}
          aria-hidden="true"
        />
        <div className="absolute -right-16 -top-16 h-52 w-52 animate-orb-drift rounded-full bg-gold/20 blur-[90px]" aria-hidden="true" />
        <div className="absolute -bottom-24 right-1/3 h-48 w-48 animate-orb-drift-slow rounded-full bg-gold-light/10 blur-[80px]" aria-hidden="true" />

        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Vue d&apos;ensemble de la plateforme
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Revenus <span className="shimmer-gold-text">globaux</span>
            </h2>
            <p className="mt-4 font-display text-4xl font-bold text-gold-light sm:text-5xl">
              {formatMAD(stats?.counts?.revenue)}
            </p>
            <p className="mt-2 max-w-md text-sm text-white/50">
              Cumul des commandes payées, en traitement, confirmées et terminées sur la plateforme.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
                <ShoppingCart className="h-4 w-4 text-gold-light" />
                <div>
                  <p className="font-display text-lg font-bold leading-none">{heroTotalOrders}</p>
                  <p className="text-[11px] text-white/40">Commandes</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
                <Users className="h-4 w-4 text-gold-light" />
                <div>
                  <p className="font-display text-lg font-bold leading-none">{heroTotalUsers}</p>
                  <p className="text-[11px] text-white/40">Utilisateurs</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
                <Building2 className="h-4 w-4 text-gold-light" />
                <div>
                  <p className="font-display text-lg font-bold leading-none">{heroTotalProps}</p>
                  <p className="text-[11px] text-white/40">Annonces</p>
                </div>
              </div>
            </div>
          </div>

          {/* hero side card */}
          <div className="card-shine rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/40">
              <TrendingUp className="h-4 w-4 text-gold-light" />
              Statut des commandes
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {orderOrder.map((status) => {
                const cfg = orderConfig[status];
                const count = orderCounts[status] || 0;
                return (
                  <div key={status} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-display text-lg font-bold">{count}</p>
                    <p className="text-[11px] text-white/40">{cfg?.label || status}</p>
                  </div>
                );
              })}
            </div>
            <Link
              href="/admin/orders"
              className="group mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold to-gold-light px-4 py-3 text-sm font-semibold text-ink transition-all hover:brightness-110"
            >
              Voir les commandes
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* ---------- KPI cards ---------- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => {
          const raw = stats?.counts?.[stat.key] || 0;
          const count =
            stat.key === "users"
              ? kpiUsers
              : stat.key === "properties"
              ? kpiProperties
              : stat.key === "orders"
              ? kpiOrders
              : stat.key === "agents"
              ? kpiAgents
              : stat.key === "leads"
              ? kpiLeads
              : kpiReports;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className={cn(
                "group relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(12,10,9,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(12,10,9,0.3)]",
                stat.shadow
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25",
                  stat.gradient
                )}
                aria-hidden="true"
              />
              <div className="flex items-start justify-between">
                <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", stat.gradient)}>
                  <stat.icon className="h-5 w-5" />
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-200 text-stone-300 opacity-0 transition-all duration-300 group-hover:border-gold/40 group-hover:text-gold group-hover:opacity-100">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl">
                {count}
              </p>
              <p className="text-xs font-medium text-stone-500 sm:text-sm">{stat.title}</p>
              <div className={cn("mt-3", stat.spark)}>
                <Sparkline value={raw} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ---------- Revenue panel + distributions ---------- */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent orders */}
        <div className="card-shine relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(12,10,9,0.04)] xl:col-span-2">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/10 blur-[60px]" aria-hidden="true" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-400">
                <ReceiptText className="h-4 w-4 text-gold" />
                Dernières commandes
              </p>
              <h3 className="mt-1 font-display text-xl font-bold text-ink">Activité récente</h3>
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-semibold text-stone-600 transition-colors hover:border-gold/50 hover:text-gold"
            >
              Tout voir
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {stats?.recentOrders?.length > 0 ? (
            <div className="relative mt-4 space-y-2.5">
              {stats.recentOrders.map((order: any, i: number) => (
                <Link
                  key={order.id}
                  href="/admin/orders"
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="animate-fade-up-soft group flex items-center gap-4 rounded-2xl border border-stone-100 bg-white p-4 transition-all duration-200 hover:border-gold/40 hover:bg-gold/[0.03]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold/15 to-gold-light/5 ring-1 ring-gold/20">
                    <PackageCheck className="h-5 w-5 text-gold" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold tracking-wide text-gold">
                      {order.orderNumber}
                    </p>
                    <p className="truncate text-sm font-medium text-stone-800">
                      {order.property?.title || "Propriété"}
                    </p>
                    <p className="text-xs text-stone-400">{order.property?.city?.name || ""}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-display text-sm font-bold text-ink">
                      {formatMAD(order.amount)}
                    </span>
                    <Badge variant={orderConfig[order.status]?.variant || "stone"}>
                      {orderConfig[order.status]?.label || order.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState label="Aucune commande pour le moment" />
          )}
        </div>

        {/* Property distribution */}
        <div className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(12,10,9,0.04)]">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-400">
              <Home className="h-4 w-4 text-emerald-500" />
              Répartition des annonces
            </p>
            <div className="mt-5 flex items-center justify-center">
              <div className="relative h-36 w-36">
                <div className="absolute inset-0 rounded-full" style={donutStyle} />
                <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white">
                  <span className="font-display text-3xl font-bold text-ink">{totalProps}</span>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400">annonces</span>
                </div>
              </div>
            </div>
            <div className="mt-5 space-y-2.5">
              {Object.keys(propConfig).map((status) => {
                const cfg = propConfig[status];
                const count = propCounts[status] || 0;
                const pct = totalProps > 0 ? Math.round((count / totalProps) * 100) : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: cfg.color }} />
                    <span className="flex-1 text-xs font-medium text-stone-600">{cfg.label}</span>
                    <span className="text-xs font-semibold text-stone-400">{count}</span>
                    <span className="w-8 text-right text-xs font-bold text-ink">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment card */}
          <div className="card-shine relative overflow-hidden rounded-3xl bg-ink p-6 text-white">
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "60px 60px, 60px 60px",
              }}
              aria-hidden="true"
            />
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/25 blur-[60px]" aria-hidden="true" />
            <div className="relative">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/40">
                <ShoppingCart className="h-4 w-4 text-gold-light" />
                Paiement en ligne
              </p>
              <p className="mt-3 font-display text-lg font-bold text-white">Carte bancaire</p>
              <p className="text-sm text-white/50">Passerelle active sur l&apos;ensemble du parcours d&apos;achat.</p>
              <Link
                href="/checkout"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-light hover:underline"
              >
                Tester le paiement <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Recent properties / users ---------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(12,10,9,0.04)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-400">
              <Home className="h-4 w-4 text-gold" />
              Dernières propriétés
            </div>
            <Link href="/admin/properties" className="flex items-center gap-1 text-xs font-semibold text-gold hover:underline">
              Tout voir <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {stats?.recentProperties?.length ? (
              stats.recentProperties.map((p: any, i: number) => (
                <Link
                  key={p.id}
                  href={`/property/${p.slug}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className="animate-fade-up-soft flex items-center gap-3 rounded-2xl border border-stone-100 p-3.5 transition-all hover:border-gold/40 hover:bg-gold/[0.03]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold/15 to-gold-light/5 ring-1 ring-gold/20">
                    <Home className="h-4 w-4 text-gold" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-800">{p.title}</p>
                    <p className="text-xs text-stone-400">
                      {p.owner?.firstName} {p.owner?.lastName}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-stone-400">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </Link>
              ))
            ) : (
              <EmptyState label="Aucune propriété récente" />
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(12,10,9,0.04)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-400">
              <Users className="h-4 w-4 text-gold" />
              Utilisateurs récents
            </div>
            <Link href="/admin/users" className="flex items-center gap-1 text-xs font-semibold text-gold hover:underline">
              Tout voir <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {stats?.recentUsers?.length ? (
              stats.recentUsers.map((u: any, i: number) => (
                <div
                  key={u.id}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className="animate-fade-up-soft flex items-center gap-3 rounded-2xl border border-stone-100 p-3.5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold/15 to-gold-light/5 font-display text-sm font-bold text-gold ring-1 ring-gold/20">
                    {u.firstName?.[0] || "?"}
                    {u.lastName?.[0] || ""}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-800">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="truncate text-xs text-stone-400">{u.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className="capitalize">{u.role.replace(/_/g, " ").toLowerCase()}</Badge>
                    <span className="hidden text-xs text-stone-400 sm:block">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState label="Aucun utilisateur récent" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-300">
        <CheckCircle2 className="h-6 w-6" />
      </span>
      <p className="text-sm text-stone-400">{label}</p>
      <p className="flex items-center gap-1 text-xs text-stone-300">
        <Sparkles className="h-3 w-3" /> La plateforme est en bonne santé
      </p>
    </div>
  );
}