"use client";

import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Heart,
  X,
  GitCompareArrows,
  Bookmark,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/provider";
import { cn, formatPrice } from "@/lib/utils";
import { useCompareStore } from "@/lib/stores/compare";
import Link from "next/link";

interface City {
  id: string;
  name: string;
  slug: string;
  propertyCount: number;
}

interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  propertyCount: number;
}

interface Property {
  id: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  propertyType: string;
  transactionType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  surfaceArea: string | null;
  viewCount: number;
  verified: boolean;
  createdAt: string;
  city: { name: string; slug: string };
  neighborhood: { name: string; slug: string } | null;
  images: { url: string; alt: string | null; isPrimary: boolean }[];
}

const PROPERTY_TYPES = [
  "APARTMENT", "VILLA", "HOUSE", "RIAD", "LAND",
  "OFFICE", "SHOP", "COMMERCIAL", "HOTEL", "FARM",
];

const AMENITIES = [
  { key: "furnished", label: "Meublé" },
  { key: "parking", label: "Parking" },
  { key: "pool", label: "Piscine" },
  { key: "garden", label: "Jardin" },
  { key: "terrace", label: "Terrasse" },
  { key: "airConditioning", label: "Climatisation" },
  { key: "heating", label: "Chauffage" },
  { key: "security", label: "Sécurité" },
] as const;

const SORT_OPTIONS = [
  { value: "relevance", label: "Popularité" },
  { value: "newest", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "surface", label: "Surface" },
];

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

export default function PropertiesPage() {
  const { t } = useI18n();
  const { selectedIds, remove, clear } = useCompareStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showFilters, setShowFilters] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

  const [q, setQ] = useState("");
  const [cityId, setCityId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [minSurface, setMinSurface] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sort, setSort] = useState("relevance");
  const [savingSearch, setSavingSearch] = useState(false);
  const [savedSearchStatus, setSavedSearchStatus] = useState("");

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (cityId) {
      fetchNeighborhoods(cityId);
    } else {
      setNeighborhoods([]);
      setNeighborhoodId("");
    }
  }, [cityId]);

  useEffect(() => {
    fetchProperties();
  }, [currentPage, sort]);

  const fetchCities = async () => {
    try {
      const res = await fetch("/api/cities");
      const data = await res.json();
      if (data.success) setCities(data.data);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    }
  };

  const fetchNeighborhoods = async (selectedCityId: string) => {
    try {
      const res = await fetch(`/api/neighborhoods?cityId=${selectedCityId}`);
      const data = await res.json();
      if (data.success) setNeighborhoods(data.data);
    } catch (error) {
      console.error("Failed to fetch neighborhoods:", error);
    }
  };

  const buildQuery = (page = 1) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cityId) params.set("cityId", cityId);
    if (neighborhoodId) params.set("neighborhoodId", neighborhoodId);
    if (propertyType) params.set("propertyType", propertyType);
    if (transactionType) params.set("transactionType", transactionType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (minSurface) params.set("minSurface", minSurface);
    selectedAmenities.forEach((key) => params.set(key, "true"));
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "12");
    return params.toString();
  };

  const fetchProperties = async (page = currentPage) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?${buildQuery(page)}`);
      const data = await response.json();
      if (data.success) {
        setProperties(data.data);
        setTotalResults(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSearch = async () => {
    setSavingSearch(true);
    setSavedSearchStatus("");
    try {
      const query: Record<string, any> = {};
      if (q.trim()) query.q = q.trim();
      if (cityId) query.cityId = cityId;
      if (neighborhoodId) query.neighborhoodId = neighborhoodId;
      if (propertyType) query.propertyType = propertyType;
      if (transactionType) query.transactionType = transactionType;
      if (minPrice) query.minPrice = minPrice;
      if (maxPrice) query.maxPrice = maxPrice;
      if (bedrooms) query.bedrooms = bedrooms;
      if (minSurface) query.minSurface = minSurface;
      selectedAmenities.forEach((key) => (query[key] = true));

      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: q.trim() || `${transactionType || "Toutes"} - ${cityId ? cities.find((c) => c.slug === cityId)?.name || cityId : "Maroc"}`,
          query,
          cityId: cityId || null,
          propertyType: propertyType || null,
          transactionType: transactionType || null,
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
          bedrooms: bedrooms ? parseInt(bedrooms) : null,
          notifyNewMatch: false,
        }),
      });
      if (res.ok) {
        setSavedSearchStatus("done");
        setTimeout(() => setSavedSearchStatus(""), 4000);
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Failed to save search:", error);
    } finally {
      setSavingSearch(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProperties(1);
  };

  const toggleAmenity = (key: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const activeFilterCount =
    (cityId ? 1 : 0) +
    (neighborhoodId ? 1 : 0) +
    (propertyType ? 1 : 0) +
    (transactionType ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (bedrooms ? 1 : 0) +
    (minSurface ? 1 : 0) +
    selectedAmenities.length;

  const resetFilters = () => {
    setQ("");
    setCityId("");
    setNeighborhoodId("");
    setPropertyType("");
    setTransactionType("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setMinSurface("");
    setSelectedAmenities([]);
    setSort("relevance");
    setCurrentPage(1);
    fetchProperties(1);
  };

  const typeLabel = (type: string) => {
    const labels: Record<string, string> = {
      APARTMENT: "Appartement",
      VILLA: "Villa",
      HOUSE: "Maison",
      RIAD: "Riad",
      LAND: "Terrain",
      OFFICE: "Bureau",
      SHOP: "Local commercial",
      COMMERCIAL: "Commerce",
      HOTEL: "Hôtel",
      FARM: "Ferme",
      NEW_DEVELOPMENT: "Nouveau développement",
      OTHER: "Autre",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-ink text-gold">
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

        <div className="relative container mx-auto px-4 py-8">
          <h1 className="mb-5 font-display text-3xl font-bold md:text-4xl">
            {t("nav.properties")}
          </h1>

          {/* Search Bar */}
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder={t("home.search.placeholder")}
                className="border-white/15 bg-white/10 pl-10 text-gold placeholder:text-gold/40 focus-visible:border-gold/60 focus-visible:ring-gold/20"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              className="rounded-xl bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-lg shadow-gold/25 hover:shadow-xl hover:shadow-gold/35"
            >
              {t("common.search")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={
                activeFilterCount > 0
                  ? "border-gold/60 bg-gold/10 text-gold-light"
                  : "border-white/25 text-gold hover:border-gold/60 hover:bg-white/5 hover:text-gold-light"
              }
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtres
              {activeFilterCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-gold to-gold-light text-xs font-bold text-ink">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gold">Filtres avancés</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-gold-light hover:bg-gold/10 hover:text-gold-light"
                >
                  <X className="mr-1 h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Transaction type */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gold/70">
                    Type de transaction
                  </label>
                  <select
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-gold outline-none transition-colors focus:border-gold/60"
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                  >
                    <option value="" className="text-gray-900">Tous</option>
                    <option value="SALE" className="text-gray-900">Vente</option>
                    <option value="INVESTMENT" className="text-gray-900">Investissement</option>
                  </select>
                </div>

                {/* Property type */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gold/70">
                    Type de bien
                  </label>
                  <select
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-gold outline-none transition-colors focus:border-gold/60"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value="" className="text-gray-900">Tous</option>
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type} className="text-gray-900">
                        {typeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gold/70">
                    Ville
                  </label>
                  <select
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-gold outline-none transition-colors focus:border-gold/60"
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                  >
                    <option value="" className="text-gray-900">Toutes</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id} className="text-gray-900">
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Neighborhood */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gold/70">
                    Quartier
                  </label>
                  <select
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-gold outline-none transition-colors focus:border-gold/60 disabled:opacity-50"
                    value={neighborhoodId}
                    onChange={(e) => setNeighborhoodId(e.target.value)}
                    disabled={!cityId}
                  >
                    <option value="" className="text-gray-900">Tous</option>
                    {neighborhoods.map((n) => (
                      <option key={n.id} value={n.id} className="text-gray-900">
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price range */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gold/70">
                    Prix (MAD)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      className="border-white/15 bg-white/10 text-sm text-gold placeholder:text-gold/40"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      className="border-white/15 bg-white/10 text-sm text-gold placeholder:text-gold/40"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gold/70">
                    Chambres
                  </label>
                  <select
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-gold outline-none transition-colors focus:border-gold/60"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                  >
                    <option value="" className="text-gray-900">Toutes</option>
                    {BEDROOM_OPTIONS.map((n) => (
                      <option key={n} value={n} className="text-gray-900">
                        {n}+ chambres
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min surface */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gold/70">
                    Surface minimale (m²)
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 50"
                    className="border-white/15 bg-white/10 text-sm text-gold placeholder:text-gold/40"
                    value={minSurface}
                    onChange={(e) => setMinSurface(e.target.value)}
                  />
                </div>

                {/* Amenities */}
                <div className="lg:col-span-3">
                  <label className="mb-2 block text-sm font-medium text-gold/70">
                    Équipements
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map((amenity) => (
                      <button
                        key={amenity.key}
                        type="button"
                        onClick={() => toggleAmenity(amenity.key)}
                        className={`rounded-full border px-3 py-1 text-sm transition-all ${
                          selectedAmenities.includes(amenity.key)
                            ? "border-gold bg-gradient-to-r from-gold to-gold-light text-ink font-semibold"
                            : "border-white/25 bg-white/5 text-gold/80 hover:border-gold/60 hover:text-gold-light"
                        }`}
                      >
                        {amenity.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={resetFilters} className="border-white/25 text-gold hover:border-gold/60 hover:bg-white/5 hover:text-gold-light">
                  Effacer
                </Button>
                <Button onClick={handleSearch} className="bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-md shadow-gold/25">
                  Appliquer
                </Button>
              </div>
            </div>
          )}

          {/* Results bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gold/60">
              {totalResults} résultat{totalResults !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={saveSearch}
                disabled={savingSearch}
                className={
                  savedSearchStatus === "done"
                    ? "border-green-400/60 bg-green-400/10 text-green-400"
                    : "border-white/25 text-gold hover:border-gold/60 hover:bg-white/5 hover:text-gold-light"
                }
              >
                <Bookmark className="mr-1 h-4 w-4" />
                {savingSearch
                  ? "Enregistrement..."
                  : savedSearchStatus === "done"
                  ? "Recherche sauvegardée"
                  : "Sauvegarder la recherche"}
              </Button>
              <label className="text-sm text-gold/70">Tri :</label>
              <select
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-gold outline-none transition-colors focus:border-gold/60"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="text-gray-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="relative h-1 w-full bg-gradient-to-r from-gold via-gold-light to-transparent" />
      </div>

      {/* Properties Grid */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          </div>
        ) : properties.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500">{t("common.noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property) => (
              <Link key={property.id} href={`/property/${property.slug}`}>
                <Card className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border-0 bg-white shadow-[0_1px_3px_rgba(12,10,9,0.06),0_8px_24px_-12px_rgba(12,10,9,0.12)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_2px_6px_rgba(12,10,9,0.08),0_24px_48px_-16px_rgba(202,138,4,0.25)]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0].url}
                        alt={property.images[0].alt || property.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-sm text-gray-400">{t("property.noImage")}</span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/10" aria-hidden="true" />

                    {/* Zellige-inspired corner lattice */}
                    <div
                      className="absolute left-0 top-0 h-16 w-16 opacity-40 transition-opacity duration-500 group-hover:opacity-70"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, transparent 45%, rgba(234,179,8,0.9) 46%, rgba(234,179,8,0.9) 54%, transparent 55%), linear-gradient(-45deg, transparent 45%, rgba(255,255,255,0.35) 46%, rgba(255,255,255,0.35) 54%, transparent 55%)",
                        backgroundSize: "16px 16px",
                      }}
                      aria-hidden="true"
                    />

                    {/* Badges */}
                    <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                      <span className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-gold to-gold-light px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink shadow-md shadow-gold/30">
                        {property.transactionType === "SALE"
                          ? t("property.transactions.sale")
                          : t("property.transactions.investment")}
                      </span>
                      <span className="rounded-lg border border-white/25 bg-black/20 px-2 py-0.5 text-[11px] font-semibold text-gold backdrop-blur-sm">
                        {typeLabel(property.propertyType)}
                      </span>
                      {property.verified && (
                        <span className="flex items-center gap-1 rounded-lg bg-white/85 px-2 py-0.5 text-[11px] font-semibold text-green-700 backdrop-blur-sm">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          {t("property.badges.verified")}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="absolute right-3 top-3 flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/20 text-gold backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-black/40"
                      >
                        <Heart className="h-[18px] w-[18px] text-gold/90" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          useCompareStore.getState().toggle(property.id);
                        }}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full border border-white/25 backdrop-blur-md transition-all duration-300 hover:scale-110",
                          useCompareStore.getState().isSelected(property.id)
                            ? "bg-gold text-ink shadow-md shadow-gold/40"
                            : "bg-black/20 text-gold hover:bg-black/40"
                        )}
                        title={t("property.compare")}
                      >
                        <GitCompareArrows className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Price chip */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <p className="text-lg font-bold leading-tight text-gold drop-shadow-sm">
                          {formatPrice(parseFloat(property.price), property.currency)}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-gold backdrop-blur-md">
                        {typeLabel(property.propertyType)}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="mb-2 line-clamp-1 text-[15px] font-bold leading-snug text-gray-900 transition-colors duration-300 group-hover:text-gold">
                      {property.title}
                    </h3>

                    <div className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 shrink-0 text-gold/60" />
                      <span className="line-clamp-1">
                        {property.neighborhood
                          ? `${property.neighborhood.name}, `
                          : ""}
                        {property.city.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 border-t border-dashed border-gray-200 pt-3">
                      {property.bedrooms !== null && (
                        <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
                          <Bed className="h-3.5 w-3.5 text-gray-400" />
                          {property.bedrooms}
                        </div>
                      )}
                      {property.bathrooms !== null && (
                        <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
                          <Bath className="h-3.5 w-3.5 text-gray-400" />
                          {property.bathrooms}
                        </div>
                      )}
                      {property.surfaceArea && (
                        <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
                          <Maximize className="h-3.5 w-3.5 text-gray-400" />
                          {property.surfaceArea} m²
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-4"
            >
              Précédent
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
                )
                .reduce<Array<number | "ellipsis">>((acc, p, idx, arr) => {
                  if (idx > 0 && arr[idx - 1] !== p - 1) acc.push("ellipsis");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "ellipsis" ? (
                    <span key={`e${idx}`} className="px-2 text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`h-9 w-9 rounded-xl text-sm font-medium transition-all duration-200 ${
                        p === currentPage
                          ? "bg-gradient-to-r from-gold to-gold-light text-ink shadow-md shadow-gold/25"
                          : "border border-gray-200 bg-white text-gray-700 hover:border-gold/40 hover:text-gold"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4"
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
      {/* Floating Compare Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gold/20 bg-white/95 shadow-[0_-8px_32px_-12px_rgba(202,138,4,0.25)] backdrop-blur-md">
          <div className="container mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold-light/5">
                <GitCompareArrows className="h-5 w-5 text-gold" />
              </span>
              <span className="text-sm font-medium text-gray-700">
                {selectedIds.length} propriété{selectedIds.length > 1 ? "s" : ""} sélectionnée{selectedIds.length > 1 ? "s" : ""}
              </span>
              <div className="flex gap-1">
                {selectedIds.map((id) => {
                  const prop = properties.find((p) => p.id === id);
                  return prop ? (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/5 px-2 py-1 text-xs text-gold"
                    >
                      {prop.title.length > 20
                        ? prop.title.substring(0, 20) + "..."
                        : prop.title}
                      <button
                        onClick={() => remove(id)}
                        className="ml-1 hover:text-gold-light"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clear} className="border-gray-200 text-gray-600 hover:border-gold/40 hover:text-gold">
                Tout effacer
              </Button>
              <Link
                href={`/compare?ids=${selectedIds.join(",")}`}
                className={selectedIds.length >= 2 ? "" : "pointer-events-none opacity-50"}
              >
                <Button size="sm" disabled={selectedIds.length < 2} className="bg-gradient-to-r from-gold to-gold-light font-semibold text-ink shadow-md shadow-gold/25">
                  Comparer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}