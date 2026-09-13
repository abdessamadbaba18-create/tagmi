"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Building2,
  Home,
  Users,
  MapPin,
  ArrowLeft,
  Send,
  Mail,
  Phone,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AgencyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchAgency();
  }, [id]);

  const fetchAgency = async () => {
    try {
      const res = await fetch(`/api/agencies/${id}`);
      const data = await res.json();
      if (data.success) setAgency(data.data);
    } catch (error) {
      console.error("Failed to fetch agency:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    setSubmitting(true);
    setSubmitStatus(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyId: agency.id, rating, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitStatus("success");
        setComment("");
        setRating(5);
        fetchAgency();
      } else {
        setSubmitStatus(data.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Review submission failed:", error);
      setSubmitStatus("Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  const contactBtnClass =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-gold/30 px-5 py-2.5 text-sm font-semibold text-gold transition-all duration-300 hover:bg-gradient-to-r hover:from-gold hover:to-gold-light hover:text-ink";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Agence non trouvée</p>
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

        <div className="relative container mx-auto px-4 py-10">
          <Link
            href="/agencies"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-gold-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux agences
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="relative flex-shrink-0">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-gold/30 to-gold-light/10 ring-2 ring-gold/30">
                {agency.logo ? (
                  <img
                    src={agency.logo}
                    alt={agency.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-gold-light" />
                )}
              </div>
              {agency.verified && (
                <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-2xl border-4 border-ink bg-gradient-to-br from-gold to-gold-light">
                  <BadgeCheck className="h-4 w-4 text-ink" />
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-bold md:text-4xl">
                  {agency.name}
                </h1>
                {agency.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-light">
                    <Star className="h-3.5 w-3.5 fill-gold-light" />
                    Vérifiée
                  </span>
                )}
              </div>

              {agency.description && (
                <p className="mt-2 max-w-2xl leading-relaxed text-white/60">
                  {agency.description}
                </p>
              )}

              {agency.address && (
                <div className="mt-2 flex items-center gap-1.5 text-white/60">
                  <MapPin className="h-4 w-4 text-gold-light" />
                  <span>{agency.address}</span>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {[
                  {
                    icon: Star,
                    value: `${(agency.rating ?? 0).toFixed(1)}`,
                    sub: `(${agency.reviewCount} avis)`,
                  },
                  {
                    icon: Home,
                    value: `${agency.properties?.length ?? 0}`,
                    sub: "annonces",
                  },
                  {
                    icon: Users,
                    value: `${agency.agents?.length ?? 0}`,
                    sub: "agents",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5"
                  >
                    <stat.icon className="h-4 w-4 text-gold-light" />
                    <span className="font-semibold">{stat.value}</span>
                    <span className="text-white/50">{stat.sub}</span>
                  </div>
                ))}
              </div>

              {(agency.phone || agency.email) && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {agency.phone && (
                    <a href={`tel:${agency.phone}`} className={contactBtnClass}>
                      <Phone className="h-4 w-4" />
                      Appeler
                    </a>
                  )}
                  {agency.email && (
                    <a href={`mailto:${agency.email}`} className={contactBtnClass}>
                      <Mail className="h-4 w-4" />
                      Email
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative h-1 w-full bg-gradient-to-r from-gold via-gold-light to-transparent" />
      </div>

      {/* Agents */}
      {agency.agents?.length > 0 && (
        <div className="container mx-auto px-4 py-10">
          <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-gray-900">
            <span className="h-[3px] w-8 rounded-full bg-gradient-to-r from-gold to-gold-light" />
            Nos agents
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agency.agents.map((agent: any) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="group flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_24px_48px_-16px_rgba(202,138,4,0.25)]"
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-gold/20 to-gold-light/5">
                  {agent.user.avatar ? (
                    <img
                      src={agent.user.avatar}
                      alt={`${agent.user.firstName} ${agent.user.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-lg font-bold text-gold">
                      {agent.user.firstName[0]}
                      {agent.user.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900 transition-colors group-hover:text-gold">
                    {agent.user.firstName} {agent.user.lastName}
                  </p>
                  {agent.specialization && (
                    <p className="truncate text-sm text-gray-500">{agent.specialization}</p>
                  )}
                  <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <Star className="h-3 w-3 fill-gold text-gold" />
                    {agent.rating?.toFixed(1) ?? "0.0"} ({agent.reviewCount} avis)
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Properties */}
      <div className="container mx-auto px-4 pb-8">
        <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-gray-900">
          <span className="h-[3px] w-8 rounded-full bg-gradient-to-r from-gold to-gold-light" />
          Nos annonces
        </h2>
        {agency.properties?.length === 0 ? (
          <p className="text-gray-500">Aucune annonce actuellement</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agency.properties?.map((property: any) => (
              <Link key={property.id} href={`/property/${property.slug}`}>
                <div className="group cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(202,138,4,0.25)]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    {property.images?.length > 0 ? (
                      <img
                        src={property.images[0].url}
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        Pas d&apos;image
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-gold to-gold-light px-3 py-1 text-xs font-semibold text-ink shadow-md">
                      {property.transactionType === "SALE" ? "Vente" : "Investissement"}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" aria-hidden="true" />
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-display font-bold text-gray-900 transition-colors group-hover:text-gold">
                      {property.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3 text-gold" />
                      {property.neighborhood ? `${property.neighborhood.name}, ` : ""}
                      {property.city.name}
                    </div>
                    <p className="mt-1 font-bold text-gold">
                      {new Intl.NumberFormat("fr-MA", {
                        style: "currency",
                        currency: property.currency || "MAD",
                        maximumFractionDigits: 0,
                      }).format(parseFloat(property.price))}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      {agency.reviews?.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-gray-900">
            <span className="h-[3px] w-8 rounded-full bg-gradient-to-r from-gold to-gold-light" />
            Avis clients
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {agency.reviews.map((review: any) => (
              <div
                key={review.id}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 overflow-hidden rounded-2xl bg-gradient-to-br from-gold/20 to-gold-light/5">
                    {review.user?.avatar ? (
                      <img src={review.user.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-sm font-bold text-gold">
                        {review.user?.firstName?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.user?.firstName} {review.user?.lastName?.[0]}.
                    </p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating ? "fill-gold text-gold" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write a Review */}
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-gray-900">
            <span className="h-[3px] w-8 rounded-full bg-gradient-to-r from-gold to-gold-light" />
            Laissez un avis sur {agency.name}
          </h2>

          <div className="mb-4 flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;
              return (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(value)}
                  aria-label={`Note ${value} étoiles`}
                >
                  <Star
                    className={`h-7 w-7 transition-all duration-200 ${
                      (hoverRating || rating) >= value
                        ? "scale-110 fill-gold text-gold"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              );
            })}
            <span className="ml-2 text-sm text-gray-500">{rating}/5</span>
          </div>

          <textarea
            className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gold focus:ring-2 focus:ring-gold/20"
            rows={3}
            placeholder="Partagez votre expérience avec cette agence..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="mt-4 flex items-center gap-3">
            <Button
              onClick={submitReview}
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-md shadow-gold/25 hover:shadow-lg hover:shadow-gold/35"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Envoi..." : "Publier l'avis"}
            </Button>
            {submitStatus && (
              <span
                className={`text-sm ${
                  submitStatus === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {submitStatus === "success" ? "Avis soumis avec succès !" : submitStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}