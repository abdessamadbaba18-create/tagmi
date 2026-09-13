"use client";

import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Maximize, MapPin, Heart, BadgeCheck, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatPrice } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";
import type { ReactNode } from "react";
import { useState } from "react";

interface PropertyCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  propertyType: string;
  transactionType: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  surfaceArea?: number | null;
  city: string;
  neighborhood?: string | null;
  imageUrl?: string;
  verified?: boolean;
  isNew?: boolean;
  actionSlot?: ReactNode;
}

export function PropertyCard({
  id,
  title,
  slug,
  price,
  currency,
  propertyType,
  transactionType,
  bedrooms,
  bathrooms,
  surfaceArea,
  city,
  neighborhood,
  imageUrl,
  verified,
  isNew,
  actionSlot,
}: PropertyCardProps) {
  const { t, dir } = useI18n();
  const [isFavorite, setIsFavorite] = useState(false);

const transactionLabel =
  transactionType === "SALE"
    ? t("property.transactions.sale")
    : transactionType === "RENT"
      ? t("property.transactions.rent")
      : transactionType === "INVESTMENT"
        ? t("property.transactions.investment")
        : t("property.transactions.sale");

  const arrowClass = dir === "rtl" ? "-scale-x-100" : "";

  return (
    <Link href={`/property/${slug}`}>
      <Card className="group relative h-full overflow-hidden rounded-2xl border-0 bg-white shadow-[0_1px_3px_rgba(12,10,9,0.06),0_8px_24px_-12px_rgba(12,10,9,0.12)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_2px_6px_rgba(12,10,9,0.08),0_24px_48px_-16px_rgba(202,138,4,0.25)]">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-gray-400">{t("property.noImage")}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/10 transition-opacity duration-500" aria-hidden="true" />

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
            {transactionLabel}
          </span>
          {verified && (
            <span className="flex items-center gap-1 rounded-lg bg-white/85 px-2 py-0.5 text-[11px] font-semibold text-green-700 backdrop-blur-sm">
              <BadgeCheck className="h-3.5 w-3.5" />
              {t("property.badges.verified")}
            </span>
          )}
          {isNew && (
            <span className="rounded-lg bg-orange-500/90 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              {t("property.badges.new")}
            </span>
          )}
        </div>

        {/* Favorite button / custom action */}
        {actionSlot ? (
          <div className="absolute right-3 top-3">{actionSlot}</div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 h-9 w-9 rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-black/40"
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
          >
            <Heart
              className={cn(
                "h-[18px] w-[18px] transition-all duration-300",
                isFavorite
                  ? "scale-110 fill-red-500 text-red-500"
                  : "text-white/90"
              )}
            />
          </Button>
        )}

        {/* Price chip */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-tight text-white drop-shadow-sm">
              {formatPrice(price, currency)}
            </p>
          </div>
          <span className="shrink-0 flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            {propertyType}
            <ArrowUpRight
              className={cn("h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100", arrowClass)}
            />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 line-clamp-1 text-[15px] font-bold leading-snug text-gray-900 transition-colors duration-300 group-hover:text-gold">
          {title}
        </h3>

        <div className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="h-4 w-4 shrink-0 text-gold/60" />
          <span className="line-clamp-1">
            {neighborhood ? `${neighborhood}, ` : ""}
            {city}
          </span>
        </div>

        {/* Feature strip */}
        <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-gray-200 pt-3">
          {bedrooms !== null && bedrooms !== undefined && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
              <Bed className="h-3.5 w-3.5 text-gray-400" />
              {bedrooms}
            </div>
          )}
          {bathrooms !== null && bathrooms !== undefined && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
              <Bath className="h-3.5 w-3.5 text-gray-400" />
              {bathrooms}
            </div>
          )}
          {surfaceArea !== null && surfaceArea !== undefined && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
              <Maximize className="h-3.5 w-3.5 text-gray-400" />
              {surfaceArea} m²
            </div>
          )}

          <span className="ms-auto flex items-center gap-1 text-xs font-semibold text-gold opacity-0 transition-all duration-300 group-hover:opacity-100">
            {t("property.viewDetails")}
            <ArrowUpRight
              className={cn("h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5", arrowClass)}
            />
          </span>
        </div>
      </div>
      </Card>
    </Link>
  );
}