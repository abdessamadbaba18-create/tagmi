"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Building2, KeyRound, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { useI18n } from "@/i18n/provider";

const OAUTH_ERRORS: Record<string, string> = {
  oauth_invalid_state: "Session de connexion invalide. Réessayez.",
  oauth_denied: "Vous avez annulé la connexion sociale.",
  oauth_failed: "La connexion sociale a échoué. Réessayez.",
};

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("error");
    if (code) {
      setError(OAUTH_ERRORS[code] || "Une erreur est survenue lors de la connexion");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/20";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(45deg, rgba(202,138,4,0.05) 1px, transparent 1px)",
            backgroundSize: "80px 80px, 80px 80px, 40px 40px",
          }}
          aria-hidden="true"
        />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-gold/20 blur-[110px]" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-gold-light/10 blur-[90px]" aria-hidden="true" />

        <div className="relative p-12">
          <Link href="/" className="inline-flex items-center">
            <img
              src="/TAGMI.png"
              alt="TAGMI"
              className="h-6 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="relative p-12">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold-light">
            <KeyRound className="h-3.5 w-3.5" />
            Espace membre
          </span>
          <h2 className="mb-4 font-display text-4xl font-bold leading-tight">
            Votre portail immobilier
            <span className="block bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              au cœur du Maroc
            </span>
          </h2>
          <p className="mb-10 max-w-md text-white/60">
            Retrouvez vos favoris, vos recherches et gérez vos demandes depuis un
            seul espace, en toute simplicité.
          </p>

          <div className="grid max-w-md grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, label: "Sécurisé & fiable", sub: "Vos données protégées" },
              { icon: Building2, label: "Des dizaines de biens", sub: "Partout au Maroc" },
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm"
              >
                <item.icon className="mb-2 h-5 w-5 text-gold-light" />
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-white/50">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-white/10 px-12 py-6 text-xs text-white/40">
          <span>© 2026 TAGMI. Tous droits réservés.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="transition-colors hover:text-gold-light">Conditions</Link>
            <Link href="/privacy" className="transition-colors hover:text-gold-light">Confidentialité</Link>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <img
              src="/TAGMI.png"
              alt="TAGMI"
              className="mx-auto mb-4 h-6 w-auto object-contain lg:hidden"
            />
            <h1 className="font-display text-3xl font-bold text-gray-900">
              {t("auth.login")}
            </h1>
            <p className="mt-2 text-gray-500">
              Heureux de vous revoir sur TAGMI
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className={inputClass}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  {t("auth.password")}
                </label>
                <Link href="/forgot-password" className="text-sm text-gold transition-colors hover:text-gold-light">
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={inputClass + " pr-11"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gold"
                  aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 accent-gold" />
              Se souvenir de moi
            </label>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-lg shadow-gold/25 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-gold/35 disabled:opacity-60"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.login")}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <OAuthButtons />

          <div className="mt-6 text-center text-sm text-gray-500">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="font-semibold text-gold hover:text-gold-light">
              {t("auth.register")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}