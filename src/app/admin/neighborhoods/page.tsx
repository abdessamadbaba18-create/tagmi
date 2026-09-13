"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Globe2,
  Plus,
  Search,
  Trash2,
  Pencil,
  Home,
  Loader2,
  AlertCircle,
  MapPin,
  Building2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LocationWizard,
  type LocationValue,
  type LocationOption,
} from "@/components/admin/location-wizard";

interface NeighborhoodRow {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  cityName: string;
  cityId: string;
  isActive: boolean;
  _count: { properties: number };
}

interface CityOption extends LocationOption {}

export default function AdminNeighborhoodsPage() {
  const [rows, setRows] = useState<NeighborhoodRow[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [cityFilter, setCityFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editing, setEditing] = useState<NeighborhoodRow | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadCities = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cities");
      const data = await res.json();
      if (data.success) {
        setCities(data.data.map((c: any) => ({ id: c.id, name: c.name })));
        setCityFilter((prev) => {
          const ids = data.data.map((c: any) => c.id);
          if (prev && ids.includes(prev)) return prev;
          return ids[0] ?? "";
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const qs = cityFilter ? `?cityId=${encodeURIComponent(cityFilter)}` : "";
      const res = await fetch(`/api/admin/neighborhoods${qs}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur");
      setRows(data.data);
      setError("");
    } catch (e: any) {
      setError(e.message || "Impossible de charger les quartiers");
    } finally {
      setLoading(false);
    }
  }, [cityFilter]);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  useEffect(() => {
    if (cityFilter) load();
  }, [load, cityFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        (n.nameAr || "").includes(q) ||
        n.slug.includes(q)
    );
  }, [rows, search]);

  const handleSubmit = async (values: LocationValue) => {
    if (editing) {
      const res = await fetch("/api/admin/neighborhoods", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...values }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur");
    } else {
      const res = await fetch("/api/admin/neighborhoods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Données invalides"
        );
      }
    }
    await load();
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/neighborhoods?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur");
      await load();
    } catch (e: any) {
      setError(e.message || "Suppression impossible");
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  };

  const activeCityName = cities.find((c) => c.id === cityFilter)?.name || "";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-7 text-white shadow-lg">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 15%, rgba(202,138,4,0.35) 0%, transparent 45%), linear-gradient(135deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "auto, 28px 28px",
          }}
        />
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/25 blur-[70px]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-light text-ink shadow-lg shadow-gold/30">
              <Globe2 className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold">Quartiers</h1>
              <p className="text-sm text-white/50">
                {rows.length} quartier{rows.length > 1 ? "s" : ""}
                {activeCityName ? ` à ${activeCityName}` : ""}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setWizardOpen(true);
            }}
            disabled={cities.length === 0}
            className="gap-2 shadow-lg shadow-gold/30"
          >
            <Plus className="h-4 w-4" />
            Ajouter un quartier
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un quartier..."
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-800 shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div className="flex items-center gap-2 sm:w-64">
          <MapPin className="h-4 w-4 shrink-0 text-stone-400" />
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-3 pr-4 text-sm text-stone-800 shadow-sm outline-none transition-all focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-20 text-stone-400">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="text-xs uppercase tracking-widest">Chargement...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-stone-300 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
            <Globe2 className="h-7 w-7" />
          </span>
          <p className="text-sm font-medium text-stone-500">
            Aucun quartier trouvé
          </p>
          <p className="text-xs text-stone-400">
            {cities.length === 0
              ? "Créez d'abord une ville"
              : "Ajoutez votre premier quartier"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                <th className="px-4 py-3 font-semibold">Quartier</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                  Ville
                </th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">
                  Slug
                </th>
                <th className="px-4 py-3 text-center font-semibold">Biens</th>
                <th className="px-4 py-3 text-center font-semibold">Statut</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((n) => (
                <tr
                  key={n.id}
                  className={cn(
                    "group transition-colors hover:bg-stone-50/70",
                    !n.isActive && "opacity-60"
                  )}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold-light/10 text-gold ring-1 ring-gold/20">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-stone-800">
                          {n.name}
                        </p>
                        {n.nameAr && (
                          <p className="truncate text-xs text-stone-400" dir="rtl">
                            {n.nameAr}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-stone-500 sm:table-cell">
                    {n.cityName}
                  </td>
                  <td className="hidden px-4 py-3.5 md:table-cell">
                    <span className="rounded-lg bg-stone-100 px-2 py-0.5 font-mono text-[10px] text-stone-500">
                      /{n.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-xs text-stone-600">
                      <Home className="h-3.5 w-3.5 text-gold" />
                      {n._count.properties}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Badge variant={n.isActive ? "gold" : "stone"}>
                      {n.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {confirmId === n.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(n.id)}
                            disabled={busyId === n.id}
                            className="gap-1"
                          >
                            {busyId === n.id && (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                            Supprimer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmId(null)}
                            disabled={busyId === n.id}
                          >
                            Annuler
                          </Button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(n);
                              setWizardOpen(true);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-gold/10 hover:text-gold"
                            aria-label="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(n.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Wizard */}
      <LocationWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        mode={editing ? "edit" : "create"}
        kind="neighborhood"
        cities={cities}
        onSubmit={handleSubmit}
        initial={
          editing
            ? {
                name: editing.name,
                nameAr: editing.nameAr ?? "",
                cityId: editing.cityId,
                isActive: editing.isActive,
              }
            : { cityId: cityFilter || cities[0]?.id || "", isActive: true }
        }
      />

      <p className="flex items-center justify-center gap-1.5 pb-4 text-xs text-stone-400">
        <Sparkles className="h-3.5 w-3.5 text-gold" />
        Les quartiers affinent la recherche géographique des annonces.
      </p>
    </div>
  );
}