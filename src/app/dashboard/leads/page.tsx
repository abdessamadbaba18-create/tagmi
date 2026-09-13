"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  status: string;
  source: string;
  score: number;
  createdAt: string;
  property: {
    title: string;
    slug: string;
    price: any;
  } | null;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gold/10 text-gold",
  CONTACTED: "bg-yellow-100 text-yellow-700",
  QUALIFIED: "bg-green-100 text-green-700",
  MEETING_SCHEDULED: "bg-gold/10 text-gold",
  NEGOTIATION: "bg-orange-100 text-orange-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nouveau",
  CONTACTED: "Contacté",
  QUALIFIED: "Qualifié",
  MEETING_SCHEDULED: "RDV planifié",
  NEGOTIATION: "En négociation",
  WON: "Gagné",
  LOST: "Perdu",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/dashboard/leads");
      const data = await res.json();
      if (data.success) setLeads(data.data);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (leadId: string, status: string) => {
    try {
      const res = await fetch("/api/dashboard/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status } : l))
        );
      }
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  const filteredLeads =
    filter === "ALL" ? leads : leads.filter((l) => l.status === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
        <p className="text-gray-500">Gérez vos contacts et suivez leur progression</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", count: leads.length, status: "ALL" },
          {
            label: "Nouveaux",
            count: leads.filter((l) => l.status === "NEW").length,
            status: "NEW",
          },
          {
            label: "En cours",
            count: leads.filter((l) =>
              ["CONTACTED", "QUALIFIED", "MEETING_SCHEDULED", "NEGOTIATION"].includes(l.status)
            ).length,
            status: "CONTACTED",
          },
          {
            label: "Gagnés",
            count: leads.filter((l) => l.status === "WON").length,
            status: "WON",
          },
        ].map((stat) => (
          <button
            key={stat.status}
            onClick={() => setFilter(stat.status)}
            className={`rounded-lg border p-4 text-left transition-colors ${
              filter === stat.status ? "border-gold bg-gold/5" : "bg-white hover:bg-gray-50"
            }`}
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.count}</p>
          </button>
        ))}
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">Aucun prospect trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {STATUS_LABELS[lead.status] || lead.status}
                      </span>
                      {lead.score >= 80 && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Score: {lead.score}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {lead.message}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      {lead.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {lead.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                      {lead.property && (
                        <span className="text-gold">
                          {lead.property.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {lead.status === "NEW" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(lead.id, "CONTACTED")}
                      >
                        <MessageCircle className="mr-1 h-3 w-3" />
                        Contacter
                      </Button>
                    )}
                    {lead.status !== "WON" && lead.status !== "LOST" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600"
                          onClick={() => updateStatus(lead.id, "WON")}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => updateStatus(lead.id, "LOST")}
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}