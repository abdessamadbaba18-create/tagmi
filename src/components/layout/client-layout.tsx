"use client";

import { I18nContext, getTranslation, getDirection } from "@/i18n/provider";
import type { Locale } from "@/i18n/config";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/marketing/whatsapp-button";
import { usePathname } from "next/navigation";
import { getLocaleFromPath } from "@/i18n/config";
import { useCallback } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const dir = getDirection(locale);

  const t = useCallback(
    (key: string) => getTranslation(locale, key),
    [locale]
  );

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <I18nContext.Provider value={{ locale, t, dir }}>
      {!isDashboard && <Header />}
      <main className="flex-1">{children}</main>
      {!isDashboard && <Footer />}
      <WhatsAppButton />
    </I18nContext.Provider>
  );
}
