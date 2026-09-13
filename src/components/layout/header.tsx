"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu, X, Search, User, LayoutDashboard, ChevronRight,
  ShoppingCart, TrendingUp, UserRound, Building2, Newspaper, Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const glass = scrolled;

  const navItems = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/buy", label: t("nav.buy"), icon: ShoppingCart },
    { href: "/invest", label: t("nav.invest"), icon: TrendingUp },
    { href: "/agents", label: t("nav.agents"), icon: UserRound },
    { href: "/agencies", label: t("nav.agencies"), icon: Building2 },
    { href: "/blog", label: t("nav.blog"), icon: Newspaper },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500",
          glass
            ? "border-b border-white/10 bg-ink/85 shadow-lg shadow-black/30 backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        {/* Gold root accent line */}
        
        <div className={cn("container mx-auto flex items-center justify-between px-4 transition-all duration-500", glass ? "h-14" : "h-[4.5rem]")}>
          {/* Logo image — left only, with creative gold halo */}
          <Link href="/" aria-label="TAGMI" className="group/logo mr-auto flex shrink-0 items-center">
            <span className="relative flex items-center">
              {/* Rotating dashed gold ring */}
              <span
                className="pointer-events-none absolute inset-0 -m-2 rounded-full border border-dashed border-gold/30 animate-[ring-spin_28s_linear_infinite]"
                aria-hidden="true"
              />
              {/* Soft gold aura */}
              <span
                className="pointer-events-none absolute inset-0 -m-3 rounded-full bg-gold/15 blur-2xl transition-opacity duration-500 group-hover/logo:opacity-100 opacity-60"
                aria-hidden="true"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/TAGMI.png"
                alt="TAGMI"
                className="relative h-8 w-auto object-contain drop-shadow-[0_0_12px_rgba(244,201,107,0.35)] transition-transform duration-300 hover:scale-105 sm:h-9"
              />
            </span>
          </Link>

          {/* Desktop Navigation — creative gold capsule */}
          <nav aria-label="Main navigation" className="items-center gap-1 rounded-full border-gold-hairline bg-black/30 p-1.5 backdrop-blur-xl lg:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold tracking-wide transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-gold to-gold-light text-ink shadow-[0_6px_18px_-8px_rgba(202,138,4,0.9)]"
                      : "nav-underline text-white/75 hover:text-gold-light hover:bg-white/[0.06]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-left gap-1 sm:gap-1.5">
            <Link href="/properties" aria-label={t("nav.properties")}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9 rounded-full transition-all duration-300",
                  glass
                    ? "bg-white/10 text-black ring-1 ring-white/15 hover:bg-white/15 hover:text-gold"
                    : "text-white/80 hover:bg-gold/10 hover:text-gold-light"
                )}
              >
                <Search className="h-[17px] w-[17px]" aria-hidden="true" />
              </Button>
            </Link>

            <Link href="/dashboard" aria-label={t("nav.dashboard")}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9 rounded-full transition-all duration-300",
                  glass
                    ? "bg-white/10 text-gold-light ring-1 ring-white/15 hover:bg-white/15 hover:text-gold"
                    : "text-white/80 hover:bg-white/10 hover:text-gold-light"
                )}
              >
                <LayoutDashboard className="h-[17px] w-[17px]" aria-hidden="true" />
              </Button>
            </Link>

            

            <div className="hidden h-6 w-px bg-white/15 sm:block" aria-hidden="true" />

            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 rounded-full px-2 transition-all duration-300 min-[420px]:px-4",
                  glass
                    ? "text-white/90 hover:bg-white/10 hover:text-gold-light ring-1 ring-white/15"
                    : "text-white/90 hover:bg-white/10 hover:text-gold-light"
                )}
              >
                <User className="h-4 w-4" aria-hidden="true" />
                <span className="hidden xl:inline">{t("nav.login")}</span>
              </Button>
            </Link>

            <Link href="/register">
              <Button
                size="sm"
                className="group/cta relative hidden gap-2 overflow-hidden rounded-full bg-gradient-to-r from-gold to-gold-light px-4 font-semibold text-ink shadow-[0_10px_24px_-10px_rgba(202,138,4,0.9)] ring-1 ring-gold-light/40 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_14px_30px_-10px_rgba(202,138,4,1)] xl:flex"
              >
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shine-sweep_5.5s_ease-in-out_infinite]"
                  aria-hidden="true"
                />
                {t("nav.register")}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full text-white hover:bg-white/10 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <Menu
                  className={cn(
                    "absolute h-5 w-5 transition-all duration-300",
                    mobileMenuOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                  )}
                />
                <X
                  className={cn(
                    "absolute h-5 w-5 transition-all duration-300",
                    mobileMenuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                  )}
                />
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-300 lg:hidden",
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Slide-in panel */}
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-[min(85vw,360px)] overflow-hidden bg-gradient-to-b from-[#16110d] to-ink shadow-2xl transition-transform duration-400 ease-out",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Faint art-deco sunburst watermark */}
          <div className="sunburst pointer-events-none absolute -right-16 -top-16 h-64 w-64 opacity-[0.12]" aria-hidden="true" />

          {/* Panel top accent */}
          <div className="relative h-1 w-full bg-gradient-to-r from-gold to-gold-light" />

          {/* Header */}
          <div className="relative flex h-16 items-center justify-between px-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/TAGMI.png" alt="TAGMI" className="h-7 w-auto object-contain" />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-white/80 hover:bg-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Nav items */}
          <nav className="relative flex flex-col gap-1 px-3 py-4">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/10 text-gold-light"
                      : "text-white/80 hover:bg-white/5 hover:text-gold-light",
                    mobileMenuOpen ? "animate-[nav-item-slide_0.3s_ease-out_both]" : "opacity-0"
                  )}
                  style={{ animationDelay: mobileMenuOpen ? `${index * 50}ms` : "0ms" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200",
                      isActive
                        ? "bg-gradient-to-br from-gold to-gold-light text-ink"
                        : "bg-white/10 text-white/70"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-gold-light shadow-[0_0_6px_var(--brand-gold-light)]" aria-hidden="true" />}
                  <ChevronRight className="ms-2 h-4 w-4 opacity-30" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="relative mx-5 my-2 h-px bg-white/10" aria-hidden="true" />

          {/* Action buttons */}
          <div className="relative flex flex-col gap-2 px-5 py-3">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-all hover:bg-white/5 hover:text-gold-light",
                mobileMenuOpen && "animate-[nav-item-slide_0.3s_ease-out_both]"
              )}
              style={{ animationDelay: mobileMenuOpen ? `${(navItems.length + 1) * 50}ms` : "0ms" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </div>

          {/* Auth buttons */}
          <div className="relative flex flex-col gap-2 px-5 pb-6 pt-2">
            <Link
              href="/login"
              className={cn(mobileMenuOpen && "animate-[nav-item-slide_0.3s_ease-out_both]")}
              style={{ animationDelay: mobileMenuOpen ? `${(navItems.length + 2) * 50}ms` : "0ms" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="outline" className="w-full rounded-full border-white/15 text-white hover:bg-white/10 hover:text-gold-light">
                {t("nav.login")}
              </Button>
            </Link>
            <Link
              href="/register"
              className={cn(mobileMenuOpen && "animate-[nav-item-slide_0.3s_ease-out_both]")}
              style={{ animationDelay: mobileMenuOpen ? `${(navItems.length + 3) * 50}ms` : "0ms" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button className="w-full rounded-full bg-gradient-to-r from-gold to-gold-light text-ink shadow-[0_10px_24px_-10px_rgba(202,138,4,0.9)] ring-1 ring-gold-light/40">
                {t("nav.register")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}