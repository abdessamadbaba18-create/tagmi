"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { Building2, Users, Home, Star, MapPin, BadgeCheck, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";

interface Agency {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  city: string | null;
  verified: boolean;
  rating: number | null;
  reviewCount: number;
  owner: { firstName: string; lastName: string; avatar: string | null };
  _count: { agents: number; properties: number };
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAgencies();
  }, [page]);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agencies?page=${page}&limit=12`);
      const data = await res.json();
      if (data.success) {
        setAgencies(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch agencies:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        badge="Agences partenaires"
        title="Agences immobilières vérifiées"
        subtitle="Découvrez nos agences partenaires vérifiées dans tout le Maroc."
      />

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          </div>
        ) : agencies.length === 0 ? (
          <p className="py-20 text-center text-gray-500">Aucune agence trouvée</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agencies.map((agency) => (
              <Link
                key={agency.id}
                href={`/agencies/${agency.id}`}
                className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(202,138,4,0.25)]"
              >
                <div className="relative h-36 bg-gradient-to-br from-ink via-ink to-gold/60">
                  <div
                    className="absolute inset-0 opacity-60"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(45deg, rgba(202,138,4,0.05) 1px, transparent 1px)",
                      backgroundSize: "80px 80px, 80px 80px, 40px 40px",
                    }}
                    aria-hidden="true"
                  />
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/20 blur-[60px]" aria-hidden="true" />
                  {agency.logo && (
                    <img
                      src={agency.logo}
                      alt={agency.name}
                      className="absolute -bottom-5 left-5 h-16 w-16 rounded-2xl border border-gray-100 bg-white p-1.5 object-contain shadow-lg"
                    />
                  )}
                  {agency.verified && (
                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-gold/30 bg-ink/70 px-2.5 py-1 text-xs font-semibold text-gold-light backdrop-blur-sm">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Vérifiée
                    </div>
                  )}
                </div>
                <div className="p-5 pt-8">
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-gray-900 transition-colors group-hover:text-gold">
                    <Building2 className="h-5 w-5 text-gold" />
                    {agency.name}
                  </h2>
                  {agency.city && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5 text-gold" />
                      {agency.city}
                    </p>
                  )}
                  {agency.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {agency.description}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      <span className="font-semibold text-gray-900">{(agency.rating ?? 0).toFixed(1)}</span>
                      <span className="text-gray-400">({agency.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gold" />
                      <span>{agency._count.agents} agents</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Home className="h-4 w-4 text-gold" />
                      <span>{agency._count.properties} biens</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-gold/30 py-2.5 text-sm font-semibold text-gold transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-gold group-hover:to-gold-light group-hover:text-ink">
                    Découvrir l&apos;agence
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              Page <span className="mx-1 font-display font-bold text-gold">{page}</span>
              sur {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-50"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}