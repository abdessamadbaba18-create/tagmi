"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, ChevronRight, Building2, Home, Landmark, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { PropertyCard } from "@/components/property/property-card";

interface Property {
  id: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  propertyType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  surfaceArea: string | null;
  verified: boolean;
  city: { name: string; slug: string };
  neighborhood: { name: string; slug: string } | null;
  images: { url: string; alt: string | null }[];
}

const CATEGORIES = [
  { type: "APARTMENT", label: "Appartements", desc: "Du studio aux grandes surfaces", icon: Building2 },
  { type: "VILLA", label: "Villas", desc: "Villas modernes et de luxe", icon: Home },
  { type: "RIAD", label: "Riads", desc: "Patrimoine et charme marocain", icon: Landmark },
  { type: "LAND", label: "Terrains", desc: "Opportunités foncières", icon: Banknote },
  { type: "HOUSE", label: "Maisons", desc: "Maisons familiales", icon: Home },
  { type: "OFFICE", label: "Bureaux", desc: "Espaces professionnels", icon: Building2 },
];

export default function BuyPage() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await fetch("/api/search?transactionType=SALE&sort=newest&limit=6");
      const data = await res.json();
      if (data.success) setFeaturedProperties(data.data);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <PageHeader
        badge="Acheter"
        title="Acheter un bien immobilier au Maroc"
        subtitle="Explorez notre sélection de propriétés à vendre à travers le Royaume."
      >
        <div className="mt-8 max-w-2xl">
          <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-md sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Rechercher par ville, quartier..."
                className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  searchQuery &&
                  (window.location.href = `/properties?transactionType=SALE&q=${encodeURIComponent(searchQuery)}`)
                }
              />
            </div>
            <Button
              onClick={() => {
                if (searchQuery) {
                  window.location.href = `/properties?transactionType=SALE&q=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="h-full rounded-xl bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-lg shadow-gold/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/35"
            >
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Button>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-white/40">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold/20">
              <ChevronRight className="h-3 w-3 text-gold-light" />
            </span>
            Plus de 1000 biens vérifiés à vendre au Maroc
          </p>
        </div>
      </PageHeader>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <SectionHeading
          title="Parcourir par type"
          subtitle="Trouvez le bien qui correspond à votre projet."
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.type}
              href={`/properties?transactionType=SALE&propertyType=${cat.type}`}
            >
              <div className="group cursor-pointer rounded-3xl border border-gray-100 bg-white p-5 text-center shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_24px_48px_-16px_rgba(202,138,4,0.3)]">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/15 to-gold-light/5 transition-colors duration-300 group-hover:from-gold/25 group-hover:to-gold-light/10">
                  <cat.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="font-display font-bold text-gray-900 transition-colors group-hover:text-gold">
                  {cat.label}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Properties */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-gray-900">
            <span className="h-[3px] w-8 rounded-full bg-gradient-to-r from-gold to-gold-light" />
            Nouvelles annonces
          </h2>
          <Link
            href="/properties?transactionType=SALE"
            className="flex items-center gap-1.5 text-sm font-semibold text-gold transition-colors hover:text-gold-light"
          >
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                slug={property.slug}
                price={parseFloat(property.price)}
                currency={property.currency}
                propertyType={property.propertyType}
                transactionType="SALE"
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                surfaceArea={property.surfaceArea ? parseFloat(property.surfaceArea) : null}
                city={property.city.name}
                neighborhood={property.neighborhood?.name}
                imageUrl={property.images?.[0]?.url}
                verified={property.verified}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}