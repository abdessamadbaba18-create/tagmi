"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Building2, Award, Home, BadgeCheck, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";

interface Agent {
  id: string;
  bio: string | null;
  specialization: string | null;
  verified: boolean;
  rating: number | null;
  reviewCount: number;
  listingCount: number;
  yearsExperience: number | null;
  user: {
    firstName: string;
    lastName: string;
    avatar: string | null;
    email: string;
  };
  agency: {
    name: string;
    slug: string;
    logo: string | null;
  } | null;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAgents();
  }, [page]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents?page=${page}&limit=12`);
      const data = await res.json();
      if (data.success) {
        setAgents(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <PageHeader
        badge="Agents vérifiés"
        title="Agents immobiliers certifiés"
        subtitle="Trouvez un agent professionnel certifié pour vous accompagner dans votre projet immobilier au Maroc."
      />

      {/* Agents Grid */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          </div>
        ) : agents.length === 0 ? (
          <p className="py-20 text-center text-gray-500">Aucun agent trouvé</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(202,138,4,0.25)]"
              >
                {/* Top accent */}
                <div className="h-1 w-full bg-gradient-to-r from-gold/0 via-gold/40 to-gold/0 transition-all duration-300 group-hover:via-gold" />

                <div className="p-6">
                  <div className="mb-5 flex items-start gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-gold/20 to-gold-light/5">
                      {agent.user.avatar ? (
                        <img
                          src={agent.user.avatar}
                          alt={`${agent.user.firstName} ${agent.user.lastName}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-display text-xl font-bold text-gold">
                          {agent.user.firstName[0]}
                          {agent.user.lastName[0]}
                        </div>
                      )}
                      {agent.verified && (
                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gold">
                          <BadgeCheck className="h-3.5 w-3.5 text-white" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-lg font-bold text-gray-900 transition-colors group-hover:text-gold">
                        {agent.user.firstName} {agent.user.lastName}
                      </h3>
                      {agent.specialization && (
                        <p className="text-sm text-gray-500">{agent.specialization}</p>
                      )}
                      {agent.agency && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{agent.agency.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {agent.bio && (
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">{agent.bio}</p>
                  )}

                  <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      <span className="font-semibold text-gray-900">
                        {(agent.rating ?? 0).toFixed(1)}
                      </span>
                      <span className="text-gray-400">({agent.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Home className="h-4 w-4 text-gold" />
                      <span>{agent.listingCount} annonces</span>
                    </div>
                    {agent.yearsExperience != null && (
                      <div className="flex items-center gap-1 text-gray-400">
                        <Award className="h-4 w-4" />
                        {agent.yearsExperience} ans d&apos;expérience
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2 rounded-xl border border-gold/30 py-2.5 text-sm font-semibold text-gold transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-gold group-hover:to-gold-light group-hover:text-ink">
                    Voir le profil
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="border-gray-200 text-gray-700 hover:border-gold/40 hover:text-gold"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédent
            </Button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ${
                    p === page
                      ? "bg-gradient-to-r from-gold to-gold-light text-ink shadow-md shadow-gold/25"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-gold/40 hover:text-gold"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="border-gray-200 text-gray-700 hover:border-gold/40 hover:text-gold"
            >
              Suivant
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}