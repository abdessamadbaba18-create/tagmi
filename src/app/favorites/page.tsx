"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyCard } from "@/components/property/property-card";

interface FavoriteProperty {
  id: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  propertyType: string;
  transactionType: string;
  verified?: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  surfaceArea: string | null;
  city: {
    name: string;
    slug: string;
  };
  neighborhood: {
    name: string;
  } | null;
  images: {
    url: string;
    alt: string | null;
  }[];
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      if (data.success) {
        setFavorites(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (propertyId: string) => {
    try {
      await fetch(`/api/favorites/${propertyId}`, { method: "DELETE" });
      setFavorites(favorites.filter((f) => f.id !== propertyId));
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
          <p className="text-gray-500">
            Retrouvez toutes les propriétés que vous avez sauvegardées
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          </div>
        ) : favorites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="mb-4 text-gray-500">
                Vous n&apos;avez pas encore de favoris
              </p>
              <Link href="/properties">
                <Button>Parcourir les propriétés</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                slug={property.slug}
                price={parseFloat(property.price)}
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
                actionSlot={
                  <button
                    onClick={() => removeFavorite(property.id)}
                    title="Retirer des favoris"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-red-500/80"
                  >
                    <Trash2 className="h-[18px] w-[18px]" />
                  </button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
