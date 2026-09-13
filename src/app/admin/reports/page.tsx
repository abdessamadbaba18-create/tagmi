"use client";

import { useEffect, useState } from "react";
import {
  Flag,
  CheckCircle,
  XCircle,
  Ban,
  EyeOff,
  RefreshCw,
  Loader2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  property: { title: string; slug: string; status: string } | null;
}

const REASON_LABELS: Record<string, string> = {
  FAKE_LISTING: "Fausse annonce",
  SCAM: "Arnaque",
  MISLEADING_INFO: "Info trompeuse",
  DUPLICATE: "Doublon",
  INAPPROPRIATE: "Contenu inapproprié",
  FRAUD: "Fraude",
  WRONG_INFO: "Info erronée",
  OTHER: "Autre",
};

const REASON_VARIANT: Record<string, BadgeVariant> = {
  FAKE_LISTING: "red",
  SCAM: "red",
  FRAUD: "red",
  DUPLICATE: "amber",
  INAPPROPRIATE: "amber",
  MISLEADING_INFO: "amber",
  WRONG_INFO: "amber",
  OTHER: "stone",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (data.success) setReports(data.data);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const resolveReport = async (reportId: string, action?: string) => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status: "RESOLVED", action }),
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      }
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  const rejectReport = async (reportId: string) => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status: "REJECTED" }),
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      }
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        icon={ShieldAlert}
        title="Signalements"
        subtitle="Modération des annonces signalées par les utilisateurs"
      ></AdminPageHeader>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-20 text-stone-400">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="text-xs uppercase tracking-widest">Chargement...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-stone-300 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
            <CheckCircle className="h-7 w-7" />
          </span>
          <p className="text-sm font-medium text-stone-500">Aucun signalement en attente</p>
          <p className="flex items-center gap-1.5 text-xs text-stone-400">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            La plateforme est en bonne santé
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, i) => (
            <div
              key={report.id}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-fade-up-soft group relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-5 shadow-[0_1px_2px_rgba(12,10,9,0.04)] transition-all duration-300 hover:border-gold/30 hover:shadow-md"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-100/60 blur-[50px]" aria-hidden="true" />
              <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/15 to-red-500/5 ring-1 ring-rose-200">
                      <Flag className="h-4 w-4 text-red-500" />
                    </span>
                    <Badge variant={REASON_VARIANT[report.reason] || "stone"}>
                      {REASON_LABELS[report.reason] || report.reason}
                    </Badge>
                    <span className="text-xs text-stone-400">
                      {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  {report.property && (
                    <p className="mt-3 text-sm font-semibold text-stone-800">
                      Annonce:{" "}
                      <a
                        href={`/property/${report.property.slug}`}
                        className="font-semibold text-gold hover:underline"
                      >
                        {report.property.title}
                      </a>
                      <span className="ml-2 rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-normal uppercase tracking-wide text-stone-500">
                        {report.property.status}
                      </span>
                    </p>
                  )}

                  {report.details && (
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">
                      {report.details}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-stone-400">
                    Signalé par{" "}
                    <span className="font-medium text-stone-500">
                      {report.user.firstName} {report.user.lastName}
                    </span>{" "}
                    ({report.user.email})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {report.property && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn("text-red-600 hover:border-red-300 hover:bg-red-50")}
                        onClick={() => resolveReport(report.id, "HIDE_PROPERTY")}
                      >
                        <Ban className="mr-1.5 h-3.5 w-3.5" />
                        Masquer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 hover:border-orange-300 hover:bg-orange-50"
                        onClick={() => resolveReport(report.id, "UNPUBLISH_PROPERTY")}
                      >
                        <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                        Dé-publier
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-700 hover:border-emerald-300 hover:bg-emerald-50"
                    onClick={() => resolveReport(report.id)}
                  >
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Résoudre
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                    onClick={() => rejectReport(report.id)}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    Rejeter
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <Button variant="outline" onClick={fetchReports} className="gap-2 text-stone-600">
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>
    </div>
  );
}