import { NextRequest, NextResponse } from "next/server";
import {
  defaultLocale,
  isValidLocale,
  type Locale,
} from "./src/i18n/config";

const LOCALE_COOKIE = "tagmi-locale";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/");
  const firstSegment = segments[1] ?? "";
  const pathLocale = isValidLocale(firstSegment) ? firstSegment : "";

  // Resolve effective locale: explicit URL prefix > persisted cookie > default
  const cookieValue = request.cookies.get(LOCALE_COOKIE)?.value ?? "";
  const cookieLocale =
    isValidLocale(cookieValue) && cookieValue !== defaultLocale
      ? cookieValue
      : defaultLocale;

  const locale: Locale = pathLocale
    ? (pathLocale as Locale)
    : cookieLocale;

  // Normalize: keep the locale in the URL so client + server stay consistent
  if (
    request.method === "GET" &&
    !pathLocale &&
    cookieLocale !== defaultLocale
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/${cookieLocale}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, cookieLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  // Signal the effective locale to the server renderer
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);

  let response: NextResponse;
  if (pathLocale) {
    // Serve the existing non-prefixed route while keeping the localized URL
    const url = request.nextUrl.clone();
    url.pathname = "/" + segments.slice(2).join("/");
    response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }

  response.headers.set("x-locale", locale);
  response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};