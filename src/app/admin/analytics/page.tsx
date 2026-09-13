"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Home,
  ReceiptText,
  CircleDollarSign,
  UserCheck,
  Building2,
  ChartNoAxesCombined,
  TrendingUp,
  ArrowUpRight,
  Eye,
  Heart,
  MousePointerClick,
  ShieldQuestion,
  UserPlus,
  ContactRound,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatNumber(value: any) {
  return new Intl.NumberFormat("fr-FR").format(Number(value) || 0);
}

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

const LEAD_STATUS: Record<string, { label: string; variant: BadgeVariant; bar: string }> = {
  NEW: { label: "Nouveau", variant: "gold", bar: "from-gold to-gold-light" },
  CONTACTED: { label: "Contacté", variant: "sky", bar: "from-sky-500 to-cyan-400" },
  QUALIFIED: { label: "Qualifié", variant: "green", bar: "from-emerald-500 to-teal-400" },
  VISIT_SCHEDULED: { label: "Visite planifiée", variant: "amber", bar: "from-amber-500 to-orange-400" },
  NEGOTIATING: { label: "En négociation", variant: "dark", bar: "from-stone-700 to-stone-500" },
  WON: { label: "Gagné", variant: "green", bar: "from-green-600 to-emerald-400" },
  LOST: { label: "Perdu", variant: "red", bar: "from-red-500 to-rose-400" },
};

const LEAD_SOURCE: Record<string, string> = {
  WEBSITE: "Site web",
  WHATSAPP: "WhatsApp",
  PHONE: "Téléphone",
  GOOGLE: "Google",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  ORGANIC_SEO: "SEO organique",
  REFERRAL: "Recommandation",
  DIRECT: "Direct",
};

const PROP_STATUS: Record<string, { label: string; color: string }> = {
  PUBLISHED: { label: "Publées", color: "#10b981" },
  PENDING_REVIEW: { label: "En attente", color: "#f59e0b" },
  SOLD: { label: "Vendues", color: "#f43f5e" },
  RENTED: { label: "Louées", color: "#8b5cf6" },
  DRAFT: { label: "Brouillons", color: "#a8a29e" },
  ARCHIVED: { label: "Archivées", color: "#78716c" },
  REJECTED: { label: "Rejetées", color: "#ef4444" },
};

const TRANSACTION: Record<string, string> = {
  SALE: "Vente",
  RENT: "Location",
  SHORT_TERM_RENT: "Loc. courte durée",
  INVESTMENT: "Investissement",
};

const kpis = [
  { title: "Utilisateurs", key: "users", icon: Users, gradient: "from-gold to-gold-light", spark: "text-gold/40" },
  { title: "Annonces", key: "properties", icon: Home, gradient: "from-emerald-500 to-green-600", spark: "text-emerald-400/60" },
  { title: "Commandes", key: "orders", icon: ReceiptText, gradient: "from-sky-500 to-indigo-500", spark: "text-sky-400/60" },
  { title: "Prospects", key: "leads", icon: CircleDollarSign, gradient: "from-teal-500 to-cyan-600", spark: "text-teal-400/60" },
  { title: "Agences", key: "agencies", icon: Building2, gradient: "from-orange-500 to-amber-600", spark: "text-orange-400/60" },
  { title: "Agents", key: "agents", icon: UserCheck, gradient: "from-violet-500 to-purple-600", spark: "text-violet-400/60" },
];

function PanelTitle({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-400">
      <Icon className="h-4 w-4 text-gold" />
      {label}
    </p>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const kpiUsers = useCountUp(data?.counts?.users || 0);
  const kpiProperties = useCountUp(data?.counts?.properties || 0);
  const kpiOrders = useCountUp(data?.counts?.orders || 0);
  const kpiLeads = useCountUp(data?.counts?.leads || 0);
  const kpiAgencies = useCountUp(data?.counts?.agencies || 0);
  const kpiAgents = useCountUp(data?.counts?.agents || 0);
  const kpiRevenue = useCountUp(data?.counts?.revenue || 0);

  const { revenueMax, usersMax } = useMemo(() => {
    const rev = Math.max(1, ...(data?.ordersByMonth || []).map((m: any) => m.revenue || 0));
    const usr = Math.max(1, ...(data?.usersByMonth || []).map((m: any) => m.count || 0));
    return { revenueMax: rev, usersMax: usr };
  }, [data]);

  const leadTotal = useMemo(
    () => (data?.leadsByStatus || []).reduce((s: number, x: any) => s + x._count.status, 0),
    [data]
  );
  const wonTotal = useMemo(
    () => (data?.leadsByStatus || []).filter((x: any) => x.status === "WON").reduce((s: number, x: any) => s + x._count.status, 0),
    [data]
  );
  const winRate = leadTotal > 0 ? Math.round((wonTotal / leadTotal) * 100) : 0;

  const usersLine = useMemo(() => {
    const arr = data?.usersByMonth || [];
    if (!arr.length) return "";
    const min = Math.min(...arr.map((m: any) => m.count));
    const max = Math.max(...arr.map((m: any) => m.count));
    const range = max - min || 1;
    return arr
      .map((m: any, i: number) => {
        const x = (i / (arr.length - 1)) * 100;
        const y = 46 - ((m.count - min) / range) * 38;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data]);

  const lastMonthKey = data?.ordersByMonth?.at(-1)?.key;
  const lastUsers = data?.usersByMonth?.at(-1)?.count || 0;
  const lastRevenue = data?.ordersByMonth?.at(-1)?.revenue || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-28">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ChartNoAxesCombined}
        title="Statistiques"
        subtitle="Analyse en temps réel de la plateforme, alimentée par la base de données"
      />

      {/* KPI band */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi, i) => {
          const raw = data?.counts?.[kpi.key] || 0;
          const count =
            kpi.key === "users"
              ? kpiUsers
              : kpi.key === "properties"
              ? kpiProperties
              : kpi.key === "orders"
              ? kpiOrders
              : kpi.key === "leads"
              ? kpiLeads
              : kpi.key === "agencies"
              ? kpiAgencies
              : kpiAgents;
          return (
            <div
              key={kpi.title}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-fade-up-soft group relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(12,10,9,0.04)]"
            >
              <div
                className={cn(
                  "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-20",
                  kpi.gradient
                )}
                aria-hidden="true"
              />
              <div className="flex items-start justify-between">
                <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", kpi.gradient)}>
                  <kpi.icon className="h-5 w-5" />
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-stone-300">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl">{count}</p>
              <p className="text-xs font-medium text-stone-500 sm:text-sm">{kpi.title}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue hero strip */}
      <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(45deg, rgba(202,138,4,0.05) 1px, transparent 1px)",
            backgroundSize: "80px 80px, 80px 80px, 40px 40px",
          }}
          aria-hidden="true"
        />
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gold/20 blur-[80px]" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Revenus générés
            </p>
            <p className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              <span className="shimmer-gold-text">{formatMAD(kpiRevenue)}</span>
            </p>
            <p className="mt-2 max-w-md text-sm text-white/50">
              Cumul des commandes payées, en traitement, confirmées et terminées.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Vues", value: data?.counts?.views, icon: Eye },
              { label: "Favoris", value: data?.counts?.favorites, icon: Heart },
              { label: "Demandes", value: data?.counts?.inquiries, icon: MousePointerClick },
              { label: "Signalements", value: data?.counts?.pendingReports, icon: ShieldQuestion },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
                <s.icon className="h-4 w-4 text-gold-light" />
                <div>
                  <p className="font-display text-lg font-bold leading-none">{formatNumber(s.value)}</p>
                  <p className="text-[11px] text-white/40">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue + signups trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue bar chart */}
        <div className="card-shine relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(12,10,9,0.04)]">
          <div className="flex items-center justify-between">
            <PanelTitle icon={TrendingUp} label="Revenus par mois" />
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span className="h-2 w-2 rounded-full bg-gold" />
              {lastMonthKey || ""}: <span className="font-semibold text-ink">{formatMAD(lastRevenue)}</span>
            </div>
          </div>
          <div className="mt-6 flex h-44 items-end gap-2">
            {(data?.ordersByMonth || []).map((m: any) => {
              const h = Math.max(4, (m.revenue / revenueMax) * 100);
              return (
                <div key={m.key} className="group/bar flex flex-1 flex-col items-center gap-2">
                  <span className="pointer-events-none rounded-lg bg-ink px-1.5 py-0.5 font-mono text-[10px] text-white opacity-0 transition-opacity group-hover/bar:opacity-100">
                    {formatMAD(m.revenue)}
                  </span>
                  <div
                    title={`${formatMAD(m.revenue)} (${m.count} cmd)`}
                    className="w-full rounded-t-lg bg-gradient-to-t from-gold/70 to-gold-light transition-all duration-300 group-hover/bar:from-gold group-hover/bar:to-gold-light"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] font-medium text-stone-400">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Signups line chart */}
        <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(12,10,9,0.04)]">
          <div className="flex items-center justify-between">
            <PanelTitle icon={UserPlus} label="Nouveaux inscrits" />
            <span className="text-xs text-stone-400">
              <span className="font-semibold text-ink">{formatNumber(lastUsers)}</span> ce mois
            </span>
          </div>
          <div className="mt-6">
            <svg viewBox="0 0 100 46" preserveAspectRatio="none" className="h-40 w-full">
              <defs>
                <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ca8a04" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1="0" x2="100" y1={f * 46} y2={f * 46} stroke="#e7e5e4" strokeWidth="0.2" strokeDasharray="1 1.5" />
              ))}
              <polygon points={`0,46 ${usersLine} 100,46`} fill="url(#usersFill)" />
              <polyline
                points={usersLine}
                fill="none"
                stroke="#ca8a04"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {(data?.usersByMonth || []).map((m: any, i: number) => {
                const x = (i / Math.max(1, (data?.usersByMonth || []).length - 1)) * 100;
                const c = usersLine.split(" ")[i]?.split(",") || ["0", "46"];
                return <circle key={m.key} cx={c[0]} cy={c[1]} r="1.1" fill="#eab308" stroke="#fff" strokeWidth="0.3" />;
              })}
            </svg>
            <div className="mt-2 flex justify-between">
              {(data?.usersByMonth || []).map((m: any) => (
                <span key={m.key} className="text-[10px] font-medium text-stone-400">
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Funnel + sources */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(12,10,9,0.04)] xl:col-span-2">
          <div className="flex items-center justify-between">
            <PanelTitle icon={ContactRound} label="Entonnoir des prospects" />
            <div className="flex items-center gap-3 text-xs">
              <span className="text-stone-400">
                {formatNumber(leadTotal)} prospects
              </span>
              <Badge variant="green">{winRate}% gagnés</Badge>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {(data?.leadsByStatus || []).map((row: any, i: number) => {
              const cfg = LEAD_STATUS[row.status] || { label: row.status, variant: "stone" as BadgeVariant, bar: "from-stone-400 to-stone-300" };
              const pct = leadTotal > 0 ? Math.round((row._count.status / leadTotal) * 100) : 0;
              return (
                <div key={row.status} className="flex items-center gap-3" style={{ animationDelay: `${i * 40}ms` }}>
                  <Badge variant={cfg.variant} className="w-32 shrink-0 justify-center">
                    {cfg.label}
                  </Badge>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", cfg.bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-display text-sm font-bold text-ink">{row._count.status}</span>
                  <span className="w-12 text-right text-xs font-medium text-stone-400">{pct}%</span>
                </div>
              );
            })}
            {!leadTotal && (
              <p className="py-8 text-center text-sm text-stone-400">Aucun prospect pour le moment</p>
            )}
          </div>
        </div>

        {/* Sources */}
        <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(12,10,9,0.04)]">
          <PanelTitle icon={ArrowUpRight} label="Sources d&apos;acquisition" />
          <div className="mt-5 space-y-3">
            {(data?.leadsBySource || []).slice(0, 6).map((row: any, i: number) => {
              const max = Math.max(1, ...(data?.leadsBySource || []).map((s: any) => s._count.source));
              const pct = Math.round((row._count.source / max) * 100);
              return (
                <div key={row.source} className="flex items-center gap-3" style={{ animationDelay: `${i * 40}ms` }}>
                  <span className="w-32 shrink-0 truncate text-xs font-medium text-stone-600">
                    {LEAD_SOURCE[row.source] || row.source}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-bold text-ink">{row._count.source}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Distributions */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Property status */}
        <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(12,10,9,0.04)]">
          <PanelTitle icon={Home} label="Statut des annonces" />
          <div className="mt-5 space-y-3">
            {(data?.propertyStatus || []).map((row: any) => {
              const cfg = PROP_STATUS[row.status] || { label: row.status, color: "#a8a29e" };
              const total = data?.counts?.properties || 0;
              const pct = total > 0 ? Math.round((row._count.status / total) * 100) : 0;
              return (
                <div key={row.status} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: cfg.color }} />
                  <span className="flex-1 text-xs font-medium text-stone-600">{cfg.label}</span>
                  <span className="text-xs font-semibold text-stone-400">{row._count.status}</span>
                  <span className="w-9 text-right text-xs font-bold text-ink">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction split */}
        <div className="card-shine relative overflow-hidden rounded-3xl bg-ink p-6 text-white">
          <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px, 60px 60px" }} aria-hidden="true" />
          <div className="relative">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/40">
              <ArrowUpRight className="h-4 w-4 text-gold-light" />
              Type de transaction
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {(data?.transactionSplit || []).map((t: any) => (
                <div key={t.transactionType} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-display text-2xl font-bold text-gold-light">{t._count.transactionType}</p>
                  <p className="text-xs text-white/50">{TRANSACTION[t.transactionType] || t.transactionType}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top cities */}
        <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(12,10,9,0.04)]">
          <PanelTitle icon={Building2} label="Annonces par ville" />
          <div className="mt-5 space-y-3">
            {(data?.topCities || []).map((c: any, i: number) => {
              const max = Math.max(1, ...(data?.topCities || []).map((x: any) => x.count));
              const pct = Math.round((c.count / max) * 100);
              return (
                <div key={c.cityId} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-xs font-semibold text-stone-700">{c.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold-light" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-bold text-ink">{c.count}</span>
                </div>
              );
            })}
            {!data?.topCities?.length && <p className="py-6 text-center text-sm text-stone-400">Aucune annonce</p>}
          </div>
        </div>
      </div>

      {/* Recents */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(12,10,9,0.04)]">
          <PanelTitle icon={ContactRound} label="Derniers prospects" />
          <div className="mt-4 space-y-2">
            {(data?.recentLeads || []).map((l: any, i: number) => (
              <div key={l.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-up-soft flex items-center gap-3 rounded-2xl border border-stone-100 p-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold/15 to-gold-light/5 font-display text-sm font-bold text-gold ring-1 ring-gold/20">
                  {l.name?.[0] || "?"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-800">{l.name}</p>
                  <p className="truncate text-xs text-stone-400">{l.property?.title || l.phone || l.email || "—"}</p>
                </div>
                <Badge variant={LEAD_STATUS[l.status]?.variant || "stone"}>
                  {LEAD_STATUS[l.status]?.label || l.status}
                </Badge>
                <span className="hidden text-xs text-stone-400 sm:block">
                  {new Date(l.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            ))}
            {!data?.recentLeads?.length && (
              <p className="py-8 text-center text-sm text-stone-400">Aucun prospect récent</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(12,10,9,0.04)]">
          <PanelTitle icon={Users} label="Nouveaux membres" />
          <div className="mt-4 space-y-2">
            {(data?.recentSignups || []).map((u: any, i: number) => (
              <div key={u.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-up-soft flex items-center gap-3 rounded-2xl border border-stone-100 p-3.5">
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
                <Badge variant="outline" className="capitalize">
                  {u.role.replace(/_/g, " ").toLowerCase()}
                </Badge>
                <span className="hidden text-xs text-stone-400 sm:block">
                  {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            ))}
            {!data?.recentSignups?.length && (
              <p className="py-8 text-center text-sm text-stone-400">Aucun utilisateur récent</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}