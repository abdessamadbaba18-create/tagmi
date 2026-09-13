"use client";

import { FilePlus2 } from "lucide-react";
import { PropertyForm } from "@/components/forms/property-form";

export default function NewPropertyPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/15 to-gold-light/5 ring-1 ring-gold/20">
          <FilePlus2 className="h-6 w-6 text-gold" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Espace éditeur
          </p>
          <h2 className="font-display text-2xl font-bold text-ink">
            Nouvelle annonce
          </h2>
          <p className="text-sm text-stone-500">
            Suivez les étapes pour créer une annonce irréprochable.
          </p>
        </div>
      </div>

      <PropertyForm mode="create" />
    </div>
  );
}