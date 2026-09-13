"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Wallet,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";

interface CheckoutProperty {
  id: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  city: { name: string };
  neighborhood?: { name: string } | null;
  images: { url: string; isPrimary: boolean }[];
}

function formatPrice(value: string, currency: string = "MAD") {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(parseFloat(value));
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId") || "";
  const slug = searchParams.get("slug") || "";

  const [property, setProperty] = useState<CheckoutProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "BANK_TRANSFER" | "CASH">("CARD");
  const [reservationType, setReservationType] = useState<"buy" | "deposit">("buy");

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      return;
    }
    fetchProperty();
  }, [propertyId, slug]);

  const fetchProperty = async () => {
    try {
      const identifier = slug || propertyId;
      const res = await fetch(`/api/properties/${identifier}`);
      const data = await res.json();
      if (data.success) {
        const p = data.data;
        setProperty({
          id: p.id,
          title: p.title,
          slug: p.slug,
          price: p.price,
          currency: p.currency || "MAD",
          city: p.city,
          neighborhood: p.neighborhood,
          images: p.images || [],
        });
      } else {
        setError("Propriété non trouvée");
      }
    } catch {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (paymentMethod === "CARD") {
      if (form.cardNumber.replace(/\s/g, "").length < 12) {
        setError("Numéro de carte invalide");
        setSubmitting(false);
        return;
      }
      if (!form.cardExpiry) {
        setError("Date d'expiration requise");
        setSubmitting(false);
        return;
      }
      if (form.cardCvv.length < 3) {
        setError("CVV invalide");
        setSubmitting(false);
        return;
      }
    }

    const deposit = reservationType === "deposit";
    const amount = property ? parseFloat(property.price) : 0;
    const depositAmount = deposit ? Math.round(amount * 0.1) : null;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          reservationType,
          paymentMethod,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          amount,
          depositAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }
      setSuccess(data.data);
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          badge="Paiement réussi"
          title="Merci pour votre confiance"
          subtitle="Votre commande a été enregistrée. Notre équipe vous contactera rapidement."
        />
        <div className="container mx-auto max-w-xl px-4 pb-20">
          <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
            <div className="border-b border-gray-100 bg-gradient-to-r from-gold/10 to-gold-light/5 p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light">
                <CheckCircle2 className="h-8 w-8 text-ink" />
              </div>
              <h2 className="font-display text-2xl font-bold text-gray-900">
                Commande confirmée
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Référence de commande
              </p>
              <span className="mt-3 inline-block rounded-xl border border-gold/30 bg-gold/5 px-4 py-2 font-display text-lg font-bold tracking-wide text-gold">
                {success.orderNumber}
              </span>
            </div>
            <div className="space-y-3 p-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Bien</span>
                <span className="font-medium text-gray-900">{property?.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Montant</span>
                <span className="font-bold text-gold">
                  {formatPrice(String(success.amount), success.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Client</span>
                <span className="font-medium text-gray-900">{success.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Statut</span>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Payé
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100 p-6">
              <Link href={property?.slug ? `/property/${property.slug}` : "/buy"}>
                <Button className="w-full bg-gradient-to-r from-gold to-gold-light text-ink shadow-md shadow-gold/20">
                  Retourner à la propriété
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 text-center">
        <p className="text-gray-500">
          {error || "Aucune propriété sélectionnée pour le paiement"}
        </p>
        <Link href="/buy">
          <Button variant="outline" className="mt-4 border-gold/30 text-gold hover:bg-gold/5">
            Parcourir les biens
          </Button>
        </Link>
      </div>
    );
  }

  const total = parseFloat(property.price);
  const isDeposit = reservationType === "deposit";
  const due = isDeposit ? Math.round(total * 0.1) : total;

  const formatCardNumber = (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        badge="Paiement sécurisé"
        title="Finaliser l'achat"
        subtitle="Réglez votre bien en toute sécurité via notre plateforme de paiement."
      />

      <div className="container mx-auto max-w-5xl px-4 pb-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Property summary */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  {property.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={property.images[0].url}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      Aucune image
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-gold to-gold-light px-3 py-1 text-xs font-semibold text-ink shadow-md">
                    Achat
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500">
                    {property.neighborhood?.name
                      ? `${property.neighborhood.name}, ${property.city.name}`
                      : property.city.name}
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold text-gray-900">
                    {property.title}
                  </h2>
                  <p className="mt-2 font-display text-2xl font-bold text-gold">
                    {formatPrice(property.price, property.currency)}
                  </p>

                  <div className="mt-5 space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Options</span>
                      <span className="font-medium text-gray-900">
                        {reservationType === "deposit" ? "Acompte (10%)" : "Achat complet"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                      <span className="text-gray-500">Total à payer</span>
                      <span className="font-bold text-gold">
                        {formatPrice(String(due), property.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm text-gray-600">
                <ShieldCheck className="h-8 w-8 flex-shrink-0 text-gold" />
                <p>
                  Paiement 100% sécurisé et chiffré. Vous recevrez un reçu
                  officiel avec un numéro de commande unique.
                </p>
              </div>
            </div>
          </div>

          {/* Payment form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3">
            <div className="space-y-6">
              {/* Reservation type */}
              <div className="rounded-3xl border border-white bg-white p-6 shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
                <h3 className="mb-4 font-display text-lg font-bold text-gray-900">
                  1. Type de réservation
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReservationType("buy")}
                    className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                      reservationType === "buy"
                        ? "border-gold bg-gold/5 ring-1 ring-gold"
                        : "border-gray-200 hover:border-gold/40"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">Achat complet</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatPrice(property.price, property.currency)}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReservationType("deposit")}
                    className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                      reservationType === "deposit"
                        ? "border-gold bg-gold/5 ring-1 ring-gold"
                        : "border-gray-200 hover:border-gold/40"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">Acompte</p>
                    <p className="mt-1 text-xs text-gray-500">
                      10% ({formatPrice(String(Math.round(total * 0.1)), property.currency)})
                    </p>
                  </button>
                </div>
              </div>

              {/* Customer info */}
              <div className="rounded-3xl border border-white bg-white p-6 shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
                <h3 className="mb-4 font-display text-lg font-bold text-gray-900">
                  2. Informations client
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Nom complet *
                    </label>
                    <Input
                      name="customerName"
                      value={form.customerName}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Youssef Amrani"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <Input
                        name="customerEmail"
                        type="email"
                        value={form.customerEmail}
                        onChange={handleChange}
                        required
                        placeholder="vous@email.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Téléphone *
                      </label>
                      <Input
                        name="customerPhone"
                        type="tel"
                        value={form.customerPhone}
                        onChange={handleChange}
                        required
                        placeholder="+212 6 00 00 00 00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="rounded-3xl border border-white bg-white p-6 shadow-[0_1px_3px_rgba(12,10,9,0.06),0_12px_32px_-12px_rgba(12,10,9,0.15)]">
                <h3 className="mb-4 font-display text-lg font-bold text-gray-900">
                  3. Moyen de paiement
                </h3>
                <div className="mb-5 grid grid-cols-3 gap-3">
                  {[
                    { value: "CARD", label: "Carte bancaire", icon: CreditCard },
                    { value: "BANK_TRANSFER", label: "Virement", icon: Banknote },
                    { value: "CASH", label: "Espèces", icon: Wallet },
                  ].map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setPaymentMethod(m.value as any)}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all duration-200 ${
                        paymentMethod === m.value
                          ? "border-gold bg-gold/5 ring-1 ring-gold"
                          : "border-gray-200 hover:border-gold/40"
                      }`}
                    >
                      <m.icon
                        className={`h-5 w-5 ${
                          paymentMethod === m.value ? "text-gold" : "text-gray-400"
                        }`}
                      />
                      <span className="text-xs font-medium text-gray-700">
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>

                {paymentMethod === "CARD" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Numéro de carte *
                      </label>
                      <div className="relative">
                        <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gold" />
                        <Input
                          name="cardNumber"
                          value={form.cardNumber}
                          onChange={(e) => {
                            setForm((prev) => ({
                              ...prev,
                              cardNumber: formatCardNumber(e.target.value),
                            }));
                          }}
                          required
                          className="pl-11"
                          placeholder="4242 4242 4242 4242"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Titulaire de la carte *
                      </label>
                      <Input
                        name="cardName"
                        value={form.cardName}
                        onChange={handleChange}
                        required
                        placeholder="Ex: YOUSSEF AMRANI"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Expiration *
                        </label>
                        <Input
                          name="cardExpiry"
                          value={form.cardExpiry}
                          onChange={(e) => {
                            setForm((prev) => ({
                              ...prev,
                              cardExpiry: formatExpiry(e.target.value),
                            }));
                          }}
                          required
                          placeholder="MM/AA"
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          CVV *
                        </label>
                        <Input
                          name="cardCvv"
                          type="password"
                          value={form.cardCvv}
                          onChange={(e) => {
                            setForm((prev) => ({
                              ...prev,
                              cardCvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                            }));
                          }}
                          required
                          placeholder="•••"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Lock className="h-3.5 w-3.5" />
                      Vos informations bancaires sont chiffrées et jamais stockées.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                    {paymentMethod === "BANK_TRANSFER" ? (
                      <Banknote className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                    ) : (
                      <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                    )}
                    <p>
                      {paymentMethod === "BANK_TRANSFER"
                        ? "Vous recevrez nos coordonnées bancaires par email après confirmation de votre commande. Le bien sera réservé sous 48h."
                        : "Notre équipe vous contactera pour organiser le paiement en espèces. Le bien sera réservé dès réception de l'acompte."}
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                size="xl"
                className="w-full bg-gradient-to-r from-gold to-gold-light text-ink shadow-lg shadow-gold/25 hover:shadow-xl hover:shadow-gold/35"
              >
                {submitting ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Payer {formatPrice(String(due), property.currency)}
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-gray-400">
                En continuant, vous acceptez les conditions générales de TAGMI.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}