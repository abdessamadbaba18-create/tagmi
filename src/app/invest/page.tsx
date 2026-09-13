"use client";

import Link from "next/link";
import {
  TrendingUp, Calculator, MapPin, BarChart3, ArrowRight, Landmark, PiggyBank
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/ui/section-heading";

export default function InvestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <PageHeader
        badge="Investir au Maroc"
        title="Investir dans l'immobilier marocain"
        subtitle="Découvrez les meilleures opportunités d'investissement immobilier à Marrakech, Casablanca et dans tout le Maroc."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/properties?transactionType=INVESTMENT">
            <Button size="xl" className="bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-lg shadow-gold/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/35">
              Voir les opportunités
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/sell">
            <Button size="xl" variant="outline" className="border-white/25 text-gold hover:border-gold/60 hover:bg-white/5 hover:text-gold-light">
              Vendre un bien
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Stats */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {[
            { value: "6-8%", label: "Rendement locatif moyen", icon: TrendingUp },
            { value: "+12%", label: "Appréciation annuelle", icon: Landmark },
            { value: "30+", label: "Millions de touristes/an", icon: PiggyBank },
            { value: "1ère", label: "Destination Afrique", icon: BarChart3 },
          ].map((stat, index) => (
            <div
              key={index}
              className="group rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_24px_48px_-16px_rgba(202,138,4,0.25)]"
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gold/15 to-gold-light/5 transition-colors duration-300 group-hover:from-gold/25 group-hover:to-gold-light/10">
                <stat.icon className="h-5 w-5 text-gold" />
              </div>
              <p className="font-display text-3xl font-bold text-gold">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Invest */}
      <section className="relative overflow-hidden bg-white py-16 md:py-20">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(rgba(202,138,4,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4">
          <SectionHeading
            align="center"
            title="Pourquoi investir au Maroc ?"
            subtitle="Un marché dynamique porté par le tourisme, les infrastructures et une demande soutenue."
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: TrendingUp,
                title: "Croissance constante",
                description:
                  "Le marché immobilier marocain affiche une croissance régulière, avec une demande forte dans les grandes villes.",
              },
              {
                icon: MapPin,
                title: "Emplacement stratégique",
                description:
                  "Le Maroc est un pont entre l'Europe et l'Afrique, avec une position géographique idéale pour le tourisme.",
              },
              {
                icon: Calculator,
                title: "Rendement attractif",
                description:
                  "Les rendements locatifs sont parmi les plus élevés de la région, particulièrement à Marrakech et Agadir.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(202,138,4,0.25)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/15 to-gold-light/5 transition-colors duration-300 group-hover:from-gold/25 group-hover:to-gold-light/10">
                  <item.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Calculator */}
      <section className="relative overflow-hidden bg-ink py-16 text-white md:py-20">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(45deg, rgba(202,138,4,0.05) 1px, transparent 1px)",
            backgroundSize: "80px 80px, 80px 80px, 40px 40px",
          }}
          aria-hidden="true"
        />
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-gold/15 blur-[100px]" aria-hidden="true" />
        <div className="relative container mx-auto px-4">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-light shadow-lg shadow-gold/25">
              <Calculator className="h-8 w-8 text-ink" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                Calculateur de rendement
              </h2>
              <p className="mt-2 max-w-xl text-white/60">
                Estimez le rendement potentiel de votre investissement immobilier au Maroc.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-lg shadow-gold/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/35"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Calculer
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-gold-light/10">
            <TrendingUp className="h-8 w-8 text-gold" />
          </div>
          <h2 className="mb-4 font-display text-3xl font-bold text-gray-900 md:text-4xl">
            Prêt à investir ?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-gray-600">
            Parcourez nos biens d'investissement et trouvez la perle rare.
          </p>
          <Link href="/properties?transactionType=INVESTMENT">
            <Button size="xl" className="bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-lg shadow-gold/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/35">
              Explorer les opportunités
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}