import type { Metadata } from "next";
import "./globals.css";
import { headers } from "next/headers";
import { ClientLayout } from "@/components/layout/client-layout";
import { getDirection, getTranslation } from "@/i18n/translate";
import { defaultLocale, isValidLocale, type Locale } from "@/i18n/config";

const OG_LOCALE: Record<Locale, string> = {
  fr: "fr_MA",
  ar: "ar_MA",
  en: "en_US",
};

async function resolveLocale(): Promise<Locale> {
  const headersList = await headers();
  const value = headersList.get("x-locale") ?? "";
  return isValidLocale(value) ? value : defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = (key: string) => getTranslation(locale, key);

  return {
    title: {
      default: t("seo.home.title"),
      template: "%s | TAGMI",
    },
    description: t("seo.home.description"),
    keywords: [
      "immobilier maroc",
      "acheter immobilier maroc",
      "achat villa marrakech",
      "achat appartement casablanca",
      "villa casablanca",
      "riad marrakech",
      "terrain rabat",
      "agence immobilière maroc",
      "property morocco",
      "real estate morocco",
    ],
    authors: [{ name: "TAGMI" }],
    creator: "TAGMI",
    publisher: "TAGMI",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    ),
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      siteName: "TAGMI",
      title: t("seo.home.title"),
      description: t("seo.home.description"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("seo.home.title"),
      description: t("seo.home.description"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await resolveLocale();
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}