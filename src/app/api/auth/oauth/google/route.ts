import { NextRequest, NextResponse } from "next/server";
import {
  getBaseUrl,
  createOAuthState,
  buildGoogleAuthUrl,
  isGoogleConfigured,
} from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isGoogleConfigured()) {
    return NextResponse.json({ error: "OAuth Google non configuré" }, { status: 501 });
  }

  const baseUrl = getBaseUrl(request);
  const next = request.nextUrl.searchParams.get("next") || "/";
  const state = await createOAuthState(next);

  return NextResponse.redirect(buildGoogleAuthUrl(baseUrl, state));
}