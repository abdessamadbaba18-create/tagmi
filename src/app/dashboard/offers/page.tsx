"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HandCoins,
  Loader,
  CheckCircle2,
  XCircle,
  MessageCircle,
  FileQuestion,
  User,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OfferItem {
  id: string;
  amount: string;
  currency: string;
  message: string | null;
  status: string;
  createdAt: string;
  lead: { id: string; name: string; email: string | null; phone: string | null };
  property: {
    id: string;
    title: string;
    slug: string;
    currency: string;
    city: { name: string };
  };
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
  COUNTERED: "Contre-offre",
  WITHDRAWN: "Retirée",
  EXPIRED: "Expirée",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  COUNTERED: "bg-gold/10 text-gold",
  WITHDRAWN: "bg-gray-100 text-gray-600",
  EXPIRED: "bg-gray-100 text-gray-600",
};

export default function DashboardOffersPage() {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      const res = await fetch("/api/offers");
      const data = await res.json();
      if (data.success) setOffers(data.data);
    } catch (error) {
      console.error("Failed to fetch offers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/offers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setOffers((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status } : o))
        );
      }
    } catch (error) {
      console.error("Failed to update offer:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Offres reçues</h1>
        <p className="text-sm text-gray-500">
          Gérez les offres sur vos annonces
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : offers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HandCoins className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">Aucune offre reçue</p>
            <p className="mt-1 text-sm text-gray-400">
              Les offres faites sur vos annonces apparaîtront ici
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {new Intl.NumberFormat("fr-MA", {
                          style: "currency",
                          currency: offer.currency || "MAD",
                          maximumFractionDigits: 0,
                        }).format(parseFloat(offer.amount))}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[offer.status]}`}
                      >
                        {STATUS_LABELS[offer.status] || offer.status}
                      </span>
                    </div>
                    <Link
                      href={`/property/${offer.property.slug}`}
                      className="mt-1 inline-block text-sm font-medium text-gold hover:underline"
                    >
                      {offer.property.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {offer.property.city.name}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(offer.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                    <User className="h-5 w-5 text-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{offer.lead.name}</p>
                    <p className="truncate text-sm text-gray-500">
                      {offer.lead.email}
                      {offer.lead.phone ? ` · ${offer.lead.phone}` : ""}
                    </p>
                  </div>
                  {offer.lead.phone && (
                    <a
                      href={`https://wa.me/${offer.lead.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto shrink-0"
                    >
                      <Button variant="outline" size="sm">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        WhatsApp
                      </Button>
                    </a>
                  )}
                </div>

                {offer.message && (
                  <p className="mt-3 text-sm text-gray-600">{offer.message}</p>
                )}

                {offer.status === "PENDING" && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateStatus(offer.id, "ACCEPTED")}
                      disabled={updatingId === offer.id}
                    >
                      {updatingId === offer.id ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Accepter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => updateStatus(offer.id, "COUNTERED")}
                      disabled={updatingId === offer.id}
                    >
                      <FileQuestion className="mr-2 h-4 w-4" />
                      Contre-offre
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => updateStatus(offer.id, "REJECTED")}
                      disabled={updatingId === offer.id}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Refuser
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}