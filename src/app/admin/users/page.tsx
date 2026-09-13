"use client";

import { useEffect, useState } from "react";
import {
  Search,
  UserCheck,
  UserX,
  RefreshCw,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { properties: number };
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  AGENCY_OWNER: "Agence",
  AGENT: "Agent",
  DEVELOPER: "Développeur",
  INVESTOR: "Investisseur",
  PROPERTY_OWNER: "Propriétaire",
  BUYER: "Acheteur",
  RENTER: "Locataire",
  USER: "Utilisateur",
};

const ROLE_VARIANT: Record<string, BadgeVariant> = {
  SUPER_ADMIN: "dark",
  ADMIN: "gold",
  AGENCY_OWNER: "sky",
  AGENT: "green",
  DEVELOPER: "amber",
  INVESTOR: "red",
  PROPERTY_OWNER: "amber",
  BUYER: "stone",
  RENTER: "outline",
  USER: "outline",
};

const initials = (u: AdminUser) => (u.firstName?.[0] || "") + (u.lastName?.[0] || "");

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !isActive }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: !isActive } : u))
        );
      }
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        icon={Users}
        title="Utilisateurs"
        subtitle="Tous les comptes de la plateforme, gérés depuis cette console"
      />

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher un utilisateur par nom ou email..."
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-800 shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <button
          type="button"
          onClick={fetchUsers}
          className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:border-gold/50 hover:text-gold"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Actualiser
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20 text-stone-400">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-xs uppercase tracking-widest">Chargement...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  <th className="px-4 py-3 font-semibold">Utilisateur</th>
                  <th className="px-4 py-3 font-semibold">Rôle</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Contact</th>
                  <th className="hidden px-4 py-3 text-center font-semibold sm:table-cell">Biens</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Inscrit le</th>
                  <th className="px-4 py-3 text-center font-semibold">Statut</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-gold/[0.03]">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold-light/10 font-display text-sm font-bold text-gold ring-1 ring-gold/20">
                          {initials(user) || "?"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-stone-800">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="truncate text-xs text-stone-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={ROLE_VARIANT[user.role] || "outline"}>
                        {ROLE_LABELS[user.role] || user.role}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3.5 text-stone-500 md:table-cell">
                      {user.phone || "—"}
                    </td>
                    <td className="hidden px-4 py-3.5 text-center sm:table-cell">
                      <span className="rounded-lg bg-stone-100 px-2 py-0.5 font-mono text-xs font-semibold text-stone-600">
                        {user._count.properties}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3.5 text-xs text-stone-400 lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={user.isActive ? "green" : "stone"}>
                        {user.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {user.isActive ? (
                        <button
                          type="button"
                          onClick={() => toggleActive(user.id, true)}
                          className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          Désactiver
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleActive(user.id, false)}
                          className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-green-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Activer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-sm text-stone-400">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

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
      </div>

      <p className="flex items-center justify-center gap-1.5 pb-4 text-xs text-gold">
        <Sparkles className="h-3.5 w-3.5" />
        Les rôles contrôlent l&apos;accès aux agences, aux agents et aux annonces.
      </p>
    </div>
  );
}