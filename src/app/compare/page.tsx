"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Check,
  Calendar,
  Car,
  TreePine,
  Waves,
  Sun,
  Wind,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  transactionType: string;
  propertyType: string;
  price: any;
  currency: string;
  surfaceArea: any;
  landArea: any;
  bedrooms: number | null;
  bathrooms: number | null;
  rooms: number | null;
  floor: number | null;
  totalFloors: number | null;
  yearBuilt: number | null;
  furnished: boolean;
  parking: boolean;
  garden: boolean;
  pool: boolean;
  terrace: boolean;
  balcony: boolean;
  elevator: boolean;
  airConditioning: boolean;
  heating: boolean;
  security: boolean;
  verified: boolean;
  viewCount: number;
  reference: string;
  city: { name: string };
  neighborhood: { name: string } | null;
  images: { url: string; alt: string | null }[];
  agent: { user: { firstName: string; lastName: string } } | null;
}

const AMENITY_ROWS = [
  { key: "furnished", label: "Meublé", icon: Sun },
  { key: "parking", label: "Parking", icon: Car },
  { key: "garden", label: "Jardin", icon: TreePine },
  { key: "pool", label: "Piscine", icon: Waves },
  { key: "terrace", label: "Terrasse", icon: Sun },
  { key: "balcony", label: "Balcon", icon: Sun },
  { key: "elevator", label: "Ascenseur", icon: Sun },
  { key: "airConditioning", label: "Climatisation", icon: Wind },
  { key: "heating", label: "Chauffage", icon: Sun },
  { key: "security", label: "Sécurité", icon: Shield },
] as const;

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids")?.split(",") || [];
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length >= 2) fetchCompare();
  }, []);

  const fetchCompare = async () => {
    try {
      const res = await fetch(`/api/compare?ids=${ids.join(",")}`);
      const data = await res.json();
      if (data.success) setProperties(data.data);
    } catch (error) {
      console.error("Failed:", error);
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

  if (properties.length < 2) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-4 max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-gold-light/5">
            <Maximize className="h-7 w-7 text-gold" />
          </div>
          <p className="mb-4 font-medium text-gray-700">
            Sélectionnez entre 2 et 4 propriétés pour les comparer
          </p>
          <Link href="/properties">
            <Button className="rounded-xl bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-md shadow-gold/25 hover:shadow-lg hover:shadow-gold/35">
              Parcourir les propriétés
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const labelCell =
    "sticky left-0 z-10 bg-gray-50 p-3 text-sm font-medium text-gray-700 sticky-col";

  const checkIcon = (active: boolean) =>
    active ? (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-lg bg-green-50">
        <Check className="h-4 w-4 text-green-600" />
      </span>
    ) : (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-lg bg-gray-50">
        <X className="h-4 w-4 text-gray-300" />
      </span>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
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

        <div className="relative container mx-auto px-4 py-8">
          <Link
            href="/properties"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-gold-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux propriétés
          </Link>
          <h1 className="font-display text-3xl font-bold">
            Comparaison de {properties.length} propriété
            {properties.length > 1 ? "s" : ""}
          </h1>
        </div>
        <div className="relative h-1 w-full bg-gradient-to-r from-gold via-gold-light to-transparent" />
      </div>

      <div className="container mx-auto overflow-x-auto px-4 py-8">
        <table className="w-full min-w-[720px] border-collapse overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
          <thead>
            <tr>
              <th className={labelCell} />
              {properties.map((p, i) => (
                <th
                  key={p.id}
                  className={`min-w-[220px] p-3 ${i < properties.length - 1 ? "border-r border-gray-50" : ""}`}
                >
                  <Link href={`/property/${p.slug}`}>
                    <div className="group overflow-hidden rounded-2xl border border-gray-100 transition-all duration-300 hover:border-gold/40 hover:shadow-[0_16px_32px_-12px_rgba(202,138,4,0.3)]">
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        {p.images?.length > 0 ? (
                          <img
                            src={p.images[0].url}
                            alt={p.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            Pas d&apos;image
                          </div>
                        )}
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-gradient-to-r from-gold to-gold-light px-2.5 py-0.5 text-xs font-semibold text-ink shadow-md">
                          {p.transactionType === "SALE" ? "Vente" : "Investissement"}
                        </span>
                      </div>
                      <div className="p-3">
                        <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 transition-colors group-hover:text-gold">
                          {p.title}
                        </h3>
                        <p className="mt-1 font-display font-bold text-gold">
                          {formatPrice(parseFloat(String(p.price)), p.currency)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { label: "Type", render: (p: Property) => p.propertyType },
              {
                label: "Transaction",
                render: (p: Property) =>
                  p.transactionType === "SALE" ? "Vente" : "Investissement",
              },
              {
                label: "Localisation",
                render: (p: Property) =>
                  `${p.neighborhood ? `${p.neighborhood.name}, ` : ""}${p.city.name}`,
              },
              {
                label: "Surface",
                render: (p: Property) => (p.surfaceArea ? `${p.surfaceArea} m²` : "-"),
              },
              ...(properties.some((p) => p.landArea)
                ? [
                    {
                      label: "Terrain",
                      render: (p: Property) => (p.landArea ? `${p.landArea} m²` : "-"),
                    },
                  ]
                : []),
              {
                label: "Chambres",
                icon: Bed,
                render: (p: Property) => p.bedrooms ?? "-",
              },
              {
                label: "Salles de bain",
                icon: Bath,
                render: (p: Property) => p.bathrooms ?? "-",
              },
              {
                label: "Étage",
                render: (p: Property) =>
                  p.floor != null
                    ? `${p.floor}${p.totalFloors ? `/${p.totalFloors}` : ""}`
                    : "-",
              },
              {
                label: "Construction",
                icon: Calendar,
                render: (p: Property) => p.yearBuilt ?? "-",
              },
              {
                label: "Vérifié",
                render: (p: Property) => checkIcon(p.verified),
              },
            ].map((row, idx) => (
              <tr key={idx}>
                <td className={labelCell}>
                  <div className="flex items-center gap-2">
                    {row.icon && <row.icon className="h-4 w-4 text-gold" />}
                    {row.label}
                  </div>
                </td>
                {properties.map((p, i) => (
                  <td
                    key={p.id}
                    className={`p-3 text-center text-sm text-gray-700 ${i < properties.length - 1 ? "border-r border-gray-50" : ""}`}
                  >
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}

            {/* Amenities header */}
            <tr>
              <td
                colSpan={properties.length + 1}
                className="bg-gradient-to-r from-gold/15 via-gold/5 to-transparent p-3 font-display text-sm font-bold text-gold"
              >
                <div className="flex items-center gap-2">
                  <span className="h-[3px] w-8 rounded-full bg-gradient-to-r from-gold to-gold-light" />
                  Équipements
                </div>
              </td>
            </tr>
            {AMENITY_ROWS.map(({ key, label, icon: Icon }) => (
              <tr key={key}>
                <td className={labelCell}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gold" />
                    {label}
                  </div>
                </td>
                {properties.map((p, i) => (
                  <td
                    key={p.id}
                    className={`p-3 text-center ${i < properties.length - 1 ? "border-r border-gray-50" : ""}`}
                  >
                    {checkIcon((p as any)[key])}
                  </td>
                ))}
              </tr>
            ))}

            {/* Agent */}
            <tr>
              <td className={labelCell}>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gold" />
                  Agent
                </div>
              </td>
              {properties.map((p, i) => (
                <td
                  key={p.id}
                  className={`p-3 text-center text-sm ${i < properties.length - 1 ? "border-r border-gray-50" : ""}`}
                >
                  {p.agent
                    ? `${p.agent.user.firstName} ${p.agent.user.lastName}`
                    : "-"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="container mx-auto px-4 text-center">
        <Link href="/properties">
          <Button
            variant="outline"
            className="rounded-xl border-gold/30 text-gold hover:bg-gold/5"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Parcourir plus de propriétés
          </Button>
        </Link>
      </div>
    </div>
  );
}