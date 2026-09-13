"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface Property {
  id: string;
  title: string;
  slug: string;
  status: string;
  price: string;
  currency: string;
  transactionType: string;
  propertyType: string;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
  city: {
    name: string;
  };
  images: {
    url: string;
  }[];
}

export default function DashboardPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/properties?mine=true&limit=50");
      const data = await res.json();
      if (data.success) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette propriété ?")) return;

    try {
      const res = await fetch(`/api/properties/${slug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProperties(properties.filter((p) => p.slug !== slug));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_REVIEW: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
    SOLD: "bg-red-100 text-red-700",
    RENTED: "bg-gold/10 text-gold",
    ARCHIVED: "bg-gray-100 text-gray-500",
    REJECTED: "bg-red-100 text-red-700",
  };

  const statusLabels: Record<string, string> = {
    DRAFT: "Brouillon",
    PENDING_REVIEW: "En revue",
    PUBLISHED: "Publié",
    SOLD: "Vendu",
    RENTED: "Loué",
    ARCHIVED: "Archivé",
    REJECTED: "Rejeté",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes biens</h1>
          <p className="text-gray-500">Gérez vos annonces immobilières</p>
        </div>
        <Link href="/dashboard/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle annonce
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-gray-500">Vous n&apos;avez pas encore de propriété</p>
            <Link href="/dashboard/properties/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer votre première annonce
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{properties.length} annonces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-gray-500">
                  <tr>
                    <th className="pb-3 pr-4 font-medium">Bien</th>
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium">Prix</th>
                    <th className="pb-3 pr-4 font-medium">Statut</th>
                    <th className="pb-3 pr-4 font-medium">Vues</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property.id} className="border-b last:border-0">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                            {property.images?.[0] ? (
                              <img
                                src={property.images[0].url}
                                alt={property.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                N/A
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {property.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {property.city?.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-sm text-gray-600">
                          {property.transactionType === "SALE" ? "Vente" : "Investissement"}{" "}
                          - {property.propertyType}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-medium">
                          {formatPrice(parseFloat(property.price), property.currency)}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            statusColors[property.status] || "bg-gray-100"
                          }`}
                        >
                          {statusLabels[property.status] || property.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-gray-500">{property.viewCount}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/property/${property.slug}`}
                            target="_blank"
                          >
                            <Button variant="ghost" size="icon" title="Voir">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link
                            href={`/dashboard/properties/${property.slug}/edit`}
                          >
                            <Button variant="ghost" size="icon" title="Modifier">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Supprimer"
                            onClick={() => handleDelete(property.slug)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
