"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ContactRound,
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Building2,
  Phone,
  Sparkles,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LEAD_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  NEW: { label: "Nouveau", variant: "gold" },
  CONTACTED: { label: "Contacté", variant: "sky" },
  QUALIFIED: { label: "Qualifié", variant: "green" },
  VISIT_SCHEDULED: { label: "Visite planifiée", variant: "amber" },
  NEGOTIATING: { label: "En négociation", variant: "dark" },
  WON: { label: "Gagné", variant: "green" },
  LOST: { label: "Perdu", variant: "red" },
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

interface LeadRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  source: string;
  score: number;
  createdAt: string;
  owner: { firstName: string; lastName: string } | null;
  property: { id: string; title: string; slug: string } | null;
  agency: { id: string; name: string } | null;
}

export default function AdminLeadsPage() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [summary, setSummary] = useState<{ total: number; byStatus: { status: string; _count: { status: number } }[] } | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      if (search.trim()) params.set("q", search.trim());
      if (status) params.set("status", status);
      if (source) params.set("source", source);
      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur");
      setRows(data.data);
      setSummary(data.summary);
      setPagination(data.pagination);
      setError("");
    } catch (e: any) {
      setError(e.message || "Impossible de charger les prospects");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, search, status, source]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    summary?.byStatus.forEach((s) => map.set(s.status, s._count.status));
    return map;
  }, [summary]);

  const handleStatusChange = async (id: string, value: string) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: value }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur");
      await load();
    } catch (e: any) {
      setError(e.message || "Mise à jour impossible");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        icon={ContactRound}
        title="Prospects"
        subtitle="Tous les prospects de la plateforme, liés à la base de données"
      />

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStatus("")}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
            !status
              ? "border-gold/60 bg-gold/10 text-gold"
              : "border-stone-200 bg-white text-stone-600 hover:border-gold/40"
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          Tous
          <span className="rounded-full bg-stone-100 px-1.5 text-[10px] text-stone-500">{summary?.total || 0}</span>
        </button>
        {Object.keys(LEAD_STATUS).map((key) => {
          const cfg = LEAD_STATUS[key];
          const count = counts.get(key) || 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setStatus(key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                status === key
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-stone-200 bg-white text-stone-600 hover:border-gold/40"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  key === "NEW" && "bg-gold",
                  key === "CONTACTED" && "bg-sky-500",
                  key === "QUALIFIED" && "bg-emerald-500",
                  key === "VISIT_SCHEDULED" && "bg-amber-500",
                  key === "NEGOTIATING" && "bg-stone-700",
                  key === "WON" && "bg-green-600",
                  key === "LOST" && "bg-red-500"
                )}
              />
              {cfg.label}
              <span className="rounded-full bg-stone-100 px-1.5 text-[10px] text-stone-500">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou téléphone..."
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-800 shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <select
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 shadow-sm outline-none transition-all focus:border-gold/60 focus:ring-2 focus:ring-gold/20 sm:w-56"
        >
          <option value="">Toutes les sources</option>
          {Object.entries(LEAD_SOURCE).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={load}
          className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:border-gold/50 hover:text-gold"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Actualiser
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-20 text-stone-400">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="text-xs uppercase tracking-widest">Chargement...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-stone-300 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
            <ContactRound className="h-7 w-7" />
          </span>
          <p className="text-sm font-medium text-stone-500">Aucun prospect trouvé</p>
          <p className="text-xs text-stone-400">Ajustez vos filtres ou revenez plus tard</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                <th className="px-4 py-3 font-semibold">Prospect</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Source</th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell">Annonce</th>
                <th className="hidden px-4 py-3 font-semibold xl:table-cell">Assigné</th>
                <th className="px-4 py-3 text-center font-semibold">Score</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((lead) => (
                <tr key={lead.id} className="group transition-colors hover:bg-gold/[0.03]">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold-light/10 font-display text-sm font-bold text-gold ring-1 ring-gold/20">
                        {lead.name?.[0] || "?"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-stone-800">{lead.name}</p>
                        {lead.phone ? (
                          <p className="flex truncate items-center gap-1 text-xs text-stone-400">
                            <Phone className="h-3 w-3 shrink-0" />
                            {lead.phone}
                          </p>
                        ) : (
                          <p className="truncate text-xs text-stone-400">{lead.email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 md:table-cell">
                    <Badge variant="outline">{LEAD_SOURCE[lead.source] || lead.source}</Badge>
                  </td>
                  <td className="hidden max-w-[220px] px-4 py-3.5 lg:table-cell">
                    <p className="truncate text-stone-600">{lead.property?.title || "—"}</p>
                    {lead.agency?.name && (
                      <p className="flex items-center gap-1 text-xs text-stone-400">
                        <Building2 className="h-3 w-3" />
                        {lead.agency.name}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3.5 text-stone-600 xl:table-cell">
                    {lead.owner
                      ? `${lead.owner.firstName} ${lead.owner.lastName}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      title={`Score ${lead.score}/100`}
                      className={cn(
                        "relative flex h-8 w-8 items-center justify-center rounded-full font-display text-xs font-bold ring-1 ring-inset",
                        lead.score >= 70
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : lead.score >= 40
                          ? "bg-amber-50 text-amber-700 ring-amber-200"
                          : "bg-stone-50 text-stone-500 ring-stone-200"
                      )}
                    >
                      <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e7e5e4" strokeWidth="2.5" />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray={`${(lead.score / 100) * 100} ${100 - (lead.score / 100) * 100}`}
                          className="text-gold"
                        />
                      </svg>
                      <span className="relative">{lead.score}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {busyId === lead.id ? (
                      <Loader2 className="h-5 w-5 animate-spin text-gold" />
                    ) : (
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="cursor-pointer rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-700 outline-none transition-all focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                      >
                        {Object.entries(LEAD_STATUS).map(([k, cfg]) => (
                          <option key={k} value={k}>
                            {cfg.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3.5 text-xs text-stone-400 sm:table-cell">
                    {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-stone-100 px-4 py-3">
              <p className="text-xs text-stone-400">
                {formatNumber(pagination.total)} prospect{pagination.total > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold text-stone-600">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 pb-4 text-xs text-gold">
        <Sparkles className="h-3.5 w-3.5" />
        Le statut et le score sont synchronisés avec le CRM des agents.
      </p>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}