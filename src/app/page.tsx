"use client";

import Link from "next/link";
import {
  Search, Home as HomeIcon, Users, Building, ChevronRight,
  MapPin, ArrowRight, BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertyCard } from "@/components/property/property-card";
import { useI18n } from "@/i18n/provider";
import { useEffect, useState } from "react";

function SunburstMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0l2.3 7.2L21 4.9l-2.3 6.7L24 12l-5.3.4L21 19.1l-6.7-2.3L12 24l-2.3-7.2L3 19.1l2.3-6.7L0 12l5.3-.4L3 4.9l6.7 2.3z" />
    </svg>
  );
}

const FEATURED_PROPERTIES = [
  {
    id: "1",
    title: "Appartement moderne avec vue panoramique",
    slug: "appartement-moderne-gueliz-marrakech",
    price: 1200000,
    currency: "MAD",
    propertyType: "APARTMENT",
    transactionType: "SALE",
    bedrooms: 3,
    bathrooms: 2,
    surfaceArea: 120,
    city: "Marrakech",
    neighborhood: "Gueliz",
    verified: true,
    isNew: true,
  },
  {
    id: "2",
    title: "Villa de luxe avec piscine et jardin",
    slug: "villa-luxe-hivernage-marrakech",
    price: 4500000,
    currency: "MAD",
    propertyType: "VILLA",
    transactionType: "SALE",
    bedrooms: 5,
    bathrooms: 4,
    surfaceArea: 350,
    city: "Marrakech",
    neighborhood: "Hivernage",
    verified: true,
  },
  {
    id: "3",
    title: "Riad traditionnel rénové",
    slug: "riad-traditionnel-medina-marrakech",
    price: 2800000,
    currency: "MAD",
    propertyType: "RIAD",
    transactionType: "SALE",
    bedrooms: 6,
    bathrooms: 5,
    surfaceArea: 280,
    city: "Marrakech",
    neighborhood: "Medina",
    verified: true,
  },
  {
    id: "4",
    title: "Appartement meublé centre-ville",
    slug: "appartement-meuble-centre-ville-casablanca",
    price: 850000,
    currency: "MAD",
    propertyType: "APARTMENT",
    transactionType: "SALE",
    bedrooms: 2,
    bathrooms: 1,
    surfaceArea: 75,
    city: "Casablanca",
    neighborhood: "Centre-ville",
    verified: true,
    isNew: true,
  },
];

const POPULAR_CITIES = [
  { name: "Marrakech", slug: "marrakech", count: 1250 },
  { name: "Casablanca", slug: "casablanca", count: 980 },
  { name: "Rabat", slug: "rabat", count: 650 },
  { name: "Agadir", slug: "agadir", count: 420 },
  { name: "Tangier", slug: "tangier", count: 380 },
  { name: "Fes", slug: "fes", count: 310 },
];

const HOW_IT_WORKS = [
  {
    icon: Search,
    title: "Recherchez",
    description: "Parcourez des milliers d'annonces vérifiées selon vos critères.",
  },
  {
    icon: HomeIcon,
    title: "Visitez",
    description: "Planifiez des visites avec des agents vérifiés et professionnels.",
  },
  {
    icon: Users,
    title: "Négociez",
    description: "Faites une offre et négociez en toute confiance.",
  },
  {
    icon: Building,
    title: "Obtenez",
    description: "Finalisez votre transaction en toute sécurité.",
  },
];

export default function Home() {
  const { t } = useI18n();
  const [featuredProperties, setFeaturedProperties] = useState<any[]>(FEATURED_PROPERTIES);

  useEffect(() => {
    let active = true;

    fetch("/api/properties?featured=true&limit=4")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data?.success && Array.isArray(data.data)) {
          setFeaturedProperties(data.data);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        {/* Hero image from public */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero.avif"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />

        {/* Dark overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/60" aria-hidden="true" />

        {/* Faint art-deco sunburst accent */}
        <div
          className="sunburst absolute -right-56 -top-64 h-[52rem] w-[52rem] opacity-30 [mask-image:radial-gradient(80%_80%_at_50%_40%,black,transparent_70%)]"
          aria-hidden="true"
        />

        {/* Gold root base band */}
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-gold via-gold-light to-gold/70" aria-hidden="true" />

        <div className="relative container mx-auto grid items-center gap-14 px-4 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          {/* LEFT — messaging */}
          <div className="max-w-xl">
            {/* Kicker */}
            <div className="fade-in-once mb-6 flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-light">
                ✔  Immobilier · Maroc
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display mb-6 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              <span className="fade-in-once block" style={{ animationDelay: "0.05s" }}>
                Trouvez votre
              </span>
              <span className="fade-in-once block italic bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent" style={{ animationDelay: "0.1s" }}>
                bien de rêve
              </span>
              <span className="fade-in-once block" style={{ animationDelay: "0.15s" }}>
                au Maroc
              </span>
            </h1>

            <p className="fade-in-once mb-8 max-w-md text-lg leading-relaxed text-white/75" style={{ animationDelay: "0.2s" }}>
              {t("home.hero.subtitle")}
            </p>

            {/* Search */}
            <div className="fade-in-once mb-5" style={{ animationDelay: "0.25s" }}>
              <div className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/[0.07] p-2 backdrop-blur-xl transition-colors focus-within:border-gold/50 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gold-light/80" />
                  <Input
                    type="text"
                    placeholder={t("home.search.placeholder")}
                    className="h-12 border-0 bg-transparent pl-11 text-white placeholder:text-white/50 focus-visible:ring-0"
                  />
                </div>
                <Button
                  size="xl"
                  className="h-12 shrink-0 bg-gradient-to-r from-gold to-gold-light px-7 font-semibold text-ink shadow-[0_12px_28px_-12px_rgba(202,138,4,1)] ring-1 ring-gold-light/40 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_16px_34px_-12px_rgba(202,138,4,1)]"
                >
                  Explorer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Popular searches */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Populaires :</span>
                {["Villa Hivernage", "Riad Medina", "Appartement Gueliz"].map((item) => (
                  <button
                    key={item}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 transition-colors hover:border-gold/50 hover:text-gold-light"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick action links */}
            <div className="fade-in-once text-black mb-10 flex flex-wrap gap-3" style={{ animationDelay: "0.3s" }}>
              {[
                { href: "/buy", label: t("nav.buy") },
                { href: "/sell", label: t("nav.sell") },
                { href: "/invest", label: t("nav.invest") },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/25 text-black/85 backdrop-blur transition-colors hover:border-gold/60 hover:text-gold-light"
                  >
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Stats */}
            <div className="fade-in-once grid grid-cols-3 gap-6 border-t border-white/10 pt-6" style={{ animationDelay: "0.35s" }}>
              {[
                { value: "2 500+", label: "Annonces actives" },
                { value: "98%", label: "Biens vérifiés" },
                { value: "20+", label: "Années d'expérience" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <span className="font-display text-2xl font-bold text-gold-light md:text-3xl">{stat.value}</span>
                  <span className="text-xs text-white/60">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — featured property card (premium gold panel) */}
          <div className="fade-in-once relative mx-auto w-full max-w-sm lg:w-auto" style={{ animationDelay: "0.2s" }}>
            {featuredProperties[0] ? (
              <Link href={`/property/${featuredProperties[0].slug}`} className="group relative mx-auto block w-full max-w-sm">
                {/* Gold hairline outer frame */}
                <div className="pointer-events-none absolute -inset-1 rounded-[1.6rem] bg-gradient-to-b from-gold/60 via-gold/15 to-gold/60 opacity-80 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />

                <div className="relative rounded-3xl border border-gold/25 bg-[#171210]/80 p-3 shadow-[0_50px_110px_-45px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-all duration-500 group-hover:-translate-y-1.5">
                  {/* Gold ribbon */}
                  <div className="mb-3 h-[3px] rounded-full bg-gradient-to-r from-gold via-gold-light to-gold/40" aria-hidden="true" />

                  <div className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-black/40">
                    {featuredProperties[0].images?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featuredProperties[0].images[0].url}
                        alt={featuredProperties[0].title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-gold/15 via-ink to-gold/10">
                        <SunburstMark className="h-8 w-8 text-gold-light/50" />
                        <span className="font-display text-sm font-bold tracking-[0.3em] text-white/40">TAGMI</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#171210]/95 via-transparent to-transparent" />

                    {/* Gold badge */}
                    <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold to-gold-light px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink shadow-lg shadow-gold/30">
                       <h1>✯</h1> Propriété de la semaine
                    </span>
                    
                  </div>

                  <div className="px-2 py-4">
                    <p className="truncate font-display text-lg font-bold text-white drop-shadow">{featuredProperties[0].title}</p>
                    <div className="mt-2 flex items-end justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Prix</span>
                        <p className="font-display text-xl font-bold text-gold-light">
                          {Number(featuredProperties[0].price).toLocaleString("fr-MA")}
                          <span className="ml-1 text-sm font-semibold text-white/70">{featuredProperties[0].currency}</span>
                        </p>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light text-ink shadow-lg shadow-gold/30 transition-transform duration-300 group-hover:scale-110">
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
                        {featuredProperties[0].city?.name || "Maroc"}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-light transition-colors duration-300 group-hover:text-gold">
                        Voir l&apos;annonce
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating verified chip */}
                <div className="absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold to-gold-light px-3.5 py-2 text-[10px] font-bold uppercase tracking-widest text-ink shadow-lg shadow-gold/40">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  Vérifié
                </div>
              </Link>
            ) : (
              <div className="relative flex aspect-[4/5] max-w-sm items-center justify-center rounded-3xl border border-gold/25 bg-[#171210]/70 backdrop-blur-xl">
                <SunburstMark className="h-10 w-10 text-gold-light/40" />
              </div>
            )}
          </div>
        </div>
      </section>


      {/* Featured Properties */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
                {t("home.sections.featured")}
              </span>
              <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">
                {t("home.sections.featured")}
              </h2>
            </div>
            <Link href="/properties">
              <Button
                variant="outline"
                className="group/btn border-gold/30 text-gold hover:border-gold hover:bg-gold/5"
              >
                Voir tout
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                slug={property.slug}
                price={Number(property.price)}
                currency={property.currency}
                propertyType={property.propertyType}
                transactionType={property.transactionType}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                surfaceArea={property.surfaceArea ? Number(property.surfaceArea) : null}
                city={property.city?.name || "Maroc"}
                neighborhood={property.neighborhood?.name}
                imageUrl={property.images?.[0]?.url}
                verified={property.verified}
                isNew={property.isNew}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="relative overflow-hidden bg-gray-50 py-20">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(12,10,9,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(12,10,9,0.03) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4">
          <div className="mb-10 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
              {t("home.sections.popularCities")}
            </span>
            <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">
              {t("home.sections.popularCities")}
            </h2>
            <p className="mt-2 text-gray-600">
              Explorez les biens immobiliers dans les villes les plus demandées
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {POPULAR_CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl border border-transparent bg-white p-5 text-center shadow-[0_1px_3px_rgba(12,10,9,0.06),0_8px_24px_-12px_rgba(12,10,9,0.12)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_24px_48px_-16px_rgba(202,138,4,0.3)]">
                  <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/15 to-gold-light/5">
                    <MapPin className="h-6 w-6 text-gold transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="font-bold text-gray-900">{city.name}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">{city.count} biens</p>
                  <span className="mt-3 block h-[2px] w-8 rounded-full bg-gradient-to-r from-gold to-gold-light opacity-0 transition-all duration-300 group-hover:w-full group-hover:opacity-100" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
              {t("home.sections.howItWorks")}
            </span>
            <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">
              {t("home.sections.howItWorks")}
            </h2>
            <p className="mt-2 text-gray-600">
              Trouvez votre bien immobilier en 4 étapes simples
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_1px_3px_rgba(12,10,9,0.05)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_24px_48px_-16px_rgba(202,138,4,0.2)]">
                {/* Step number */}
                <span className="absolute right-4 top-3 font-display text-5xl font-bold text-gray-100 transition-colors duration-300 group-hover:text-gold/20">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/15 to-gold-light/5">
                  <step.icon className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {step.description}
                </p>
                <span className="mt-4 block h-[2px] w-10 rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-300 group-hover:w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative isolate overflow-hidden bg-ink py-20 text-white">
        {/* Zellige grid */}
        <div className="hero-zellige-grid absolute inset-0" aria-hidden="true" />
        <div className="absolute -top-32 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-gold/15 blur-[120px]" aria-hidden="true" />

        <div className="relative container mx-auto px-4 text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold-light">
            {t("nav.register")}
          </span>
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            {t("home.sections.cta")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
            Confiez votre projet à une agence immobilière experte au Maroc
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="xl" className="bg-gradient-to-r from-gold to-gold-light text-ink shadow-lg shadow-gold/25 hover:shadow-xl hover:shadow-gold/35">
                Créer un compte
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/properties">
              <Button
                size="xl"
                variant="outline"
                className="border-white/25 text-gold backdrop-blur-sm hover:border-gold/60 hover:bg-white/5 hover:text-gold-light"
              >
                Parcourir les biens
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
