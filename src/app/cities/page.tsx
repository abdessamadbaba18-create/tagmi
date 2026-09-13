"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, MapPin, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

interface City {
  id: string;
  name: string;
  slug: string;
  nameAr: string | null;
  propertyCount: number;
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const res = await fetch("/api/cities");
      const data = await res.json();
      if (data.success) setCities(data.data);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    } finally {
      setLoading(false);
    }
  };

  const cityImages: Record<string, string> = {
    marrakech: "https://images.unsplash.com/photo-1597211833712-5e41faa202ea?w=600&h=400&fit=crop",
    casablanca: "https://images.unsplash.com/photo-1590288867649-37adfb8846c7?w=600&h=400&fit=crop",
    rabat: "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=600&h=400&fit=crop",
    agadir: "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=600&h=400&fit=crop",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        badge="Destinations"
        title="Villes et destinations au Maroc"
        subtitle="Explorez nos propriétés par ville à travers tout le Maroc."
      />

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/city/${city.slug}`}
                className="group relative block overflow-hidden rounded-3xl shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(202,138,4,0.35)]"
              >
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img
                    src={cityImages[city.slug] || cityImages.marrakech}
                    alt={city.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/80" />
                  {/* Gold hover ring accent */}
                  <div className="absolute inset-0 rounded-3xl ring-1 ring-transparent transition-all duration-300 group-hover:ring-gold/40" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-ink/50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-gold-light backdrop-blur-sm">
                      <MapPin className="h-3 w-3" />
                      Ville
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white drop-shadow-sm">
                      {city.name}
                    </h2>
                    {city.nameAr && (
                      <p className="text-sm text-white/80" dir="rtl">
                        {city.nameAr}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1 text-sm text-white/90">
                        <Home className="h-4 w-4 text-gold-light" />
                        <span>
                          {city.propertyCount} propriété
                          {city.propertyCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gold-light transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}