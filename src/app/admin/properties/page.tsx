"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Eye,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModProperty {
  id: string;
  title: string;
  slug: string;
  price: any;
  status: string;
  verified: boolean;
  createdAt: string;
  city: { name: string };
  owner: { firstName: string; lastName: string; email: string };
}

const STATUS_CONF: Record<string, { label: string; variant: BadgeVariant; bar: string }> = {
  DRAFT: { label: "Brouillon", variant: "stone", bar: "from-stone-400 to-stone-300" },
  PENDING_REVIEW: { label: "En attente", variant: "amber", bar: "from-amber-500 to-orange-400" },
  PUBLISHED: { label: "Publié", variant: "green", bar: "from-emerald-500 to-teal-400" },
  SOLD: { label: "Vendu", variant: "gold", bar: "from-gold to-gold-light" },
  RENTED: { label: "Loué", variant: "gold", bar: "from-gold to-gold-light" },
  ARCHIVED: { label: "Archivé", variant: "stone", bar: "from-stone-300 to-stone-200" },
  REJECTED: { label: "Rejeté", variant: "red", bar: "from-red-500 to-rose-400" },
};

const STATUS_ORDER = ["PENDING_REVIEW", "DRAFT", "PUBLISHED", "SOLD", "RENTED", "ARCHIVED", "REJECTED"];

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<ModProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProperties();
  }, [page, filter, search]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filter) params.set("status", filter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/properties?${params}`);
      const data = await res.json();
      if (data.success) {
        setProperties(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (propertyId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, status }),
      });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      }
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        icon={Home}
        title="Propriétés"
        subtitle="Modérez les annonces de la plateforme et validez les publications"
      >
        <Link href="/admin/properties/new">
          <Button variant="primary" className="gap-2 shadow-lg shadow-gold/30">
            <Plus className="h-4 w-4" />
            Nouvelle annonce
          </Button>
        </Link>
      </AdminPageHeader>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setFilter("");
            setPage(1);
          }}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
            !filter
              ? "border-gold/60 bg-gold/10 text-gold"
              : "border-stone-200 bg-white text-stone-600 hover:border-gold/40"
          )}
        >
          Tous
        </button>
        {STATUS_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setFilter(key);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
              filter === key
                ? "border-gold/60 bg-gold/10 text-gold"
                : "border-stone-200 bg-white text-stone-600 hover:border-gold/40"
            )}
          >
            {STATUS_CONF[key].label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher une annonce..."
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-800 shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <button
          type="button"
          onClick={fetchProperties}
          className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:border-gold/50 hover:text-gold"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Actualiser
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20 text-stone-400">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-xs uppercase tracking-widest">Chargement...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  <th className="px-4 py-3 font-semibold">Annonce</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Propriétaire</th>
                  <th className="px-4 py-3 font-semibold">Ville</th>
                  <th className="px-4 py-3 text-center font-semibold">Statut</th>
                  <th className="px-4 py-3 text-center font-semibold">Vérifié</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {properties.map((p) => (
                  <tr key={p.id} className="group transition-colors hover:bg-gold/[0.03]">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold-light/10 ring-1 ring-gold/20">
                          <Eye className="h-4 w-4 text-gold" />
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/property/${p.slug}`}
                            className="block max-w-[260px] truncate font-semibold text-stone-800 transition-colors hover:text-gold"
                          >
                            {p.title}
                          </Link>
                          <p className="font-display text-xs font-bold text-gold">
                            {Number(p.price).toLocaleString("fr-FR")} MAD
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3.5 text-stone-500 lg:table-cell">
                      {p.owner?.firstName} {p.owner?.lastName}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1 text-xs font-medium text-stone-500">
                        <MapPin className="h-3.5 w-3.5 text-gold/70" />
                        {p.city?.name || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={STATUS_CONF[p.status]?.variant || "stone"}>
                        {STATUS_CONF[p.status]?.label || p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {p.verified ? (
                        <CheckCircle className="mx-auto h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="mx-auto h-5 w-5 text-stone-300" />
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {(p.status === "PENDING_REVIEW" || p.status === "DRAFT") && (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 hover:border-emerald-300 hover:bg-emerald-50"
                            onClick={() => updateStatus(p.id, "PUBLISHED")}
                          >
                            Publier
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:border-red-300 hover:bg-red-50"
                            onClick={() => updateStatus(p.id, "REJECTED")}
                          >
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && properties.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-sm text-stone-400">
                      Aucune annonce trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stone-100 px-4 py-3">
            <p className="text-xs text-stone-400">
              Page {page} sur {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold text-stone-600">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="flex items-center justify-center gap-1.5 pb-4 text-xs text-gold">
        <Sparkles className="h-3.5 w-3.5" />
        La publication rend l&apos;annonce visible immédiatement sur le site.
      </p>
    </div>
  );
}