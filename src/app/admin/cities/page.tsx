"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Plus,
  Search,
  Trash2,
  Pencil,
  Building2,
  Home,
  Loader2,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LocationWizard,
  type LocationValue,
} from "@/components/admin/location-wizard";

interface CityRow {
  id: string;
  name: string;
  nameFr: string | null;
  nameAr: string | null;
  slug: string;
  image: string | null;
  description: string | null;
  latitude: any;
  longitude: any;
  isActive: boolean;
  _count: { neighborhoods: number; properties: number };
}

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<CityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editing, setEditing] = useState<CityRow | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cities");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur");
      setCities(data.data);
      setError("");
    } catch (e: any) {
      setError(e.message || "Impossible de charger les villes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.nameAr || "").includes(q) ||
        c.slug.includes(q)
    );
  }, [cities, search]);

  const handleSubmit = async (values: LocationValue) => {
    if (editing) {
      const res = await fetch("/api/admin/cities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...values }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur");
    } else {
      const res = await fetch("/api/admin/cities", {
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
      const res = await fetch(`/api/admin/cities?id=${id}`, { method: "DELETE" });
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-7 text-white shadow-lg">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 15%, rgba(202,138,4,0.35) 0%, transparent 45%), linear-gradient(135deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "auto, 28px 28px",
          }}
        />
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/25 blur-[70px]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-light text-ink shadow-lg shadow-gold/30">
              <MapPin className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold">Villes</h1>
              <p className="text-sm text-white/50">
                {cities.length} ville{cities.length > 1 ? "s" : ""} répertoriée
                {cities.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setWizardOpen(true);
            }}
            className="gap-2 shadow-lg shadow-gold/30"
          >
            <Plus className="h-4 w-4" />
            Ajouter une ville
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une ville (nom, arabe, slug)..."
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-800 shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
          />
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
            <MapPin className="h-7 w-7" />
          </span>
          <p className="text-sm font-medium text-stone-500">
            Aucune ville ne correspond
          </p>
          <p className="text-xs text-stone-400">
            {search ? "Essayez une autre recherche" : "Ajoutez votre première ville"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((city) => (
            <div
              key={city.id}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
                city.isActive ? "border-stone-200" : "border-dashed border-stone-300 opacity-70"
              )}
            >
              {/* Cover */}
              <div className="relative h-28 overflow-hidden bg-gradient-to-br from-ink to-stone-800">
                {city.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={city.image}
                    alt={city.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 30% 30%, rgba(202,138,4,0.4) 0%, transparent 50%), linear-gradient(135deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                      backgroundSize: "auto, 26px 26px",
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <div className="absolute left-4 top-3 flex items-center gap-1.5">
                  <Badge
                    variant={city.isActive ? "gold" : "stone"}
                    className="backdrop-blur-md"
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        city.isActive ? "bg-gold" : "bg-stone-400"
                      )}
                    />
                    {city.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold leading-tight text-white drop-shadow">
                      {city.name}
                    </p>
                    {city.nameAr && (
                      <p className="truncate text-xs text-white/60" dir="rtl">
                        {city.nameAr}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-lg bg-white/10 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-gold-light backdrop-blur">
                    /{city.slug}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-px bg-stone-100">
                <div className="flex items-center gap-2 bg-white px-4 py-3">
                  <Building2 className="h-4 w-4 text-gold" />
                  <span className="text-xs text-stone-500">
                    <span className="font-bold text-stone-800">{city._count.neighborhoods}</span>{" "}
                    quartier{city._count.neighborhoods > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-3">
                  <Home className="h-4 w-4 text-gold" />
                  <span className="text-xs text-stone-500">
                    <span className="font-bold text-stone-800">{city._count.properties}</span>{" "}
                    bien{city._count.properties > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 border-t border-stone-100 px-3 py-2.5">
                {confirmId === city.id ? (
                  <>
                    <span className="flex-1 text-xs font-medium text-stone-500">
                      Supprimer cette ville ?
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(city.id)}
                      disabled={busyId === city.id}
                      className="gap-1"
                    >
                      {busyId === city.id && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      Oui
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmId(null)}
                      disabled={busyId === city.id}
                    >
                      Non
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(city);
                        setWizardOpen(true);
                      }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:bg-stone-50 hover:text-gold"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(city.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Supprimer
                    </button>
                    {city.description && (
                      <ChevronRight className="h-4 w-4 text-stone-300" />
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wizard */}
      <LocationWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        mode={editing ? "edit" : "create"}
        kind="city"
        cities={[]}
        onSubmit={handleSubmit}
        initial={
          editing
            ? {
                name: editing.name,
                nameAr: editing.nameAr ?? "",
                description: editing.description ?? "",
                image: editing.image ?? "",
                latitude: String(editing.latitude ?? ""),
                longitude: String(editing.longitude ?? ""),
                isActive: editing.isActive,
              }
            : { isActive: true }
        }
      />

      <p className="flex items-center justify-center gap-1.5 pb-4 text-xs text-stone-400">
        <Sparkles className="h-3.5 w-3.5 text-gold" />
        Les villes alimentent automatiquement les filtres du site.
      </p>
    </div>
  );
}