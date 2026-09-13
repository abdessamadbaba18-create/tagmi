"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Users,
  Eye,
  Heart,
  Plus,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  BadgeCheck,
  PenLine,
  Layers,
  BarChart3,
  MessageCircle,
  Camera,
  Clock,
  Contact,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface DashboardStats {
  properties: number;
  leads: number;
  views: number;
  favorites: number;
}

interface User {
  firstName: string;
  lastName: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    properties: 0,
    leads: 0,
    views: 0,
    favorites: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchStats();
    fetchUser();
  }, []);

  const fetchStats = async () => {
    try {
      // In production, these would be separate API calls
      const [propsRes] = await Promise.all([fetch("/api/properties?limit=1")]);

      const propsData = await propsRes.json();

      setStats({
        properties: propsData.pagination?.total || 0,
        leads: 0,
        views: 0,
        favorites: 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success) setUser(data.user);
    } catch {
      // ignore
    }
  };

  const hour = new Date().getHours();
  const salutation = hour < 6 ? "Bonne nuit" : hour < 18 ? "Bonjour" : "Bonsoir";

  const statCards = [
    {
      title: "Mes biens",
      value: stats.properties,
      icon: Home,
      href: "/dashboard/properties",
      iconBg: "from-gold to-amber-600",
      glow: "bg-gold",
      bar: "from-gold/60 to-gold-light",
      delay: "0.08s",
    },
    {
      title: "Prospects",
      value: stats.leads,
      icon: Users,
      href: "/dashboard/leads",
      iconBg: "from-green-500 to-emerald-700",
      glow: "bg-green-500",
      bar: "from-green-400 to-emerald-600",
      delay: "0.14s",
    },
    {
      title: "Vues totales",
      value: stats.views,
      icon: Eye,
      href: "/dashboard/analytics",
      iconBg: "from-amber-300 to-gold",
      glow: "bg-amber-400",
      bar: "from-amber-300 to-gold",
      delay: "0.20s",
    },
    {
      title: "Favoris reçus",
      value: stats.favorites,
      icon: Heart,
      href: "/dashboard/analytics",
      iconBg: "from-rose-400 to-red-600",
      glow: "bg-rose-400",
      bar: "from-rose-300 to-red-500",
      delay: "0.26s",
    },
  ];

  const quickActions = [
    {
      href: "/dashboard/properties/new",
      title: "Créer une annonce",
      description: "Publiez un nouveau bien immobilier",
      icon: Plus,
      accent: "from-gold to-gold-light",
    },
    {
      href: "/dashboard/properties",
      title: "Gérer mes annonces",
      description: "Modifiez ou supprimez vos biens",
      icon: PenLine,
      accent: "from-amber-500 to-gold",
    },
    {
      href: "/dashboard/leads",
      title: "Prospects & offres",
      description: "Suivez vos demandes et vos offres",
      icon: Layers,
      accent: "from-emerald-500 to-green-700",
    },
    {
      href: "/dashboard/analytics",
      title: "Statistiques",
      description: "Analysez les performances",
      icon: BarChart3,
      accent: "from-sky-500 to-indigo-600",
    },
    {
      href: "/dashboard/crm",
      title: "CRM client",
      description: "Pilotez votre pipeline de vente",
      icon: Contact,
      accent: "from-violet-500 to-purple-700",
    },
    {
      href: "/dashboard/messages",
      title: "Messages",
      description: "Échangez avec vos acquéreurs",
      icon: MessageCircle,
      accent: "from-rose-400 to-pink-600",
    },
  ];

  const tips = [
    { icon: Camera, text: "Ajoutez de belles photos à vos annonces" },
    { icon: PenLine, text: "Décrivez votre bien en détail" },
    { icon: BarChart3, text: "Fixez un prix compétitif" },
    { icon: Clock, text: "Répondez rapidement aux messages" },
  ];

  return (
    <div className="space-y-8">
      {/* ---------- Greeting hero ---------- */}
      <section className="fade-in-once border-gold-hairline relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-[#170f08] to-[#251a06] p-8 text-white shadow-2xl shadow-gold/10 sm:p-10">
        {/* Sunburst watermark */}
        <div
          className="sunburst pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] opacity-40"
          style={{
            WebkitMaskImage: "radial-gradient(circle, black, transparent 72%)",
            maskImage: "radial-gradient(circle, black, transparent 72%)",
          }}
        />
        {/* Zellige lattice */}
        <div className="hero-zellige-grid pointer-events-none absolute inset-0 opacity-60" />
        {/* Ambient orbs */}
        <div className="hero-orb-slow pointer-events-none absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-gold/25 blur-[80px]" />
        <div className="pointer-events-none absolute bottom-6 right-24 h-40 w-40 rounded-full bg-gold-light/10 blur-[60px]" />

        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-light">
              <Sparkles className="h-3.5 w-3.5" />
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <h1 className="font-display mt-4 text-3xl font-bold sm:text-4xl">
              {salutation}
              {user?.firstName ? (
                <>
                  , <span className="shimmer-gold-text">{user.firstName}</span>
                </>
              ) : (
                " et bienvenue"
              )}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
              Bienvenue dans votre espace TAGMI — pilotez vos biens, vos prospects et
              vos statistiques à partir d&apos;un même écran.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-lg shadow-gold/30 transition-all hover:-translate-y-0.5 hover:from-gold-light hover:to-gold hover:shadow-gold/40"
              >
                <Link href="/dashboard/properties/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une annonce
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/15 bg-white/5 text-white shadow-inner backdrop-blur-sm transition-colors hover:border-gold/40 hover:bg-white/10 hover:text-gold-light"
              >
                <Link href="/dashboard/properties">Voir mes biens</Link>
              </Button>
            </div>
          </div>

          {/* Brand medallion */}
          <div className="hidden shrink-0 lg:block">
            <div className="brand-orbit flex h-40 w-40 items-center justify-center rounded-full bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm">
              <img
                src="/TAGMI.png"
                alt="TAGMI"
                className="h-14 w-auto object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.45)]"
              />
            </div>
          </div>
        </div>

        {/* Gold hairlines */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-light/40 to-transparent" />
      </section>

      {/* ---------- Stat cards ---------- */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="fade-in-once group"
            style={{ animationDelay: stat.delay }}
          >
            <Card className="card-shine border-gold-hairline relative h-full overflow-hidden rounded-2xl border-0 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/10">
              <div
                className={`absolute -right-5 -top-5 h-16 w-16 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25 ${stat.glow}`}
              />
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.iconBg} shadow-lg`}
                >
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" />
              </div>
              <p className="font-display mt-5 text-3xl font-bold text-gray-900">
                {loading ? "…" : stat.value}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-500">{stat.title}</p>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full w-1/3 rounded-full bg-gradient-to-r ${stat.bar} transition-all duration-500 group-hover:w-2/3`}
                />
              </div>
            </Card>
          </Link>
        ))}
      </section>

      {/* ---------- Quick actions + tips ---------- */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="fade-in-once border-gold-hairline relative overflow-hidden rounded-2xl border-0 lg:col-span-2"
          style={{ animationDelay: "0.34s" }}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-[60px]" />
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-gold-light shadow">
                <BadgeCheck className="h-4 w-4 text-ink" />
              </span>
              <CardTitle className="font-display text-xl text-gray-900">
                Actions rapides
              </CardTitle>
            </div>
            <CardDescription>Vos raccourcis essentiels au quotidien</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${action.accent} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                  >
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {action.title}
                    </p>
                    <p className="truncate text-xs text-gray-500">{action.description}</p>
                  </div>
                  <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-gray-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="fade-in-once relative overflow-hidden rounded-2xl border-0 bg-ink text-white" style={{ animationDelay: "0.4s" }}>
          <div className="khatam-pattern pointer-events-none absolute inset-0 opacity-30" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-gold/20 blur-[60px]" />
          <CardHeader className="relative">
            <div className="flex items-center gap-2">
              <span className="hero-ornament flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-gold/40">
                <Sparkles className="h-4 w-4 text-gold-light" />
              </span>
              <CardTitle className="font-display text-xl">Conseils TAGMI</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="mb-4 h-px w-full bg-gradient-to-r from-gold/70 via-gold/20 to-transparent" />
            <ul className="space-y-4">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                  <span className="animate-node-pulse mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-gold/10 ring-1 ring-gold/40">
                    <tip.icon className="h-3 w-3 text-gold-light" />
                  </span>
                  <span className="leading-snug">{tip.text}</span>
                  <CheckCircle2 className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-gold/70" />
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/settings"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-light transition-colors hover:text-gold"
            >
              Paramétrer mon profil
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}