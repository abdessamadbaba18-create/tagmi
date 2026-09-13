"use client";

import { useState } from "react";
import {
  X,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Building2,
  Sparkles,
  Loader2,
  Check,
  Send,
  Globe2,
  LocateFixed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LocationValue {
  name: string;
  nameAr: string;
  description: string;
  image: string;
  cityId?: string;
  latitude: string;
  longitude: string;
  isActive: boolean;
}

export interface LocationOption {
  id: string;
  name: string;
}

interface LocationWizardProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  kind: "city" | "neighborhood";
  cities: LocationOption[];
  initial?: Partial<LocationValue>;
  onSubmit: (values: LocationValue) => Promise<void>;
}

const STEPS = [
  { title: "Informations", icon: Building2 },
  { title: "Localisation", icon: LocateFixed },
];

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-gold/60 focus:ring-2 focus:ring-gold/20";

export function LocationWizard({
  open,
  onClose,
  mode,
  kind,
  cities,
  initial,
  onSubmit,
}: LocationWizardProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState<LocationValue>({
    name: initial?.name ?? "",
    nameAr: initial?.nameAr ?? "",
    description: initial?.description ?? "",
    image: initial?.image ?? "",
    cityId: initial?.cityId ?? (cities[0]?.id ?? ""),
    latitude: initial?.latitude ?? "",
    longitude: initial?.longitude ?? "",
    isActive: initial?.isActive ?? true,
  });

  const itemLabel = kind === "city" ? "ville" : "quartier";

  const set = <K extends keyof LocationValue>(key: K, value: LocationValue[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const validateStep = () => {
    if (step === 0) {
      if (!values.name.trim()) {
        setError(`Le nom du ${itemLabel} est requis`);
        return false;
      }
      if (kind === "neighborhood" && !values.cityId) {
        setError("Veuillez choisir une ville");
        return false;
      }
    } else {
      if (values.latitude && (isNaN(Number(values.latitude)) || Number(values.latitude) < -90 || Number(values.latitude) > 90)) {
        setError("Latitude invalide (entre -90 et 90)");
        return false;
      }
      if (values.longitude && (isNaN(Number(values.longitude)) || Number(values.longitude) < -180 || Number(values.longitude) > 180)) {
        setError("Longitude invalide (entre -180 et 180)");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({
        ...values,
        latitude: values.latitude.trim(),
        longitude: values.longitude.trim(),
      });
      onClose();
    } catch (e: any) {
      setError(e?.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-md"
        onClick={handleClose}
      />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-ink/30">
        {/* Header */}
        <div className="relative overflow-hidden bg-ink px-6 pb-14 pt-6 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 70% 20%, rgba(202,138,4,0.35) 0%, transparent 45%), linear-gradient(135deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "auto, 28px 28px",
            }}
          />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/25 blur-[80px]" />
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-light text-ink shadow-lg shadow-gold/30">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
                {mode === "create" ? "Nouvelle entrée" : "Modification"}
              </p>
              <h3 className="font-display text-xl font-bold">
                {mode === "create" ? `Ajouter un${kind === "city" ? "" : "e"} ${itemLabel}` : `Modifier le ${itemLabel}`}
              </h3>
            </div>
          </div>

          {/* Steps */}
          <div className="relative mt-6 flex items-center gap-2">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div key={s.title} className="flex flex-1 items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                        done && "bg-gold text-ink",
                        active && "bg-white/15 text-gold-light ring-2 ring-gold/50",
                        !done && !active && "bg-white/5 text-white/40"
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "hidden text-xs font-semibold sm:block",
                        active ? "text-gold-light" : done ? "text-white/70" : "text-white/35"
                      )}
                    >
                      {s.title}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <span
                      className={cn(
                        "h-px flex-1 rounded-full transition-colors duration-500",
                        done ? "bg-gold/70" : "bg-white/10"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 0 ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Nom <span className="text-gold">*</span>
                </label>
                <input
                  autoFocus
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder={kind === "city" ? "Ex : Marrakech" : "Ex : Gueliz"}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Nom en arabe
                  </label>
                  <input
                    value={values.nameAr}
                    onChange={(e) => set("nameAr", e.target.value)}
                    placeholder="مراكش"
                    dir="rtl"
                    className={inputClass}
                  />
                </div>
                {kind === "neighborhood" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Ville <span className="text-gold">*</span>
                    </label>
                    <select
                      value={values.cityId}
                      onChange={(e) => set("cityId", e.target.value)}
                      className={cn(inputClass, "appearance-none bg-white")}
                    >
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {kind === "city" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Image (URL)
                  </label>
                  <input
                    value={values.image}
                    onChange={(e) => set("image", e.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Description
                </label>
                <textarea
                  value={values.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder={
                    kind === "city"
                      ? "La perle du sud, entre mer et montagne..."
                      : "Un quartier central et animé..."
                  }
                  rows={3}
                  className={cn(inputClass, "resize-none")}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-transparent p-4">
                <div className="flex items-center gap-3">
                  {kind === "city" ? (
                    <MapPin className="h-8 w-8 text-gold" />
                  ) : (
                    <Globe2 className="h-8 w-8 text-gold" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-stone-800">
                      {values.name || "—"}
                    </p>
                    <p className="truncate text-xs text-stone-500">
                      {values.nameAr || "Arabe vide"} ·{" "}
                      {kind === "neighborhood"
                        ? cities.find((c) => c.id === values.cityId)?.name || "Ville ?"
                        : "Coordonnées GPS"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Latitude
                  </label>
                  <input
                    value={values.latitude}
                    onChange={(e) => set("latitude", e.target.value)}
                    placeholder="31.6295"
                    inputMode="decimal"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Longitude
                  </label>
                  <input
                    value={values.longitude}
                    onChange={(e) => set("longitude", e.target.value)}
                    placeholder="-7.9811"
                    inputMode="decimal"
                    className={inputClass}
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-stone-200 p-4 transition-colors hover:border-gold/40">
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    {kind === "city" ? "Ville active" : "Quartier actif"}
                  </p>
                  <p className="text-xs text-stone-500">
                    Reste visible sur le site
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.isActive}
                  onClick={() => set("isActive", !values.isActive)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors duration-300",
                    values.isActive ? "bg-gold" : "bg-stone-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300",
                      values.isActive ? "left-[22px]" : "left-0.5"
                    )}
                  />
                </button>
              </label>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-stone-100 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={submitting}
            className="text-stone-500 hover:text-stone-800"
          >
            Annuler
          </Button>
          <div className="flex items-center gap-2">
            {step === 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setError("");
                  setStep(0);
                }}
                disabled={submitting}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Précédent
              </Button>
            )}
            {step === 0 ? (
              <Button type="button" variant="primary" onClick={handleNext}>
                Continuer
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-1.5 h-4 w-4" />
                )}
                {mode === "create" ? "Créer" : "Enregistrer"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}