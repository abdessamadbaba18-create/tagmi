"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Share2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Save,
  AtSign,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NetworkKey = "instagram" | "facebook" | "tiktok";

const networks: {
  key: NetworkKey;
  label: string;
  tagline: string;
  gradient: string;
  iconBg: string;
  text: string;
  placeholder: string;
}[] = [
  {
    key: "instagram",
    label: "Instagram",
    tagline: "Votre compte @tagmi",
    gradient: "from-pink-500 via-red-500 to-amber-400",
    iconBg: "bg-gradient-to-br from-pink-500 via-red-500 to-amber-400",
    text: "text-pink-600",
    placeholder: "https://instagram.com/tagmi",
  },
  {
    key: "facebook",
    label: "Facebook",
    tagline: "Votre page TAGMI",
    gradient: "from-blue-600 to-blue-400",
    iconBg: "bg-gradient-to-br from-blue-600 to-blue-400",
    text: "text-blue-600",
    placeholder: "https://facebook.com/tagmi",
  },
  {
    key: "tiktok",
    label: "TikTok",
    tagline: "Votre @tagmi",
    gradient: "from-ink via-stone-800 to-stone-700",
    iconBg: "bg-gradient-to-br from-stone-900 to-stone-700",
    text: "text-stone-800",
    placeholder: "https://tiktok.com/@tagmi",
  },
];

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

const networkIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TikTokIcon,
} as const;

type ValueKey = NetworkKey | "phone" | "email";

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<ValueKey, string>>({
    instagram: "",
    facebook: "",
    tiktok: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings/social");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur");
      setValues({
        instagram: data.data.instagram ?? "",
        facebook: data.data.facebook ?? "",
        tiktok: data.data.tiktok ?? "",
        phone: data.data.phone ?? "",
        email: data.data.email ?? "",
      });
      setError("");
    } catch (e: any) {
      setError(e.message || "Impossible de charger les réseaux");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/settings/social", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message || "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  const isSet = (key: ValueKey) => values[key].trim() !== "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
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
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-light text-ink shadow-lg shadow-gold/30">
            <Share2 className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold">Réseaux sociaux</h1>
            <p className="text-sm text-white/50">
              Gérez les comptes affichés dans le pied de page du site
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-20 text-stone-400">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="text-xs uppercase tracking-widest">Chargement...</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {networks.map((network) => {
              const Icon = networkIcons[network.key];
              const filled = isSet(network.key);
              return (
                <div
                  key={network.key}
                  className="group flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-gold/30 hover:shadow-md sm:flex-row sm:items-center"
                >
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg",
                      network.iconBg,
                      network.key === "tiktok" && "ring-1 ring-white/20"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-bold text-stone-800">
                      {network.label}
                      {filled ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                          Non défini
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-stone-400">{network.tagline}</p>
                  </div>
                  <div className="flex w-full items-center gap-2 sm:w-80">
                    <AtSign className="h-4 w-4 shrink-0 text-stone-400" />
                    <input
                      value={values[network.key]}
                      onChange={(e) => {
                        setValues((v) => ({ ...v, [network.key]: e.target.value }));
                        setSaved(false);
                      }}
                      placeholder={network.placeholder}
                      className={cn(
                        "w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-gold/60 focus:bg-white focus:ring-2 focus:ring-gold/20",
                        filled && "border-stone-300 bg-white"
                      )}
                    />
                  </div>
                  <a
                    href={filled ? values[network.key] : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!filled}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-400 transition-colors",
                      filled
                        ? "hover:border-gold/40 hover:text-gold"
                        : "pointer-events-none opacity-40"
                    )}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              );
            })}
          </div>

          {/* Contact info */}
          <div className="mt-8">
            <div className="mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-stone-500">
                Coordonnées
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-gold/30 hover:shadow-md sm:flex-row sm:items-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg">
                  <Phone className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-stone-800">
                    Téléphone
                    {isSet("phone") && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </p>
                  <p className="text-xs text-stone-400">Numéro affiché dans le pied de page</p>
                </div>
                <input
                  type="tel"
                  value={values.phone}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, phone: e.target.value }));
                    setSaved(false);
                  }}
                  placeholder="+212 6 00 00 00 00"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-gold/60 focus:bg-white focus:ring-2 focus:ring-gold/20 sm:w-80"
                />
              </div>

              <div className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-gold/30 hover:shadow-md sm:flex-row sm:items-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-light text-ink shadow-lg">
                  <Mail className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-stone-800">
                    Email
                    {isSet("email") && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </p>
                  <p className="text-xs text-stone-400">Adresse affichée dans le pied de page</p>
                </div>
                <input
                  type="email"
                  value={values.email}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, email: e.target.value }));
                    setSaved(false);
                  }}
                  placeholder="contact@tagmi.ma"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-gold/60 focus:bg-white focus:ring-2 focus:ring-gold/20 sm:w-80"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-xs text-stone-500">
              {saved ? (
                <span className="flex items-center gap-1.5 font-semibold text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Réseaux enregistrés et visibles sur le site
                </span>
              ) : (
                <>Les liens sont publiés immédiatement dans le pied de page.</>
              )}
            </p>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="gap-2 shadow-lg shadow-gold/30"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}