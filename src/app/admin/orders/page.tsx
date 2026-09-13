"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  ReceiptText,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  amount: string;
  currency: string;
  depositAmount: string | null;
  reservationType: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  property: {
    title: string;
    slug: string;
    city: { name: string };
    images: { url: string }[];
  };
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  PROCESSING: "En traitement",
  CONFIRMED: "Confirmée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  PROCESSING: "bg-sky-100 text-sky-600",
  CONFIRMED: "bg-gold/10 text-gold",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const METHOD_LABELS: Record<string, string> = {
  CARD: "Carte bancaire",
  CASH: "Espèces",
  BANK_TRANSFER: "Virement",
  PAYPAL: "PayPal",
  OTHER: "Autre",
};

const NEXT_STATUS: Record<string, { value: string; label: string }> = {
  PAID: { value: "PROCESSING", label: "→ En traitement" },
  PROCESSING: { value: "CONFIRMED", label: "→ Confirmée" },
  CONFIRMED: { value: "COMPLETED", label: "→ Terminée" },
};

function formatMoney(amount: string, currency = "MAD") {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"all" | "active">("all");
  const [activeOrder, setActiveOrder] = useState<AdminOrder | null>(null);
  const [statusAction, setStatusAction] = useState<string>("");

  useEffect(() => {
    fetchOrders();
  }, [page, filter, search, view]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (filter) params.set("status", filter);
      if (search) params.set("search", search);
      if (view === "active") params.set("status", "PAID");
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    setStatusAction(`${orderId}:${status}`);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        fetchOrders();
        if (activeOrder?.id === orderId) {
          setActiveOrder({ ...activeOrder, status });
        }
      }
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setStatusAction("");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        icon={ReceiptText}
        title="Commandes"
        subtitle="Suivi des achats et réservations effectués sur la plateforme"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setView("all");
              setPage(1);
            }}
            className={cn(
              "rounded-xl border px-4 py-2 text-sm font-semibold transition-all",
              view === "all"
                ? "border-gold/60 bg-gold/10 text-gold-light"
                : "border-white/15 bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            Toutes
          </button>
          <button
            type="button"
            onClick={() => {
              setView("active");
              setPage(1);
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-all",
              view === "active"
                ? "bg-gradient-to-r from-gold to-gold-light text-ink shadow-lg shadow-gold/30"
                : "border-white/15 bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            <PackageCheck className="h-4 w-4" />
            Active
          </button>
          <button
            type="button"
            onClick={fetchOrders}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Actualiser les commandes"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </AdminPageHeader>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            placeholder="Rechercher (n° commande, client, bien)..."
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-800 shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 shadow-sm outline-none transition-all focus:border-gold/60 focus:ring-2 focus:ring-gold/20 sm:w-56"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20 text-stone-400">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-xs uppercase tracking-widest">Chargement...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-20 text-stone-400">
            <ReceiptText className="mb-1 h-12 w-12 text-stone-300" />
            <p className="text-sm font-medium text-stone-500">Aucune commande trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Bien
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Paiement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-4">
                        <p className="font-mono text-sm font-semibold text-gold">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-gray-500">{order.customerEmail}</p>
                      </td>
                      <td className="max-w-[220px] px-6 py-4">
                        <div className="flex items-center gap-2">
                          {order.property.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={order.property.images[0].url}
                              alt=""
                              className="h-9 w-9 flex-shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-gray-100" />
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/property/${order.property.slug}`}
                              className="block truncate text-sm font-medium text-gray-900 hover:text-gold"
                            >
                              {order.property.title}
                            </Link>
                            <p className="text-xs text-gray-400">
                              {order.property.city?.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatMoney(order.amount, order.currency)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                          {order.reservationType === "deposit" && " · Acompte"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {NEXT_STATUS[order.status] && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!!statusAction}
                              onClick={() =>
                                updateStatus(order.id, NEXT_STATUS[order.status].value)
                              }
                              className="border-gold/30 text-gold hover:bg-gold/5"
                            >
                              {NEXT_STATUS[order.status].label}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setActiveOrder(order)}
                            className="text-gray-500 hover:text-gold"
                          >
                            Détails
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stone-100 px-4 py-3">
            <p className="text-xs text-stone-400">
              Page {page} sur {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold text-stone-600">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      {/* Detail modal */}
      {activeOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setActiveOrder(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-white bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-ink to-ink/90 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/50">
                    Commande
                  </p>
                  <p className="font-mono text-xl font-bold text-gold-light">
                    {activeOrder.orderNumber}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    STATUS_COLORS[activeOrder.status] || "bg-gray-100"
                  }`}
                >
                  {STATUS_LABELS[activeOrder.status] || activeOrder.status}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Client</p>
                  <p className="font-medium text-gray-900">{activeOrder.customerName}</p>
                  <p className="text-gray-500">{activeOrder.customerEmail}</p>
                  {activeOrder.customerPhone && (
                    <p className="text-gray-500">{activeOrder.customerPhone}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Bien</p>
                  <Link
                    href={`/property/${activeOrder.property.slug}`}
                    className="font-medium text-gold hover:underline"
                  >
                    {activeOrder.property.title}
                  </Link>
                  <p className="text-gray-500">{activeOrder.property.city?.name}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Montant</span>
                  <span className="font-bold text-gray-900">
                    {formatMoney(activeOrder.amount, activeOrder.currency)}
                  </span>
                </div>
                {activeOrder.depositAmount && (
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Acompte payé</span>
                    <span className="font-semibold text-gold">
                      {formatMoney(activeOrder.depositAmount, activeOrder.currency)}
                    </span>
                  </div>
                )}
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Méthode</span>
                  <span className="font-medium text-gray-900">
                    {METHOD_LABELS[activeOrder.paymentMethod] || activeOrder.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {NEXT_STATUS[activeOrder.status] && (
                  <Button
                    size="sm"
                    disabled={!!statusAction}
                    onClick={() =>
                      updateStatus(
                        activeOrder.id,
                        NEXT_STATUS[activeOrder.status].value
                      )
                    }
                    className="bg-gradient-to-r from-gold to-gold-light text-ink"
                  >
                    {NEXT_STATUS[activeOrder.status].label}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setActiveOrder(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}