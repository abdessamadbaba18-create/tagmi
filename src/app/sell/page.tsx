"use client";

import Link from "next/link";
import {
  Camera, FileText, CheckCircle, DollarSign, Users, Shield,
  ArrowRight, Star, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/ui/section-heading";

export default function SellPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <PageHeader
        badge="Vendre sur TAGMI"
        title="Vendez votre bien immobilier sans frais"
        subtitle="Publiez votre annonce gratuitement et atteignez des milliers de vrais acheteurs partout au Maroc."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register">
            <Button size="xl" className="bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-lg shadow-gold/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/35">
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/properties">
            <Button size="xl" variant="outline" className="border-white/25 text-white hover:border-gold/60 hover:bg-white/5 hover:text-gold-light">
              Parcourir les annonces
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <SectionHeading
          align="center"
          title="Comment vendre sur TAGMI ?"
          subtitle="Trois étapes simples pour mettre votre bien en avant et recevoir des demandes qualifiées."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: Camera,
              step: "01",
              title: "Prenez des photos",
              description:
                "Ajoutez des photos de qualité de votre bien. Les annonces avec photos reçoivent 5x plus de vues.",
            },
            {
              icon: FileText,
              step: "02",
              title: "Décrivez votre bien",
              description:
                "Remplissez les détails : surface, nombre de pièces, localisation, équipements.",
            },
            {
              icon: CheckCircle,
              step: "03",
              title: "Publiez et vendez",
              description:
                "Votre annonce sera vérifiée puis publiée. Commencez à recevoir des demandes.",
            },
          ].map((step, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border border-gray-100 shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(202,138,4,0.25)]"
            >
              <span className="absolute right-5 top-4 font-display text-5xl font-bold text-gray-100 transition-colors duration-300 group-hover:text-gold/15">
                {step.step}
              </span>
              <CardContent className="p-6">
                <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/15 to-gold-light/5 transition-all duration-300 group-hover:from-gold/25 group-hover:to-gold-light/10">
                  <step.icon className="h-8 w-8 text-gold" />
                  <span className="absolute inset-0 rounded-2xl bg-gold/0 transition-colors duration-300 group-hover:bg-gold/10" />
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </CardContent>
              {index < 2 && (
                <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 text-gold/50 md:block" />
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Why sell */}
      <section className="relative overflow-hidden bg-white py-16 md:py-20">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(202,138,4,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4">
          <SectionHeading
            align="center"
            title="Pourquoi vendre avec TAGMI ?"
            subtitle="Une plateforme pensée pour les vendeurs du Maroc."
          />
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: DollarSign,
                title: "Totalement gratuit",
                description: "Publication d'annonces 100% gratuite, sans commission cachée.",
              },
              {
                icon: Users,
                title: "Large audience",
                description: "Des milliers d'acheteurs actifs partout au Maroc.",
              },
              {
                icon: Shield,
                title: "Sécurisé & vérifié",
                description: "Système de vérification et de modération des annonces.",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="group rounded-3xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_24px_48px_-16px_rgba(202,138,4,0.25)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold/15 to-gold-light/5 transition-colors duration-300 group-hover:from-gold/25 group-hover:to-gold-light/10">
                  <benefit.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mb-1 font-display text-lg font-bold text-gray-900">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "5x", label: "plus de vues avec photos" },
              { value: "+100k", label: "visiteurs chaque mois" },
              { value: "0 DH", label: "pour publier" },
              { value: "24h", label: "vérification moyenne" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="font-display text-3xl font-bold text-gold">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
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
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/15 blur-[100px]" aria-hidden="true" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-light shadow-lg shadow-gold/25">
            <TrendingUp className="h-8 w-8 text-ink" />
          </div>
          <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">
            Prêt à vendre votre bien&nbsp;?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/60">
            Créez votre compte et publiez votre première annonce en quelques minutes.
          </p>
          <Link href="/register">
            <Button size="xl" className="bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-lg shadow-gold/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/35">
              <Star className="mr-2 h-5 w-5" />
              Créer un compte gratuit
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}