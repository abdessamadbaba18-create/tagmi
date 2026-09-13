"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ImagePlus,
  Video,
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  Tag,
  FileText,
  Ruler,
  Sparkles,
  Camera,
  MapPin,
  ShieldCheck,
  Home,
  TrendingUp,
  Sofa,
  Car,
  Flower2,
  Waves,
  SunMedium,
  Sunrise,
  ArrowUpDown,
  Snowflake,
  Flame,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stepper } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

interface City {
  id: string;
  name: string;
  slug: string;
}

interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  cityId: string;
}

interface PropertyFormData {
  title: string;
  description: string;
  transactionType: string;
  propertyType: string;
  price: string;
  currency: string;
  surfaceArea: string;
  landArea: string;
  bedrooms: string;
  bathrooms: string;
  rooms: string;
  floor: string;
  totalFloors: string;
  yearBuilt: string;
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
  address: string;
  cityId: string;
  neighborhoodId: string;
  images: string[];
  videos: string[];
}

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>;
  mode: "create" | "edit";
  propertySlug?: string;
}

const STEPS: { id: string; title: string; subtitle: string; icon: LucideIcon }[] = [
  { id: "type", title: "Type & Prix", subtitle: "Nature de l'annonce", icon: Tag },
  { id: "details", title: "Description", subtitle: "Titre & présentation", icon: FileText },
  { id: "features", title: "Caractéristiques", subtitle: "Dimensions & pièces", icon: Ruler },
  { id: "amenities", title: "Équipements", subtitle: "Confort & services", icon: Sparkles },
  { id: "media", title: "Photos & Vidéos", subtitle: "Galerie média", icon: Camera },
  { id: "location", title: "Emplacement", subtitle: "Ville & adresse", icon: MapPin },
  { id: "review", title: "Vérification", subtitle: "Relire & publier", icon: ShieldCheck },
];

const transactionTypes = [
  { value: "SALE", label: "Vente", icon: Home },
  { value: "INVESTMENT", label: "Investissement", icon: TrendingUp },
];

const propertyTypes = [
  { value: "APARTMENT", label: "Appartement" },
  { value: "VILLA", label: "Villa" },
  { value: "HOUSE", label: "Maison" },
  { value: "RIAD", label: "Riad" },
  { value: "LAND", label: "Terrain" },
  { value: "OFFICE", label: "Bureau" },
  { value: "SHOP", label: "Commerce" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "HOTEL", label: "Hôtel" },
  { value: "FARM", label: "Ferme" },
  { value: "NEW_DEVELOPMENT", label: "Programme neuf" },
  { value: "OTHER", label: "Autre" },
];

const amenityIcons: Record<string, { icon: LucideIcon; color: string }> = {
  furnished: { icon: Sofa, color: "bg-amber-50 text-amber-600" },
  parking: { icon: Car, color: "bg-sky-50 text-sky-600" },
  garden: { icon: Flower2, color: "bg-emerald-50 text-emerald-600" },
  pool: { icon: Waves, color: "bg-cyan-50 text-cyan-600" },
  terrace: { icon: SunMedium, color: "bg-orange-50 text-orange-500" },
  balcony: { icon: Sunrise, color: "bg-yellow-50 text-yellow-600" },
  elevator: { icon: ArrowUpDown, color: "bg-violet-50 text-violet-600" },
  airConditioning: { icon: Snowflake, color: "bg-blue-50 text-blue-600" },
  heating: { icon: Flame, color: "bg-red-50 text-red-500" },
  security: { icon: ShieldCheck, color: "bg-stone-100 text-stone-600" },
};

const amenities = [
  { name: "furnished", label: "Meublé" },
  { name: "parking", label: "Parking" },
  { name: "garden", label: "Jardin" },
  { name: "pool", label: "Piscine" },
  { name: "terrace", label: "Terrasse" },
  { name: "balcony", label: "Balcon" },
  { name: "elevator", label: "Ascenseur" },
  { name: "airConditioning", label: "Climatisation" },
  { name: "heating", label: "Chauffage" },
  { name: "security", label: "Sécurité" },
];

export function PropertyForm({ initialData, mode, propertySlug }: PropertyFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const panelRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<PropertyFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    transactionType: initialData?.transactionType || "SALE",
    propertyType: initialData?.propertyType || "APARTMENT",
    price: initialData?.price || "",
    currency: initialData?.currency || "MAD",
    surfaceArea: initialData?.surfaceArea || "",
    landArea: initialData?.landArea || "",
    bedrooms: initialData?.bedrooms || "",
    bathrooms: initialData?.bathrooms || "",
    rooms: initialData?.rooms || "",
    floor: initialData?.floor || "",
    totalFloors: initialData?.totalFloors || "",
    yearBuilt: initialData?.yearBuilt || "",
    furnished: initialData?.furnished || false,
    parking: initialData?.parking || false,
    garden: initialData?.garden || false,
    pool: initialData?.pool || false,
    terrace: initialData?.terrace || false,
    balcony: initialData?.balcony || false,
    elevator: initialData?.elevator || false,
    airConditioning: initialData?.airConditioning || false,
    heating: initialData?.heating || false,
    security: initialData?.security || false,
    address: initialData?.address || "",
    cityId: initialData?.cityId || "",
    neighborhoodId: initialData?.neighborhoodId || "",
    images: initialData?.images || [],
    videos: initialData?.videos || [],
  });

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (form.cityId) {
      fetchNeighborhoods(form.cityId);
    } else {
      setNeighborhoods([]);
    }
  }, [form.cityId]);

  const fetchCities = async () => {
    try {
      const res = await fetch("/api/cities");
      const data = await res.json();
      if (data.success) setCities(data.data);
    } catch (err) {
      console.error("Failed to fetch cities:", err);
    }
  };

  const fetchNeighborhoods = async (cityId: string) => {
    try {
      const res = await fetch(`/api/neighborhoods?cityId=${cityId}`);
      const data = await res.json();
      if (data.success) setNeighborhoods(data.data);
    } catch (err) {
      console.error("Failed to fetch neighborhoods:", err);
    }
  };

  const setField = <K extends keyof PropertyFormData>(name: K, value: PropertyFormData[K]) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const toggleAmenity = (name: keyof PropertyFormData) => {
    setForm((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const validateStep = (i: number): boolean => {
    const errs: Record<string, string> = {};
    if (i === 0) {
      if (!form.price || parseFloat(form.price) <= 0) {
        errs.price = "Le prix est obligatoire et doit être supérieur à zéro.";
      }
    }
    if (i === 1) {
      if (!form.title.trim()) errs.title = "Le titre est obligatoire.";
      else if (form.title.trim().length < 5) errs.title = "Le titre doit contenir au moins 5 caractères.";
      if (!form.description.trim()) errs.description = "La description est obligatoire.";
      else if (form.description.trim().length < 50) errs.description = "La description doit contenir au moins 50 caractères.";
    }
    if (i === 5) {
      if (!form.cityId) errs.cityId = "Veuillez sélectionner une ville.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const scrollToWizard = () => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    setMaxStep((prev) => Math.max(prev, currentStep + 1));
    setCurrentStep((prev) => prev + 1);
    scrollToWizard();
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    scrollToWizard();
  };

  const goToStep = (i: number) => {
    if (i <= maxStep) {
      setCurrentStep(i);
      scrollToWizard();
    }
  };

  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    if (!fileArr.length) return;

    setUploadingMedia(true);
    setUploadError("");
    const formData = new FormData();
    fileArr.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setUploadError(
          res.status === 401
            ? "Session expirée. Veuillez vous reconnecter avant de téléverser des fichiers."
            : data.error || "Échec du téléversement. Réessayez."
        );
        return;
      }
      if (Array.isArray(data.data)) {
        const images: string[] = [];
        const videos: string[] = [];
        data.data.forEach((item: { url: string; type: string }) => {
          if (item.type === "video") videos.push(item.url);
          else images.push(item.url);
        });
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, ...images],
          videos: [...prev.videos, ...videos],
        }));
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError("Le téléversement a échoué. Réessayez.");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < STEPS.length - 1) {
      goNext();
      return;
    }

    for (const i of [0, 1, 5]) {
      if (!validateStep(i)) {
        setMaxStep((prev) => Math.max(prev, i));
        setCurrentStep(i);
        scrollToWizard();
        return;
      }
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        surfaceArea: form.surfaceArea ? parseFloat(form.surfaceArea) : undefined,
        landArea: form.landArea ? parseFloat(form.landArea) : undefined,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
        rooms: form.rooms ? parseInt(form.rooms) : undefined,
        floor: form.floor ? parseInt(form.floor) : undefined,
        totalFloors: form.totalFloors ? parseInt(form.totalFloors) : undefined,
        yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt) : undefined,
        neighborhoodId: form.neighborhoodId || undefined,
        images: form.images.length ? form.images : undefined,
        videos: form.videos.length ? form.videos : undefined,
      };

      const cleaned = Object.fromEntries(
        Object.entries(payload).filter(
          ([, v]) => v !== undefined && v !== null && v !== ""
        )
      );

      const url =
        mode === "edit" ? `/api/properties/${propertySlug}` : "/api/properties";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setError("Session expirée. Veuillez vous reconnecter.");
        } else if (data.details?.fieldErrors) {
          const fieldLabels: Record<string, string> = {
            title: "Titre", description: "Description", price: "Prix",
            cityId: "Ville", neighborhoodId: "Quartier", images: "Photos",
            videos: "Vidéos", surfaceArea: "Surface", landArea: "Terrain",
          };
          const msgs = Object.entries(data.details.fieldErrors)
            .map(([k, v]) => `${fieldLabels[k] || k}: ${(v as string[])[0]}`)
            .join("\n");
          setError(msgs || data.error || "Données invalides");
        } else {
          setError(data.error || "Une erreur est survenue");
        }
        return;
      }

      router.push("/dashboard/properties");
      router.refresh();
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  const formattedPrice = useMemo(() => {
    const n = parseFloat(form.price) || 0;
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: form.currency,
      maximumFractionDigits: 0,
    }).format(n);
  }, [form.price, form.currency]);

  const selectedCityName = cities.find((c) => c.id === form.cityId)?.name || "";
  const selectedNeighborhoodName =
    neighborhoods.find((n) => n.id === form.neighborhoodId)?.name || "";

  const transactionLabel =
    transactionTypes.find((t) => t.value === form.transactionType)?.label ||
    form.transactionType;
  const propertyTypeLabel =
    propertyTypes.find((t) => t.value === form.propertyType)?.label ||
    form.propertyType;
  const selectedAmenities = amenities.filter(
    (a) => form[a.name as keyof PropertyFormData]
  );

  const featureRows: { label: string; value: string }[] = [
    { label: "Surface", value: form.surfaceArea ? `${form.surfaceArea} m²` : "" },
    { label: "Terrain", value: form.landArea ? `${form.landArea} m²` : "" },
    { label: "Chambres", value: form.bedrooms },
    { label: "Salles de bain", value: form.bathrooms },
    { label: "Pièces", value: form.rooms },
    { label: "Étage", value: form.floor },
    { label: "Total étages", value: form.totalFloors },
    { label: "Année", value: form.yearBuilt },
  ].filter((r) => r.value);

  const step = STEPS[currentStep];
  const progress = (currentStep / (STEPS.length - 1)) * 100;

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-5xl">
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">!</span>
          <span className="whitespace-pre-line">{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_1px_2px_rgba(12,10,9,0.04),0_16px_48px_-24px_rgba(12,10,9,0.25)]">
        {/* ---------- Wizard header ---------- */}
        <div className="relative overflow-hidden bg-ink px-6 py-7 sm:px-8" ref={panelRef}>
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(45deg, rgba(202,138,4,0.05) 1px, transparent 1px)",
              backgroundSize: "80px 80px, 80px 80px, 40px 40px",
            }}
            aria-hidden="true"
          />
          <div className="absolute -right-14 -top-14 h-44 w-44 animate-orb-drift rounded-full bg-gold/15 blur-[80px]" aria-hidden="true" />
          <div className="absolute -bottom-20 left-1/3 h-40 w-40 animate-orb-drift-slow rounded-full bg-gold-light/10 blur-[70px]" aria-hidden="true" />

          <div className="relative">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold-light" />
                  {mode === "create" ? "Création d&apos;annonce" : "Modification d&apos;annonce"}
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                  {mode === "create" ? "Nouvelle annonce" : "Modifier l&apos;annonce"}
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  Étape {currentStep + 1} / {STEPS.length} — {step.title}
                </p>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <span className="font-display text-5xl font-bold text-white/10">
                  {String(currentStep + 1).padStart(2, "0")}
                </span>
                <div className="w-px self-stretch bg-white/10" />
                <div className="text-right">
                  <p className="text-xs text-white/40">Complétude</p>
                  <p className="font-display text-xl font-bold text-gold-light">
                    {Math.round(progress)}%
                  </p>
                </div>
              </div>
            </div>

            {/* progress track */}
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="progress-bar-striped h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-500"
                style={{ width: `${Math.max(8, progress)}%` }}
              />
            </div>

            {/* Mobile stepper inside dark header */}
            <div className="mt-6 lg:hidden">
              <Stepper steps={STEPS} currentStep={currentStep} onStepClick={goToStep} />
            </div>
          </div>
        </div>

        {/* ---------- Body ---------- */}
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[280px_1fr] lg:gap-12">
          {/* Desktop rail */}
          <Stepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={goToStep}
            className="hidden lg:block lg:self-start lg:border-r lg:border-stone-100 lg:pr-8 lg:sticky lg:top-8"
          />

          {/* Step panel */}
          <div key={currentStep} className="animate-wizard-step-in min-w-0">
            {/* Step heading */}
            <div className="mb-7 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/15 to-gold-light/5 ring-1 ring-gold/20">
                <step.icon className="h-5 w-5 text-gold" />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-ink">{step.title}</p>
                <p className="text-sm text-stone-400">
                  {step.subtitle}
                  {step.id === "review" && (
                    <Badge variant="gold" className="ml-2">
                      <Check className="h-3 w-3" /> Prêt à publier
                    </Badge>
                  )}
                </p>
              </div>
            </div>

            {/* ===== STEP 0 : TYPE & PRIX ===== */}
            {currentStep === 0 && (
              <div className="space-y-7">
                <Field label="Type de transaction" required>
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1.5">
                    {transactionTypes.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setField("transactionType", t.value)}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                          form.transactionType === t.value
                            ? "bg-white text-ink shadow-sm ring-1 ring-gold/30"
                            : "text-stone-500 hover:text-stone-700"
                        )}
                      >
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field
                  label="Type de bien"
                  hint="Sélectionnez la catégorie du bien"
                >
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {propertyTypes.map((p) => {
                      const selected = form.propertyType === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setField("propertyType", p.value)}
                          className={cn(
                            "group flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-sm font-medium transition-all duration-200",
                            selected
                              ? "border-gold/60 bg-gold/[0.06] text-ink shadow-[0_6px_16px_-8px_rgba(202,138,4,0.5)]"
                              : "border-stone-200 bg-white text-stone-600 hover:border-gold/40 hover:text-ink"
                          )}
                        >
                          <span className="truncate text-left">{p.label}</span>
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                              selected
                                ? "border-gold bg-gradient-to-br from-gold to-gold-light text-white"
                                : "border-stone-300 text-transparent"
                            )}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field
                  label="Prix de vente"
                  required
                  error={errors.price}
                  hint={form.price ? `Soit ${formattedPrice} · ${form.currency}` : undefined}
                >
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-stone-400">
                        {form.currency}
                      </span>
                      <Input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="Ex: 1200000"
                        value={form.price}
                        onChange={(e) => setField("price", e.target.value)}
                        className="h-12 pl-14 text-lg font-semibold"
                      />
                    </div>
                    <div className="w-32">
                      <select
                        value={form.currency}
                        onChange={(e) => setField("currency", e.target.value)}
                        className="h-12 w-full rounded-xl border border-input bg-white px-3 text-sm font-medium shadow-sm focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/30"
                        aria-label="Devise"
                      >
                        <option value="MAD">MAD — Dirham</option>
                        <option value="USD">USD — Dollar</option>
                        <option value="EUR">EUR — Euro</option>
                      </select>
                    </div>
                  </div>
                </Field>
              </div>
            )}

            {/* ===== STEP 1 : DESCRIPTION ===== */}
            {currentStep === 1 && (
              <div className="space-y-7">
                <Field
                  label="Titre de l'annonce"
                  required
                  error={errors.title}
                  hint={`${form.title.length}/120 caractères`}
                >
                  <Input
                    type="text"
                    maxLength={120}
                    placeholder="Ex: Appartement moderne 3 chambres à Gueliz"
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    className="h-12"
                  />
                </Field>

                <Field
                  label="Description"
                  required
                  error={errors.description}
                  hint={`${form.description.length}/2000 caractères — décrivez le bien, son état, son environnement...`}
                >
                  <Textarea
                    rows={8}
                    maxLength={2000}
                    placeholder="Décrivez votre propriété en détail pour attirer les meilleurs acheteurs..."
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    className="min-h-[220px]"
                  />
                </Field>
              </div>
            )}

            {/* ===== STEP 2 : CARACTÉRISTIQUES ===== */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Field label="Surface (m²)" hint="Surface habitable">
                    <Input
                      type="number" min="0"
                      placeholder="120"
                      value={form.surfaceArea}
                      onChange={(e) => setField("surfaceArea", e.target.value)}
                    />
                  </Field>
                  <Field label="Terrain (m²)">
                    <Input
                      type="number" min="0"
                      placeholder="500"
                      value={form.landArea}
                      onChange={(e) => setField("landArea", e.target.value)}
                    />
                  </Field>
                  <Field label="Chambres">
                    <Input
                      type="number" min="0"
                      placeholder="3"
                      value={form.bedrooms}
                      onChange={(e) => setField("bedrooms", e.target.value)}
                    />
                  </Field>
                  <Field label="Salles de bain">
                    <Input
                      type="number" min="0"
                      placeholder="2"
                      value={form.bathrooms}
                      onChange={(e) => setField("bathrooms", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Field label="Pièces">
                    <Input
                      type="number" min="0"
                      placeholder="5"
                      value={form.rooms}
                      onChange={(e) => setField("rooms", e.target.value)}
                    />
                  </Field>
                  <Field label="Étage">
                    <Input
                      type="number" min="0"
                      placeholder="2"
                      value={form.floor}
                      onChange={(e) => setField("floor", e.target.value)}
                    />
                  </Field>
                  <Field label="Total étages">
                    <Input
                      type="number" min="0"
                      placeholder="6"
                      value={form.totalFloors}
                      onChange={(e) => setField("totalFloors", e.target.value)}
                    />
                  </Field>
                  <Field label="Année de construction">
                    <Input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      placeholder="2020"
                      value={form.yearBuilt}
                      onChange={(e) => setField("yearBuilt", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 text-sm text-stone-500">
                  <p className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-gold" />
                    Tous ces champs sont optionnels — renseignez un maximum de détails pour améliorer la visibilité de votre annonce.
                  </p>
                </div>
              </div>
            )}

            {/* ===== STEP 3 : ÉQUIPEMENTS ===== */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {amenities.map((a) => {
                    const meta = amenityIcons[a.name] || { icon: Sparkles, color: "bg-stone-100 text-stone-500" };
                    const active = Boolean(form[a.name as keyof PropertyFormData]);
                    const Icon = meta.icon;
                    return (
                      <button
                        key={a.name}
                        type="button"
                        onClick={() => toggleAmenity(a.name as keyof PropertyFormData)}
                        className={cn(
                          "group flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200",
                          active
                            ? "border-gold/60 bg-gold/[0.06] shadow-[0_6px_16px_-10px_rgba(202,138,4,0.5)]"
                            : "border-stone-200 bg-white hover:border-gold/40"
                        )}
                      >
                        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105", meta.color)}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="flex-1 text-sm font-semibold text-stone-800">
                          {a.label}
                        </span>
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                            active
                              ? "border-gold bg-gradient-to-br from-gold to-gold-light text-white"
                              : "border-stone-300 text-transparent"
                          )}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-stone-400">
                  {selectedAmenities.length > 0
                    ? `${selectedAmenities.length} équipement${selectedAmenities.length > 1 ? "s" : ""} sélectionné${selectedAmenities.length > 1 ? "s" : ""}`
                    : "Aucun équipement sélectionné — vous pourrez en ajouter plus tard."}
                </p>
              </div>
            )}

            {/* ===== STEP 4 : MÉDIAS ===== */}
            {currentStep === 4 && (
              <div className="space-y-7">
                {uploadingMedia && (
                  <div className="flex items-center gap-2 rounded-2xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-gold">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Téléversement en cours...
                  </div>
                )}

                <Field
                  label="Photos du bien"
                  hint="JPG, PNG, WEBP · 10 MB max · La première photo devient l'aperçu"
                >
                  <div
                    className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-gold/30 bg-gold/[0.03] p-10 text-center transition-all hover:border-gold/60 hover:bg-gold/5"
                    onClick={() => imageInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
                    }}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-gold-light/5 transition-transform group-hover:scale-110">
                      <ImagePlus className="h-7 w-7 text-gold" />
                    </div>
                    <p className="text-sm font-semibold text-stone-700">
                      Glissez-déposez vos photos ou{" "}
                      <span className="text-gold underline-offset-2 group-hover:underline">parcourir</span>
                    </p>
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) uploadFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />

                  {uploadError && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {form.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                      {form.images.map((url, index) => (
                        <div
                          key={url}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-stone-200 shadow-sm"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Photo ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          {index === 0 && (
                            <span className="absolute left-1.5 top-1.5 rounded-md bg-gradient-to-r from-gold to-gold-light px-1.5 py-0.5 text-[10px] font-semibold text-ink">
                              Aperçu
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setField("images", form.images.filter((u) => u !== url))}
                            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                            aria-label="Supprimer la photo"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Field>

                <Field
                  label="Vidéos du bien"
                  hint="MP4, WEBM, MOV · 150 MB max"
                >
                  <div
                    className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-gold/25 bg-gold/[0.02] p-8 text-center transition-all hover:border-gold/50 hover:bg-gold/5"
                    onClick={() => videoInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
                    }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-gold-light/5 transition-transform group-hover:scale-110">
                      <Video className="h-6 w-6 text-gold" />
                    </div>
                    <p className="text-sm font-semibold text-stone-700">
                      Glissez-déposez vos vidéos ou{" "}
                      <span className="text-gold underline-offset-2 group-hover:underline">parcourir</span>
                    </p>
                  </div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) uploadFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />

                  {form.videos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {form.videos.map((url) => (
                        <div
                          key={url}
                          className="group flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50/60 p-3"
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold-light/5">
                            <Video className="h-5 w-5 text-gold" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-stone-900">
                              {url.split("/").pop()}
                            </p>
                            <p className="text-xs text-stone-400">Vidéo</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setField("videos", form.videos.filter((u) => u !== url))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:text-red-500"
                            aria-label="Supprimer la vidéo"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Field>
              </div>
            )}

            {/* ===== STEP 5 : EMPLACEMENT ===== */}
            {currentStep === 5 && (
              <div className="space-y-7">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Ville" required error={errors.cityId}>
                    <Select
                      value={form.cityId}
                      onValueChange={(v) => {
                        setField("cityId", v);
                        setField("neighborhoodId", "");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une ville" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Quartier">
                    <Select
                      value={form.neighborhoodId || undefined}
                      onValueChange={(v) => setField("neighborhoodId", v)}
                      disabled={!form.cityId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={form.cityId ? "Sélectionner un quartier" : "Choisissez d'abord une ville"} />
                      </SelectTrigger>
                      <SelectContent>
                        {neighborhoods.map((n) => (
                          <SelectItem key={n.id} value={n.id}>
                            {n.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field
                  label="Adresse"
                  hint="Ex: Avenue Mohammed V, Gueliz"
                >
                  <Input
                    type="text"
                    placeholder="Adresse complète du bien"
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    className="h-12"
                  />
                </Field>
              </div>
            )}

            {/* ===== STEP 6 : RÉCAPITULATIF ===== */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-stone-200 p-4">
                    <ReviewHeader icon={Tag} label="Annonce" />
                    <div className="mt-2 space-y-1.5">
                      <p className="text-sm font-semibold text-stone-800">{form.title || "—"}</p>
                      <p className="text-xs text-stone-500">
                        {transactionLabel} · {propertyTypeLabel}
                      </p>
                      <p className="font-display text-xl font-bold text-gold">{formattedPrice}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 p-4">
                    <ReviewHeader icon={MapPin} label="Emplacement" />
                    <div className="mt-2 space-y-1.5">
                      <p className="text-sm font-semibold text-stone-800">
                        {selectedCityName || "—"}
                        {selectedNeighborhoodName && ` · ${selectedNeighborhoodName}`}
                      </p>
                      <p className="text-xs text-stone-500">{form.address || "Pas d'adresse fournie"}</p>
                    </div>
                  </div>
                </div>

                {featureRows.length > 0 && (
                  <div className="rounded-2xl border border-stone-200 p-4">
                    <ReviewHeader icon={Ruler} label="Caractéristiques" />
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {featureRows.map((f) => (
                        <div key={f.label} className="rounded-xl bg-stone-50 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-wider text-stone-400">{f.label}</p>
                          <p className="text-sm font-semibold text-stone-800">{f.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAmenities.length > 0 && (
                  <div className="rounded-2xl border border-stone-200 p-4">
                    <ReviewHeader icon={Sparkles} label="Équipements" />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedAmenities.map((a) => (
                        <span
                          key={a.name}
                          className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/[0.07] px-3 py-1 text-xs font-medium text-gold"
                        >
                          <Check className="h-3 w-3" />
                          {a.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-stone-200 p-4">
                    <ReviewHeader icon={Camera} label="Médias" />
                    <div className="mt-3 flex items-center gap-2">
                      {form.images.slice(0, 4).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={url}
                          src={url}
                          alt={`Photo ${i + 1}`}
                          className="h-12 w-12 rounded-lg object-cover ring-1 ring-stone-200"
                        />
                      ))}
                      {form.images.length === 0 && (
                        <p className="text-sm text-stone-400">Aucune photo</p>
                      )}
                      {form.images.length > 4 && (
                        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100 text-xs font-semibold text-stone-500">
                          +{form.images.length - 4}
                        </span>
                      )}
                      {form.videos.length > 0 && (
                        <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-stone-500">
                          <Video className="h-4 w-4 text-gold" />
                          {form.videos.length} vidéo{form.videos.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="card-shine flex flex-col justify-between rounded-2xl bg-ink p-4 text-white">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                        Prêt à {mode === "create" ? "publier" : "modifier"}
                      </p>
                      <p className="mt-1 text-sm text-white/70">
                        Vérifiez vos informations puis lancez la soumission. Vous pourrez modifier l&apos;annonce à tout moment.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                      <ShieldCheck className="h-4 w-4 text-gold-light" />
                      Sauvegardée en toute sécurité
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------- Navigation ---------- */}
            <div className="mt-10 flex flex-col-reverse gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={goBack}
                disabled={currentStep === 0}
                className="border-stone-200 bg-white hover:bg-stone-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={goNext}
                  className="group bg-gradient-to-r from-gold to-gold-light text-white shadow-lg shadow-gold/20 hover:shadow-gold/30 hover:brightness-105"
                >
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="bg-gradient-to-r from-gold to-gold-light text-white shadow-lg shadow-gold/20 hover:shadow-gold/30 hover:brightness-105"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting
                    ? "Publication..."
                    : mode === "create"
                      ? "Créer l'annonce"
                      : "Enregistrer les modifications"}
                </Button>
              )}
            </div>

            {/* progress hint */}
            <p className="mt-4 text-center text-xs text-stone-400">
              Étape {currentStep + 1} sur {STEPS.length}
              {currentStep < STEPS.length - 1 && ` — prochaine étape : ${STEPS[currentStep + 1].title}`}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

function ReviewHeader({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-400">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10 text-gold">
        <Icon className="h-3.5 w-3.5" />
      </span>
      {label}
    </p>
  );
}