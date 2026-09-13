"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { PropertyCard } from "@/components/property/property-card";

export default function CityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [city, setCity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCity();
  }, [slug]);

  const fetchCity = async () => {
    try {
      const res = await fetch(`/api/cities/${slug}`);
      const data = await res.json();
      if (data.success) setCity(data.data);
    } catch (error) {
      console.error("Failed to fetch city:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!city) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Ville non trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-ink text-white">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(45deg, rgba(202,138,4,0.05) 1px, transparent 1px)",
            backgroundSize: "80px 80px, 80px 80px, 40px 40px",
          }}
          aria-hidden="true"
        />
        <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-gold/20 blur-[100px]" aria-hidden="true" />

        <div className="relative container mx-auto px-4 py-12">
          <Link
            href="/cities"
            className="mb-5 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-gold-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux villes
          </Link>
          <h1 className="font-display text-4xl font-bold md:text-5xl">{city.name}</h1>
          <p className="mt-3 text-white/60">
            {city._count.properties} propriété
            {city._count.properties !== 1 ? "s" : ""} à {city.name}
          </p>
        </div>
        <div className="relative h-1 w-full bg-gradient-to-r from-gold via-gold-light to-transparent" />
      </div>

      {/* Neighborhoods */}
      {city.neighborhoods?.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-gray-900">
            <span className="h-[3px] w-8 rounded-full bg-gradient-to-r from-gold to-gold-light" />
            Quartiers populaires
          </h2>
          <div className="flex flex-wrap gap-3">
            {city.neighborhoods.map((n: any) => (
              <Link
                key={n.id}
                href={`/properties?neighborhoodId=${n.id}`}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:border-gold/50 hover:bg-gold/5 hover:text-gold"
              >
                <MapPin className="h-3 w-3" />
                {n.name}
                <span className="text-gray-400">({n._count.properties})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Properties */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-gray-900">
          <span className="h-[3px] w-8 rounded-full bg-gradient-to-r from-gold to-gold-light" />
          Propriétés à {city.name}
        </h2>
        {city.properties?.length === 0 ? (
          <p className="text-gray-500">Aucune propriété disponible actuellement</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {city.properties?.map((property: any) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                slug={property.slug}
                price={parseFloat(String(property.price))}
                currency={property.currency}
                propertyType={property.propertyType}
                transactionType={property.transactionType}
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
      </div>
    </div>
  );
}