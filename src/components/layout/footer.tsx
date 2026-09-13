"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useI18n } from "@/i18n/provider";

const socialIconClass = "h-4 w-4";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={socialIconClass} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={socialIconClass} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={socialIconClass} aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export function Footer() {
  const { t } = useI18n();
  const [socials, setSocials] = useState([
    { key: "instagram", href: "#", Icon: InstagramIcon, label: "Instagram" },
    { key: "facebook", href: "#", Icon: FacebookIcon, label: "Facebook" },
    { key: "tiktok", href: "#", Icon: TikTokIcon, label: "TikTok" },
  ]);
  const [phone, setPhone] = useState("+212 6 00 00 00 00");
  const [email, setEmail] = useState("contact@tagmi.ma");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings/social");
        const data = await res.json();
        if (data.success) {
          setSocials((prev) =>
            prev.map((s) => ({
              ...s,
              href: data.data[s.key] || "#",
            }))
          );
          if (data.data.phone) setPhone(data.data.phone);
          if (data.data.email) setEmail(data.data.email);
        }
      } catch {
        /* keep placeholders */
      }
    })();
  }, []);

  const footerLinks = {
    buy: [
      { href: "/properties?transactionType=SALE&propertyType=APARTMENT", label: "Appartements" },
      { href: "/properties?transactionType=SALE&propertyType=VILLA", label: "Villas" },
      { href: "/properties?transactionType=SALE&propertyType=RIAD", label: "Riads" },
      { href: "/properties?transactionType=SALE&propertyType=LAND", label: "Terrains" },
    ],
    rent: [
      { href: "/properties?transactionType=INVESTMENT&propertyType=APARTMENT", label: "Appartements" },
      { href: "/properties?transactionType=INVESTMENT&propertyType=VILLA", label: "Villas" },
      { href: "/properties?transactionType=INVESTMENT&propertyType=VILLA", label: "Villas de luxe" },
      { href: "/properties?transactionType=INVESTMENT&furnished=true", label: "Meublé" },
    ],
    cities: [
      { href: "/city/marrakech", label: "Marrakech" },
      { href: "/city/casablanca", label: "Casablanca" },
      { href: "/city/rabat", label: "Rabat" },
      { href: "/city/agadir", label: "Agadir" },
    ],
    company: [
      { href: "/about", label: "À propos" },
      { href: "/contact", label: "Contact" },
      { href: "/blog", label: "Blog" },
      { href: "/terms", label: "Conditions" },
    ],
  };

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      {/* Zellige grid overlay */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(45deg, rgba(202,138,4,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px, 80px 80px, 40px 40px",
        }}
        aria-hidden="true"
      />

      {/* Top accent */}
      <div className="relative h-1 w-full bg-gradient-to-r from-gold via-gold-light to-gold" />

      <div className="relative container mx-auto px-4 py-14">
        {/* Brand row */}
        <div className="mb-12 flex flex-col items-start justify-between gap-8 lg:flex-row">
          <div className="max-w-sm">
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/TAGMI.png"
                alt="TAGMI"
                className="h-5 w-auto object-contain"
              />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-gold-light">
                  {t("common.tagline")}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              La plateforme immobilière marocaine de référence. Achetez, louez,
              vendez et investissez en toute confiance.
            </p>

            <div className="mt-6 space-y-2 text-sm text-white/50">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                Marrakech, Maroc
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" />
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="transition-colors hover:text-gold-light">
                  {phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" />
                <a href={`mailto:${email}`} className="transition-colors hover:text-gold-light">
                  {email}
                </a>
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              {socials.map((social) => {
                const configured = social.href !== "#";
                const cls =
                  "flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300";
                return configured ? (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`${cls} border-white/10 bg-white/5 text-white/60 hover:border-gold/50 hover:bg-gold/10 hover:text-gold-light`}
                  >
                    <social.Icon />
                  </a>
                ) : (
                  <span
                    key={social.label}
                    aria-hidden="true"
                    title="Lien à configurer dans l'admin"
                    className={`${cls} pointer-events-none border-white/5 bg-white/[0.02] text-white/20`}
                  >
                    <social.Icon />
                  </span>
                );
              })}
            </div>
          </div>

          {/* Newsletters / CTA */}
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm lg:mt-2">
            <h3 className="mb-2 font-display text-lg font-bold text-white">
              Restez informé
            </h3>
            <p className="mb-4 text-sm text-white/50">
              Recevez les dernières annonces et tendances du marché immobilier marocain.
            </p>
            <form
              className="flex gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="votre@email.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-gold/60"
              />
              <button
                type="submit"
                aria-label="S'abonner"
                className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-light px-4 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-10 md:grid-cols-4">
          {[
            { heading: t("nav.buy"), links: footerLinks.buy },
            { heading: t("nav.invest"), links: footerLinks.rent },
            { heading: "Villes", links: footerLinks.cities },
            { heading: "TAGMI", links: footerLinks.company },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gold-light">
                <span className="h-[3px] w-5 rounded-full bg-gradient-to-r from-gold to-gold-light" />
                {heading}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/55 transition-colors duration-200 hover:text-gold-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} TAGMI. Tous droits réservés.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/40">
            <Link href="/terms" className="transition-colors hover:text-gold-light">
              Confidentialité
            </Link>
            <span className="h-3 w-px bg-white/15" />
            <Link href="/terms" className="transition-colors hover:text-gold-light">
              Conditions
            </Link>
            <span className="h-3 w-px bg-white/15" />
            <Link href="/contact" className="transition-colors hover:text-gold-light">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}