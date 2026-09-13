"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe, Languages } from "lucide-react";
import {
  locales,
  localeNames,
  localeFlags,
  getLocaleFromPath,
  getPathWithoutLocale,
  getLocalizedPath,
  type Locale,
} from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "navbar" | "mobile";
  bare?: boolean;
  onNavigate?: () => void;
}

export function LanguageSwitcher({
  variant = "navbar",
  bare = false,
  onNavigate,
}: LanguageSwitcherProps) {
  const { locale } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Pop-in animation for the dropdown
  useEffect(() => {
    if (open) {
      setVisible(false);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const isMobile = variant === "mobile";

  const handleNavigate = () => {
    setOpen(false);
    onNavigate?.();
  };

  const basePath = getPathWithoutLocale(pathname);

  return (
    <div ref={ref} className={cn("relative", isMobile && "w-full")}>
      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center transition-all duration-300",
          isMobile
            ? "w-full gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gold"
            : "gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors duration-300",
          bare
            ? "border-white/15 text-white/85 hover:border-gold/60 hover:text-gold-light"
            : "border-gray-200 text-gray-600 hover:border-gold/50 hover:text-gold"
        )}
      >
        {isMobile ? (
          <>
            <Languages className="h-4 w-4 text-gold" />
            <span className="flex-1 text-left text-sm font-medium">
              {localeFlags[locale]} {localeNames[locale]}
            </span>
            <ChevronDown
              className={cn("h-4 w-4 text-gray-400 transition-transform duration-300", open && "rotate-180")}
            />
          </>
        ) : (
          <>
            <Globe className="h-3.5 w-3.5" />
            <span className="text-xs font-bold uppercase">{locale}</span>
            <ChevronDown
              className={cn("h-3 w-3 opacity-60 transition-transform duration-300", open && "rotate-180")}
            />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            "z-50 transition-all duration-200",
            isMobile
              ? "relative mt-1 w-full"
              : cn(
                  "absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border shadow-xl",
                  bare
                    ? "border-white/15 bg-ink/95 backdrop-blur-xl"
                    : "border-gray-100 bg-white shadow-black/10"
                ),
            visible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
          )}
          role="listbox"
        >
          <div className={cn("p-1.5", isMobile && "border-t border-gray-100")}>
            {locales.map((l) => {
              const active = l === locale;
              return (
                <Link
                  key={l}
                  href={getLocalizedPath(basePath, l)}
                  role="option"
                  aria-selected={active}
                  onClick={handleNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-200",
                    active
                      ? "bg-gradient-to-r from-gold/15 to-gold-light/5 font-semibold text-gold"
                      : bare
                        ? "text-white/75 hover:bg-white/10 hover:text-gold-light"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gold"
                  )}
                >
                  <span className="text-base leading-none">{localeFlags[l]}</span>
                  <span className="flex-1">{localeNames[l]}</span>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      bare ? "text-white/40" : "text-gray-300"
                    )}
                  >
                    {l}
                  </span>
                  {active && <Check className="h-4 w-4 text-gold" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}