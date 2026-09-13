"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Contact,
  Users,
  CalendarClock,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  GripVertical,
  Plus,
  ArrowRight,
  MessageCircle,
  PenLine,
  HandCoins,
  Sparkles,
  Check,
  X,
  Send,
  BadgeEuro,
  Building2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatPrice } from "@/lib/utils";

/* ───────────────────────── types ───────────────────────── */

interface Interaction {
  id: string;
  type: string;
  content: string | null;
  direction: string;
  createdAt: string;
}

interface OfferItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface VisitItem {
  id: string;
  scheduledAt: string;
  status: string;
}

interface LeadCard {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  source: string;
  score: number;
  budget: number | null;
  notes: string | null;
  lastContact: string | null;
  createdAt: string;
  updatedAt: string;
  interactions: Interaction[];
  offers: OfferItem[];
  visits: VisitItem[];
  property: {
    id: string;
    title: string;
    slug: string;
    price: number;
    currency: string;
    city: { name: string } | null;
    images: { url: string }[];
  } | null;
}

interface CrmSummary {
  total: number;
  active: number;
  won: number;
  lost: number;
  closed: number;
  conversionRate: number;
  pipelineValue: number;
}

interface CrmData {
  summary: CrmSummary;
  upcomingVisits: number;
  leads: LeadCard[];
}

/* ───────────────────────── helpers ───────────────────────── */

const STAGES = [
  { key: "NEW", label: "Nouveaux", chip: "bg-gold/10 text-gold ring-gold/30", dot: "bg-gold" },
  { key: "CONTACTED", label: "Contactés", chip: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
  { key: "QUALIFIED", label: "Qualifiés", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  { key: "VISIT_SCHEDULED", label: "RDV planifiés", chip: "bg-indigo-50 text-indigo-700 ring-indigo-200", dot: "bg-indigo-500" },
  { key: "NEGOTIATING", label: "Négociations", chip: "bg-orange-50 text-orange-700 ring-orange-200", dot: "bg-orange-500" },
  { key: "WON", label: "Gagnés", chip: "bg-green-50 text-green-700 ring-green-200", dot: "bg-green-500" },
  { key: "LOST", label: "Perdus", chip: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-400" },
];

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Site web",
  WHATSAPP: "WhatsApp",
  PHONE: "Téléphone",
  GOOGLE: "Google",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  ORGANIC_SEO: "SEO",
  REFERRAL: "Recommandation",
  DIRECT: "Direct",
};

const INTERACTION_META: Record<string, { label: string; icon: any; cls: string }> = {
  email: { label: "E-mail", icon: Mail, cls: "bg-sky-50 text-sky-600" },
  phone: { label: "Téléphone", icon: Phone, cls: "bg-indigo-50 text-indigo-600" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, cls: "bg-green-50 text-green-600" },
  meeting: { label: "RDV", icon: CalendarClock, cls: "bg-gold/10 text-gold" },
  note: { label: "Note", icon: PenLine, cls: "bg-gray-100 text-gray-500" },
};

const OFFER_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
  COUNTERED: "Contre-offre",
  WITHDRAWN: "Retirée",
  EXPIRED: "Expirée",
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return new Date(date).toLocaleDateString("fr-FR");
}

function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function stageOf(status: string) {
  return STAGES.find((s) => s.key === status) ?? STAGES[0];
}

/* ───────────────────────── detail drawer ───────────────────────── */

interface DrawerProps {
  lead: LeadCard;
  onClose: () => void;
  onStatus: (leadId: string, status: string) => void;
  onSaveNotes: (leadId: string, notes: string) => void;
  onAddInteraction: (
    leadId: string,
    payload: { type: string; content: string; direction: string }
  ) => void;
}

function LeadDrawer({
  lead,
  onClose,
  onStatus,
  onSaveNotes,
  onAddInteraction,
}: DrawerProps) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState({
    type: "email",
    content: "",
    direction: "outbound",
  });

  useEffect(() => {
    setNotes(lead.notes ?? "");
    setDirty(false);
  }, [lead.id, lead.notes]);

  const stage = stageOf(lead.status);

  const submitNotes = () => {
    onSaveNotes(lead.id, notes);
    setDirty(false);
  };

  const submitInteraction = () => {
    if (!form.content.trim()) return;
    onAddInteraction(lead.id, {
      type: form.type,
      content: form.content.trim(),
      direction: form.direction,
    });
    setForm((f) => ({ ...f, content: "" }));
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream-soft shadow-2xl">
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden border-b border-ink/10 bg-ink px-6 py-5 text-white">
          <div className="sunburst pointer-events-none absolute -right-10 -top-24 h-64 w-64 opacity-30" />
          <div className="pointer-events-none absolute -left-8 -bottom-16 h-40 w-40 rounded-full bg-gold/20 blur-[60px]" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/40 to-gold-light/10 font-display text-lg font-bold text-gold-light ring-1 ring-gold/40">
                {initials(lead.name)}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">{lead.name}</h3>
                <p className="text-xs text-white/50">
                  {SOURCE_LABELS[lead.source] ?? lead.source} · Prospect TAGMI
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mt-4 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
              <span className={cn("h-1.5 w-1.5 rounded-full", stage.dot)} />
              {stage.label}
            </span>
            {lead.score >= 80 && (
              <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300 ring-1 ring-green-500/30">
                Score {lead.score}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Actions */}
          <div className="mb-5 flex flex-wrap gap-2">
            {STAGES.slice(0, 5)
              .filter((s) => s.key !== lead.status)
              .slice(0, 2)
              .map((s) => (
                <Button
                  key={s.key}
                  size="sm"
                  variant="outline"
                  className="border-gold/40 text-gold hover:bg-gold/10"
                  onClick={() => onStatus(lead.id, s.key)}
                >
                  <ArrowRight className="mr-1 h-3 w-3" />
                  {s.label}
                </Button>
              ))}
            {lead.status !== "WON" && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-green-500 to-green-700 text-white"
                onClick={() => onStatus(lead.id, "WON")}
              >
                <Check className="mr-1 h-3 w-3" />
                Gagné
              </Button>
            )}
            {lead.status !== "LOST" && (
              <Button
                size="sm"
                variant="outline"
                className="border-rose-300 text-rose-600 hover:bg-rose-50"
                onClick={() => onStatus(lead.id, "LOST")}
              >
                <X className="mr-1 h-3 w-3" />
                Perdu
              </Button>
            )}
          </div>

          {/* Quick facts */}
          <div className="grid grid-cols-2 gap-3">
            {lead.email && (
              <div className="rounded-xl border border-gray-100 bg-white p-3">
                <Mail className="mb-1 h-4 w-4 text-gold" />
                <p className="truncate text-xs font-medium text-gray-900">{lead.email}</p>
              </div>
            )}
            {lead.phone && (
              <div className="rounded-xl border border-gray-100 bg-white p-3">
                <Phone className="mb-1 h-4 w-4 text-gold" />
                <p className="truncate text-xs font-medium text-gray-900">{lead.phone}</p>
              </div>
            )}
            <div className="rounded-xl border border-gray-100 bg-white p-3">
              <BadgeEuro className="mb-1 h-4 w-4 text-gold" />
              <p className="truncate text-xs font-medium text-gray-900">
                {lead.budget ? formatPrice(lead.budget) : "Budget non défini"}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-3">
              <Clock className="mb-1 h-4 w-4 text-gold" />
              <p className="truncate text-xs font-medium text-gray-900">
                {lead.lastContact ? `Contact: ${timeAgo(lead.lastContact)}` : "Jamais contacté"}
              </p>
            </div>
          </div>

          {lead.property && (
            <Link
              href={`/property/${lead.property.slug}`}
              className="mt-3 flex items-center gap-3 rounded-xl border border-gold/20 bg-gold/[0.04] p-3 transition-colors hover:bg-gold/10"
            >
              <Building2 className="h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {lead.property.title}
                </p>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {lead.property.city?.name ?? "—"} ·{" "}
                  {formatPrice(lead.property.price, lead.property.currency)}
                </p>
              </div>
            </Link>
          )}

          {/* Offers */}
          {lead.offers.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <HandCoins className="h-4 w-4" /> Offres reçues
              </p>
              <div className="space-y-2">
                {lead.offers.slice(0, 3).map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2"
                  >
                    <span className="font-display text-sm font-bold text-gray-800">
                      {formatPrice(o.amount, o.currency)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {OFFER_STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              Notes internes
            </p>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setDirty(true);
              }}
              rows={3}
              placeholder="Ajoutez vos notes privées…"
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
            {dirty && (
              <Button
                size="sm"
                onClick={submitNotes}
                className="mt-2 bg-gradient-to-r from-gold to-gold-light text-ink"
              >
                <Send className="mr-1 h-3 w-3" /> Enregistrer
              </Button>
            )}
          </div>

          {/* Add interaction */}
          <div className="mt-5 border-t border-gray-100 pt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              Nouvelle activité
            </p>
            <div className="flex gap-2">
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs outline-none focus:border-gold"
              >
                <option value="email">E-mail</option>
                <option value="phone">Appel</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="meeting">RDV</option>
                <option value="note">Note</option>
              </select>
              <select
                value={form.direction}
                onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value }))}
                className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs outline-none focus:border-gold"
              >
                <option value="outbound">Sortant</option>
                <option value="inbound">Entrant</option>
              </select>
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitInteraction();
                }}
                placeholder="Résumé de l'échange…"
                className="h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
              <Button
                size="icon"
                onClick={submitInteraction}
                className="bg-gradient-to-br from-gold to-gold-light text-ink"
                aria-label="Ajouter l'activité"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-5 border-t border-gray-100 pt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
              Historique
            </p>
            {lead.interactions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 bg-white/50 p-4 text-center text-xs text-gray-400">
                Aucune activité enregistrée pour le moment
              </p>
            ) : (
              <div className="relative space-y-4 pl-4">
                <div className="absolute bottom-1 left-[7px] top-1 w-px bg-gradient-to-b from-gold/60 via-gray-200 to-transparent" />
                {lead.interactions.map((it: Interaction) => {
                  const meta = INTERACTION_META[it.type] ?? INTERACTION_META.note;
                  const Icon = meta.icon;
                  return (
                    <div key={it.id} className="relative">
                      <span
                        className={cn(
                          "absolute -left-4 top-0 flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white",
                          meta.cls
                        )}
                      >
                        <Icon className="h-2.5 w-2.5" />
                      </span>
                      <p className="text-sm font-medium text-gray-800">
                        {meta.label}
                        <span className="ml-2 text-xs font-normal text-gray-400">
                          {it.direction === "inbound" ? "entrant" : "sortant"} ·{" "}
                          {timeAgo(it.createdAt)}
                        </span>
                      </p>
                      {it.content && (
                        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                          {it.content}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

/* ───────────────────────── main page ───────────────────────── */

export default function CrmPage() {
  const [data, setData] = useState<CrmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLead, setActiveLead] = useState<LeadCard | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

  const refresh = useCallback(async (keepActiveId?: string) => {
    try {
      const res = await fetch("/api/dashboard/crm");
      const resData = await res.json();
      if (resData.success) {
        setData(resData.data);
        if (keepActiveId) {
          const refreshed = resData.data.leads.find(
            (l: LeadCard) => l.id === keepActiveId
          );
          setActiveLead(refreshed ?? null);
        }
      }
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateStatus = async (leadId: string, status: string) => {
    const prev = data;
    setData(
      (d) =>
        d && {
          ...d,
          leads: d.leads.map((l) => (l.id === leadId ? { ...l, status } : l)),
        }
    );
    try {
      const res = await fetch("/api/dashboard/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status }),
      });
      if (!res.ok) throw new Error("PATCH failed");
      await refresh(leadId);
    } catch (error) {
      console.error("Failed:", error);
      setData(prev);
    }
  };

  const saveNotes = async (leadId: string, notes: string) => {
    try {
      const res = await fetch("/api/dashboard/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, notes }),
      });
      if (!res.ok) throw new Error("PATCH failed");
      await refresh(leadId);
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  const addInteraction = async (
    leadId: string,
    payload: { type: string; content: string; direction: string }
  ) => {
    try {
      const res = await fetch("/api/dashboard/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, ...payload }),
      });
      if (!res.ok) throw new Error("POST failed");
      await refresh(leadId);
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  const onDrop = (stage: string) => {
    if (dragId) updateStatus(dragId, stage);
    setDragId(null);
    setOverStage(null);
  };

  const summaryCards = data
    ? [
        {
          label: "Contacts",
          value: data.summary.total,
          icon: Contact,
          accent: "from-gold to-amber-600",
          glow: "bg-gold",
        },
        {
          label: "Pipeline actif",
          value: data.summary.active,
          icon: Users,
          accent: "from-indigo-500 to-violet-600",
          glow: "bg-indigo-500",
        },
        {
          label: "RDV à venir",
          value: data.upcomingVisits,
          icon: CalendarClock,
          accent: "from-emerald-500 to-teal-600",
          glow: "bg-emerald-500",
        },
        {
          label: "Taux de conversion",
          value: `${data.summary.conversionRate}%`,
          icon: TrendingUp,
          accent: "from-rose-400 to-pink-600",
          glow: "bg-rose-400",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* ---------- Header ---------- */}
      <section className="border-gold-hairline relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-[#170f08] to-[#251a06] p-8 text-white shadow-2xl shadow-gold/10 sm:p-10">
        <div
          className="sunburst pointer-events-none absolute -right-24 -top-24 h-[26rem] w-[26rem] opacity-40"
          style={{
            WebkitMaskImage: "radial-gradient(circle, black, transparent 72%)",
            maskImage: "radial-gradient(circle, black, transparent 72%)",
          }}
        />
        <div className="hero-zellige-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="hero-orb-slow pointer-events-none absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-gold/25 blur-[80px]" />

        <div className="relative">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-light">
            <Sparkles className="h-3.5 w-3.5" />
            Espace professionnel
          </p>
          <h1 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
            CRM <span className="shimmer-gold-text">— Suivi clients</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            Pilotez votre pipeline de prospection : suivez chaque contact, planifiez vos
            relances et transformez vos prospects en clients.
          </p>
          {data && (
            <div className="mt-5 flex flex-wrap gap-6">
              {[
                { l: "En pipeline", v: data.summary.active, dot: "bg-gold" },
                { l: "Gagnés", v: data.summary.won, dot: "bg-green-400" },
                { l: "Valeur pipeline", v: formatPrice(data.summary.pipelineValue), dot: "bg-indigo-400" },
              ].map((kpi) => (
                <div key={kpi.l} className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", kpi.dot)} />
                  <span className="text-xs text-white/50">{kpi.l}</span>
                  <span className="font-display text-sm font-bold text-gold-light">
                    {kpi.v}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-light/40 to-transparent" />
      </section>

      {/* ---------- Summary ---------- */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((stat) => (
          <Card
            key={stat.label}
            className="card-shine group border-gold-hairline relative overflow-hidden rounded-2xl border-0 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/10"
          >
            <div
              className={`absolute -right-5 -top-5 h-14 w-14 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25 ${stat.glow}`}
            />
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.accent} shadow-lg`}
            >
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <p className="font-display mt-4 text-3xl font-bold text-gray-900">
              {loading ? "…" : stat.value}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-500">{stat.label}</p>
          </Card>
        ))}
      </section>

      {/* ---------- Pipeline board ---------- */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-gold border-t-transparent" />
        </div>
      ) : (
        <section className="overflow-x-auto pb-4">
          <div className="flex min-w-[1100px] items-start gap-4">
            {STAGES.map((stage) => {
              const leadsInStage = data?.leads.filter(
                (l) => l.status === stage.key
              ) ?? [];
              const isOver = overStage === stage.key;
              return (
                <div
                key={stage.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverStage(stage.key);
                }}
                onDragLeave={() =>
                  setOverStage((s) => (s === stage.key ? null : s))
                }
                onDrop={() => onDrop(stage.key)}
                className={cn(
                  "flex w-[240px] shrink-0 flex-col rounded-2xl border bg-white/60 p-3 transition-all duration-200",
                  isOver
                    ? "border-gold shadow-lg shadow-gold/10"
                    : "border-gray-100"
                )}
              >
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <span className={cn("h-2 w-2 rounded-full", stage.dot)} />
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      {stage.label}
                    </p>
                    <span
                      className={cn(
                        "ml-auto rounded-full px-2 py-0.5 text-xs font-bold ring-1",
                        stage.chip
                      )}
                    >
                      {leadsInStage.length}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-2.5">
                    {leadsInStage.length === 0 && (
                      <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-xs text-gray-400">
                        Glissez un contact ici
                      </div>
                    )}
                    {leadsInStage.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => setDragId(lead.id)}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverStage(null);
                        }}
                        onClick={() => setActiveLead(lead)}
                        className={cn(
                          "group cursor-pointer rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md hover:shadow-gold/10",
                          dragId === lead.id && "opacity-40"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-ink to-stone-800 font-display text-xs font-bold text-gold-light ring-1 ring-gold/30">
                            {initials(lead.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-800">
                              {lead.name}
                            </p>
                            <p className="truncate text-xs text-gray-400">
                              {lead.property?.title ??
                                SOURCE_LABELS[lead.source] ??
                                lead.source}
                            </p>
                          </div>
                          <GripVertical className="h-4 w-4 shrink-0 text-gray-200 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>

                        <div className="mt-2.5 flex items-center gap-2">
                          {lead.score >= 80 && (
                            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                              {lead.score}
                            </span>
                          )}
                          {lead.offers.length > 0 && (
                            <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
                              {lead.offers.length} offre{lead.offers.length > 1 ? "s" : ""}
                            </span>
                          )}
                          <span className="ml-auto text-[10px] text-gray-400">
                            {lead.lastContact
                              ? timeAgo(lead.lastContact)
                              : formatDateShort(lead.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeLead && (
        <LeadDrawer
          lead={activeLead}
          onClose={() => setActiveLead(null)}
          onStatus={updateStatus}
          onSaveNotes={saveNotes}
          onAddInteraction={addInteraction}
        />
      )}
    </div>
  );
}