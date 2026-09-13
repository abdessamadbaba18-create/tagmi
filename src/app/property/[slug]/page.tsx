"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Bed, Bath, Maximize, Calendar, CheckCircle, Phone, MessageCircle,
  Share2, Heart, ChevronLeft, ChevronRight, Building, Home,
  Car, Trees, Waves, Sun, Shield, Flag, X, HandCoins, BadgeCheck, Eye, Clock, ArrowRight, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { cn, formatPrice } from "@/lib/utils";

interface PropertyDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  transactionType: string;
  propertyType: string;
  price: string;
  currency: string;
  surfaceArea: string | null;
  landArea: string | null;
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
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  verified: boolean;
  viewCount: number;
  favoriteCount: number;
  reference: string | null;
  createdAt: string;
  city: {
    name: string;
    slug: string;
  };
  neighborhood: {
    name: string;
    slug: string;
  } | null;
  images: {
    id: string;
    url: string;
    alt: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }[];
  agent: {
    id: string;
    bio: string | null;
    verified: boolean;
    user: {
      firstName: string;
      lastName: string;
      phone: string | null;
      avatar: string | null;
    };
    agency: {
      name: string;
      slug: string;
      logo: string | null;
    } | null;
  } | null;
}

export default function PropertyPage() {
  const { t } = useI18n();
  const params = useParams();
  const slug = params.slug as string;
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerSubmitted, setOfferSubmitted] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProperty();
    }
  }, [slug]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/properties/${slug}`);
      const data = await response.json();
      if (data.success) {
        setProperty(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch property:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async () => {
    if (!reportReason || !property) return;
    setReportSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          reason: reportReason,
          details: reportDetails || undefined,
        }),
      });
      if (res.ok) {
        setReportSubmitted(true);
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors du signalement");
      }
    } catch (error) {
      console.error("Report failed:", error);
    } finally {
      setReportSubmitting(false);
    }
  };

  const submitOffer = async () => {
    if (!property || !offerAmount) return;
    setOfferSubmitting(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          amount: parseFloat(offerAmount),
          message: offerMessage || undefined,
        }),
      });
      if (res.ok) {
        setOfferSubmitted(true);
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'envoi de l'offre");
      }
    } catch (error) {
      console.error("Offer failed:", error);
    } finally {
      setOfferSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-gray-500">Propriété non trouvée</p>
        <Link href="/properties">
          <Button variant="link">Retour aux propriétés</Button>
        </Link>
      </div>
    );
  }

  const transactionLabel =
    property.transactionType === "SALE"
      ? t("property.transactions.sale")
      : property.transactionType === "INVESTMENT"
        ? t("property.transactions.investment")
        : t("property.transactions.sale");

  const features = [
    { icon: Bed, label: "Chambres", value: property.bedrooms },
    { icon: Bath, label: "Salle de bain", value: property.bathrooms },
    { icon: Maximize, label: "Surface", value: property.surfaceArea ? `${property.surfaceArea} m²` : null },
    { icon: Building, label: "Étage", value: property.floor ? `${property.floor}/${property.totalFloors}` : null },
    { icon: Calendar, label: "Année", value: property.yearBuilt },
  ].filter((f) => f.value !== null);

  const amenities = [
    { icon: Car, label: "Parking", available: property.parking },
    { icon: Trees, label: "Jardin", available: property.garden },
    { icon: Waves, label: "Piscine", available: property.pool },
    { icon: Sun, label: "Terrasse", available: property.terrace },
    { icon: Shield, label: "Sécurité", available: property.security },
  ];

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-400">
            <Link href="/" className="transition-colors hover:text-gold">Accueil</Link>
            <span>/</span>
            <Link href="/properties" className="transition-colors hover:text-gold">Propriétés</Link>
            <span>/</span>
            <Link href={`/city/${property.city.slug}`} className="transition-colors hover:text-gold">
              {property.city.name}
            </Link>
            <span>/</span>
            <span className="line-clamp-1 text-gray-700">{property.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
              <div className="relative aspect-[16/9] bg-gray-100">
                {property.images.length > 0 ? (
                  <>
                    <img
                      src={property.images[currentImageIndex].url}
                      alt={property.images[currentImageIndex].alt || property.title}
                      className="h-full w-full object-cover"
                    />
                    {/* Dark gradient overlays for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" aria-hidden="true" />
                    {property.images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentImageIndex(
                              currentImageIndex === 0
                                ? property.images.length - 1
                                : currentImageIndex - 1
                            )
                          }
                          aria-label="Image précédente"
                          className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-black/50"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentImageIndex(
                              currentImageIndex === property.images.length - 1
                                ? 0
                                : currentImageIndex + 1
                            )
                          }
                          aria-label="Image suivante"
                          className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-black/50"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                          {currentImageIndex + 1} / {property.images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-gray-400">Pas d&apos;images</span>
                  </div>
                )}
              </div>

              {property.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3">
                  {property.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300",
                        index === currentImageIndex
                          ? "border-gold shadow-md shadow-gold/20"
                          : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || ""}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="rounded-3xl border border-white bg-white p-6 shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold to-gold-light px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink shadow-md shadow-gold/25">
                  {transactionLabel}
                </span>
                {property.verified && (
                  <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    <BadgeCheck className="h-4 w-4" />
                    {t("property.badges.verified")}
                  </span>
                )}
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                  {property.propertyType.replace(/_/g, " ")}
                </span>
              </div>

              <h1 className="mb-3 font-display text-2xl font-bold text-gray-900 md:text-3xl">
                {property.title}
              </h1>

              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="h-5 w-5 text-gold" />
                <span>
                  {property.neighborhood ? `${property.neighborhood.name}, ` : ""}
                  {property.city.name}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-baseline gap-4 border-t border-dashed border-gray-200 pt-5">
                <p className="font-display text-3xl font-bold text-gold">
                  {formatPrice(parseFloat(property.price), property.currency)}
                </p>
                {property.surfaceArea && (
                  <p className="text-lg text-gray-500">
                    {formatPrice(parseFloat(property.price) / parseFloat(property.surfaceArea), property.currency)}/m²
                  </p>
                )}
              </div>
            </div>

            {/* Key Features */}
            <div className="rounded-3xl border border-white bg-white p-6 shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
              <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-bold text-gray-900">
                <span className="h-[3px] w-8 rounded-full bg-gradient-to-r from-gold to-gold-light" />
                Caractéristiques
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 transition-colors duration-300 hover:bg-gold/5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold/15 to-gold-light/5">
                      <feature.icon className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{feature.label}</p>
                      <p className="font-semibold text-gray-900">{feature.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-3xl border border-white bg-white p-6 shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-gray-900">
                <span className="h-[3px] w-8 rounded-full bg-gradient-to-r from-gold to-gold-light" />
                Description
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-gray-600">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="rounded-3xl border border-white bg-white p-6 shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
              <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-bold text-gray-900">
                <span className="h-[3px] w-8 rounded-full bg-gradient-to-r from-gold to-gold-light" />
                Équipements
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3",
                      amenity.available
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-50 text-gray-300"
                    )}
                  >
                    <amenity.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{amenity.label}</span>
                  </div>
                ))}
                {property.furnished && (
                  <div className="flex items-center gap-3 rounded-2xl bg-green-50 px-4 py-3 text-green-700">
                    <Home className="h-5 w-5" />
                    <span className="text-sm font-medium">Meublé</span>
                  </div>
                )}
                {property.elevator && (
                  <div className="flex items-center gap-3 rounded-2xl bg-green-50 px-4 py-3 text-green-700">
                    <Building className="h-5 w-5" />
                    <span className="text-sm font-medium">Ascenseur</span>
                  </div>
                )}
                {property.airConditioning && (
                  <div className="flex items-center gap-3 rounded-2xl bg-green-50 px-4 py-3 text-green-700">
                    <Sun className="h-5 w-5" />
                    <span className="text-sm font-medium">Climatisation</span>
                  </div>
                )}
                {property.heating && (
                  <div className="flex items-center gap-3 rounded-2xl bg-green-50 px-4 py-3 text-green-700">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm font-medium">Chauffage</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            {property.address && (
              <div className="rounded-3xl border border-white bg-white p-6 shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-gray-900">
                  <span className="h-[3px] w-8 rounded-full bg-gradient-to-r from-gold to-gold-light" />
                  Emplacement
                </h2>
                <div className="mb-4 flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5 text-gold" />
                  <span>{property.address}</span>
                </div>
                <div className="relative h-64 overflow-hidden rounded-2xl bg-ink">
                  <div
                    className="absolute inset-0 opacity-80"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(45deg, rgba(202,138,4,0.05) 1px, transparent 1px)",
                      backgroundSize: "80px 80px, 80px 80px, 40px 40px",
                    }}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
                    <MapPin className="mb-2 h-10 w-10 text-gold/70" />
                    <p className="text-sm">Carte à venir</p>
                  </div>
                </div>
              </div>
            )}

            {/* Similar Properties */}
            <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white">
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(45deg, rgba(202,138,4,0.05) 1px, transparent 1px)",
                  backgroundSize: "80px 80px, 80px 80px, 40px 40px",
                }}
                aria-hidden="true"
              />
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/15 blur-[80px]" aria-hidden="true" />
              <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-display text-lg font-bold">Propriétés similaires</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Découvrez des biens similaires à {property.city.name}
                  </p>
                </div>
                <Link
                  href={`/properties?cityId=${property.city.slug}&transactionType=${property.transactionType}`}
                >
                  <Button className="bg-gradient-to-r from-gold to-gold-light text-ink hover:shadow-lg hover:shadow-gold/25">
                    Explorer les propriétés similaires
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Agent Card */}
            {property.agent && (
              <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="font-display text-lg font-bold text-gray-900">Contact</h2>
                </div>
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-gold-light/10">
                      {property.agent.user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={property.agent.user.avatar}
                          alt={`${property.agent.user.firstName} ${property.agent.user.lastName}`}
                          className="h-10 w-10 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="font-display text-lg font-bold text-gold">
                          {property.agent.user.firstName[0]}
                          {property.agent.user.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {property.agent.user.firstName} {property.agent.user.lastName}
                      </p>
                      {property.agent.verified && (
                        <p className="flex items-center gap-1 text-sm text-green-600">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Agent vérifié
                        </p>
                      )}
                      {property.agent.agency && (
                        <p className="text-xs text-gray-400">{property.agent.agency.name}</p>
                      )}
                    </div>
                  </div>

                  {property.agent.user.phone && (
                    <a
                      href={`tel:${property.agent.user.phone}`}
                      className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-light py-2.5 text-sm font-semibold text-ink shadow-md shadow-gold/20 transition-all hover:shadow-lg hover:shadow-gold/30"
                    >
                      <Phone className="h-4 w-4" /> Appeler
                    </a>
                  )}
                  <a
                    href={`https://wa.me/${property.agent.user.phone?.replace(/^0/, "212")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-gold/30 py-2.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/5"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                  <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:border-gold/40 hover:text-gold">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Envoyer un message
                  </Button>

                  <div className="mt-4 flex gap-2">
                    <Button variant="ghost" size="icon" className="flex-1 rounded-xl border border-gray-100 text-gray-500 hover:border-gold/30 hover:text-gold">
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="flex-1 rounded-xl border border-gray-100 text-gray-500 hover:border-gold/30 hover:text-gold">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Property Stats */}
            <div className="rounded-3xl border border-white bg-white shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
              <div className="divide-y divide-gray-50 p-6 text-sm">
                <div className="flex items-center justify-between py-2.5">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Building className="h-4 w-4 text-gold" /> Référence
                  </span>
                  <span className="font-medium text-gray-900">{property.reference || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Eye className="h-4 w-4 text-gold" /> Vues
                  </span>
                  <span className="font-medium text-gray-900">{property.viewCount}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4 text-gold" /> Ajouté le
                  </span>
                  <span className="font-medium text-gray-900">
                    {new Date(property.createdAt).toLocaleDateString("fr-MA")}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick CTA */}
            <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white">
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(45deg, rgba(202,138,4,0.05) 1px, transparent 1px)",
                  backgroundSize: "80px 80px, 80px 80px, 40px 40px",
                }}
                aria-hidden="true"
              />
              <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-gold/15 blur-[80px]" aria-hidden="true" />
              <div className="relative">
                <p className="mb-4 text-center text-sm text-white/70">
                  Intéressé par cette propriété ?
                </p>
                <Link href={`/checkout?propertyId=${property.id}&slug=${property.slug}`}>
                  <Button className="w-full bg-gradient-to-r from-gold to-gold-light text-ink shadow-lg shadow-gold/25 hover:shadow-xl hover:shadow-gold/35">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Réserver / Acheter
                  </Button>
                </Link>
                <Button className="mt-3 w-full border border-white/25 bg-white/5 py-2.5 text-white shadow-none transition-colors hover:border-gold/60 hover:bg-white/10 hover:text-gold-light">
                  <Phone className="mr-2 h-4 w-4" />
                  Planifier une visite
                </Button>
                <button
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/25 py-2.5 text-sm font-semibold text-white transition-colors hover:border-gold/60 hover:bg-white/5 hover:text-gold-light"
                  onClick={() => {
                    setOfferSubmitted(false);
                    setOfferAmount("");
                    setOfferMessage("");
                    setShowOfferModal(true);
                  }}
                >
                  <HandCoins className="h-4 w-4" />
                  Faire une offre
                </button>
              </div>
            </div>

            {/* Report */}
            <div className="text-center">
              <button
                onClick={() => {
                  setReportSubmitted(false);
                  setReportReason("");
                  setReportDetails("");
                  setShowReportModal(true);
                }}
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-red-600"
              >
                <Flag className="h-4 w-4" />
                Signaler cette annonce
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-ink px-6 py-4">
              <h2 className="font-display text-lg font-bold text-white">
                <span className="mr-2 rounded-lg bg-gradient-to-r from-gold to-gold-light px-2 py-0.5 text-xs font-bold uppercase text-ink">
                  {transactionLabel}
                </span>
                Faire une offre
              </h2>
              <button
                onClick={() => setShowOfferModal(false)}
                className="text-white/60 transition-colors hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {offerSubmitted ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  </div>
                  <p className="font-medium text-gray-900">Offre envoyée !</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Le propriétaire et l&apos;agent seront notifiés de votre offre.
                  </p>
                  <Button
                    className="mt-4 bg-gradient-to-r from-gold to-gold-light text-ink"
                    onClick={() => setShowOfferModal(false)}
                  >
                    Fermer
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Votre offre ({property.currency})
                    </label>
                    <input
                      type="number"
                      min={1}
                      step="any"
                      className={inputClass}
                      placeholder="Montant de votre offre..."
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                      Prix affiché :{" "}
                      {formatPrice(parseFloat(property.price), property.currency)}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Message (optionnel)
                    </label>
                    <textarea
                      className={inputClass}
                      rows={3}
                      placeholder="Conditions, délais, financement..."
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="border-gray-200 text-gray-600 hover:border-gold/40 hover:text-gold"
                      onClick={() => setShowOfferModal(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-gold to-gold-light text-ink"
                      onClick={submitOffer}
                      disabled={!offerAmount || offerSubmitting}
                    >
                      {offerSubmitting ? "Envoi..." : "Envoyer l'offre"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-ink px-6 py-4">
              <h2 className="font-display text-lg font-bold text-white">
                Signaler cette annonce
              </h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-white/60 transition-colors hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {reportSubmitted ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  </div>
                  <p className="font-medium text-gray-900">Merci pour votre signalement</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Notre équipe examinera cette annonce.
                  </p>
                  <Button
                    className="mt-4 bg-gradient-to-r from-gold to-gold-light text-ink"
                    onClick={() => setShowReportModal(false)}
                  >
                    Fermer
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Motif du signalement
                    </label>
                    <select
                      className={inputClass}
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    >
                      <option value="">Sélectionnez un motif</option>
                      <option value="FAKE_LISTING">Fausse annonce</option>
                      <option value="SCAM">Arnaque</option>
                      <option value="MISLEADING_INFO">Informations trompeuses</option>
                      <option value="DUPLICATE">Annonce en double</option>
                      <option value="INAPPROPRIATE">Contenu inapproprié</option>
                      <option value="OTHER">Autre</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Détails (optionnel)
                    </label>
                    <textarea
                      className={inputClass}
                      rows={4}
                      placeholder="Décrivez le problème..."
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="border-gray-200 text-gray-600 hover:border-gold/40 hover:text-gold"
                      onClick={() => setShowReportModal(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      onClick={submitReport}
                      disabled={!reportReason || reportSubmitting}
                    >
                      {reportSubmitting ? "Envoi..." : "Signaler"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}