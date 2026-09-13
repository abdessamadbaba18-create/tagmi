"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, PencilLine } from "lucide-react";
import { PropertyForm } from "@/components/forms/property-form";

export default function EditPropertyPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProperty();
  }, [slug]);

  const fetchProperty = async () => {
    try {
      const res = await fetch(`/api/properties/${slug}`);
      const data = await res.json();
      if (data.success) {
        setProperty(data.data);
      } else {
        setError("Propriété non trouvée");
      }
    } catch {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">{error || "Propriété non trouvée"}</p>
      </div>
    );
  }

  const formData = {
    title: property.title,
    description: property.description,
    transactionType: property.transactionType,
    propertyType: property.propertyType,
    price: String(property.price),
    currency: property.currency,
    surfaceArea: property.surfaceArea ? String(property.surfaceArea) : "",
    landArea: property.landArea ? String(property.landArea) : "",
    bedrooms: property.bedrooms ? String(property.bedrooms) : "",
    bathrooms: property.bathrooms ? String(property.bathrooms) : "",
    rooms: property.rooms ? String(property.rooms) : "",
    floor: property.floor ? String(property.floor) : "",
    totalFloors: property.totalFloors ? String(property.totalFloors) : "",
    yearBuilt: property.yearBuilt ? String(property.yearBuilt) : "",
    furnished: property.furnished,
    parking: property.parking,
    garden: property.garden,
    pool: property.pool,
    terrace: property.terrace,
    balcony: property.balcony,
    elevator: property.elevator,
    airConditioning: property.airConditioning,
    heating: property.heating,
    security: property.security,
    address: property.address || "",
    cityId: property.cityId,
    neighborhoodId: property.neighborhoodId || "",
    images: property.images?.map((img: any) => img.url) || [],
    videos: property.videos?.map((vid: any) => vid.url) || [],
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/15 to-gold-light/5 ring-1 ring-gold/20">
          <PencilLine className="h-6 w-6 text-gold" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Espace éditeur
          </p>
          <h2 className="truncate font-display text-2xl font-bold text-ink">
            Modifier : {property.title}
          </h2>
          <p className="text-sm text-stone-500">
            Modifiez les informations puis validez vos changements.
          </p>
        </div>
      </div>

      <PropertyForm mode="edit" initialData={formData} propertySlug={slug} />
    </div>
  );
}