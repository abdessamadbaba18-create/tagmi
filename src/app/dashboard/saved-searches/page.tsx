"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, BellOff, Trash2, Home, MapPin, Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SavedSearchItem {
  id: string;
  name: string | null;
  query: any;
  createdAt: string;
  notifyNewMatch: boolean;
  cityId: string | null;
  propertyType: string | null;
  transactionType: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  bedrooms: number | null;
}

export default function SavedSearchesPage() {
  const router = useRouter();
  const [searches, setSearches] = useState<SavedSearchItem[]>([]);
  const [cities, setCities] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchSearches = async () => {
    try {
      const [savedRes, citiesRes] = await Promise.all([
        fetch("/api/saved-searches"),
        fetch("/api/cities"),
      ]);
      const savedData = await savedRes.json();
      const citiesData = await citiesRes.json();
      if (savedData.success) setSearches(savedData.data);
      if (citiesData.success) {
        const map: Record<string, string> = {};
        citiesData.data.forEach((c: any) => {
          map[c.slug] = c.name;
          map[c.id] = c.name;
        });
        setCities(map);
      }
    } catch (error) {
      console.error("Failed to fetch saved searches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearches();
  }, []);

  const deleteSearch = async (id: string) => {
    if (!confirm("Supprimer cette recherche ?")) return;
    await fetch(`/api/saved-searches?id=${id}`, { method: "DELETE" });
    setSearches((prev) => prev.filter((s) => s.id !== id));
  };

  const runSearch = (search: SavedSearchItem) => {
    const params = new URLSearchParams();
    const q = search.query || {};
    const keys = [
      "q",
      "citySlug",
      "transactionType",
      "propertyType",
      "minPrice",
      "maxPrice",
      "bedrooms",
      "minSurface",
      "sort",
    ];
    for (const key of keys) {
      const value = q[key];
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    }
    router.push(`/properties?${params.toString()}`);
  };

  const describeSearch = (search: SavedSearchItem) => {
    const parts: string[] = [];
    if (search.transactionType === "SALE") parts.push("Vente");
    if (search.transactionType === "INVESTMENT") parts.push("Investissement");
    if (search.propertyType) parts.push(search.propertyType);
    if (search.bedrooms) parts.push(`${search.bedrooms} ch`);
    if (search.minPrice || search.maxPrice) {
      parts.push(
        `${search.minPrice ? new Intl.NumberFormat("fr-MA").format(parseFloat(search.minPrice)) : "0"} - ${
          search.maxPrice ? new Intl.NumberFormat("fr-MA").format(parseFloat(search.maxPrice)) : "∞"
        } MAD`
      );
    }
    return parts.length > 0 ? parts.join(" · ") : "Toutes les propriétés";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recherches sauvegardées</h1>
          <p className="text-sm text-gray-500">
            Gérez vos alertes et recherches récurrentes
          </p>
        </div>
        <Link href="/properties">
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Nouvelle recherche
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : searches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">Aucune recherche sauvegardée</p>
            <p className="mt-1 text-sm text-gray-400">
              Sauvegardez vos critères de recherche pour recevoir des alertes
            </p>
            <Link href="/properties">
              <Button className="mt-4">
                <Search className="mr-2 h-4 w-4" />
                Explorer les propriétés
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {searches.map((search) => (
            <Card key={search.id}>
              <CardContent className="p-5">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {search.name || "Recherche sauvegardée"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {describeSearch(search)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteSearch(search.id)}
                    className="text-gray-400 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {search.cityId && cities[search.cityId] && (
                  <div className="mb-3 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {cities[search.cityId]}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    {search.notifyNewMatch ? (
                      <>
                        <Bell className="h-3 w-3 text-green-500" />
                        Alertes activées
                      </>
                    ) : (
                      <>
                        <BellOff className="h-3 w-3" />
                        Alertes désactivées
                      </>
                    )}
                  </span>
                  <Button size="sm" onClick={() => runSearch(search)}>
                    Lancer la recherche
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}