"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, KeyRound, ArrowRight, CheckCircle, ShieldCheck, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { useI18n } from "@/i18n/provider";

type RegisterRole = "BUYER" | "PROPERTY_OWNER" | "AGENT";

const OAUTH_ERRORS: Record<string, string> = {
  oauth_invalid_state: "Session de connexion invalide. Réessayez.",
  oauth_denied: "Vous avez annulé la connexion sociale.",
  oauth_failed: "La connexion sociale a échoué. Réessayez.",
};

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<RegisterRole>("BUYER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("error");
    if (code) {
      setError(OAUTH_ERRORS[code] || "Une erreur est survenue lors de l'inscription");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          confirmPassword,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: RegisterRole; label: string }[] = [
    { value: "BUYER", label: t("auth.roles.BUYER") }
  ];

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
            Rejoignez TAGMI
          </span>
          <h2 className="mb-4 font-display text-4xl font-bold leading-tight">
            Créez votre espace
            <span className="block bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              en quelques secondes
            </span>
          </h2>
          <p className="mb-10 max-w-md text-white/60">
            Achetez, louez, vendez ou investissez avec les meilleurs biens
            immobiliers du Maroc, mis en avant par des agents vérifiés.
          </p>

          <ul className="max-w-md space-y-3">
            {[
              { icon: CheckCircle, text: "Publication d'annonces 100% gratuite" },
              { icon: ShieldCheck, text: "Agents vérifiés et annonces modérées" },
              { icon: Users, text: "Accès à des milliers de biens au Maroc" },
              { icon: Building2, text: "Outils pour vendeurs, acheteurs et investisseurs" },
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-3 text-sm text-white/70">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gold/10">
                  <item.icon className="h-4 w-4 text-gold-light" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
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
              {t("auth.register")}
            </h1>
            <p className="mt-2 text-gray-500">
              Rejoignez les milliers de membres TAGMI au Maroc
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("auth.registerAs")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      role === r.value
                        ? "border-gold bg-gold/10 text-gold shadow-sm"
                        : "border-gray-200 text-gray-600 hover:border-gold/40 hover:text-gold"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t("auth.firstName")}
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Prénom"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t("auth.lastName")}
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Nom"
                  className={inputClass}
                />
              </div>
            </div>

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
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t("auth.phone")}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+2126XXXXXXX"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t("auth.password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="8+ caractères, avec majuscule et chiffre"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t("auth.confirmPassword")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirmez votre mot de passe"
                className={inputClass}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-lg shadow-gold/25 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-gold/35 disabled:opacity-60"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.register")}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <OAuthButtons />

          <div className="mt-6 text-center text-sm text-gray-500">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="font-semibold text-gold hover:text-gold-light">
              {t("auth.login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}