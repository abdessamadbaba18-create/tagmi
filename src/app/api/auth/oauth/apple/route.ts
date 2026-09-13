import { NextRequest, NextResponse } from "next/server";
import {
  getBaseUrl,
  createOAuthState,
  buildAppleAuthUrl,
  isAppleConfigured,
} from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAppleConfigured()) {
    return NextResponse.json({ error: "OAuth Apple non configuré" }, { status: 501 });
  }

  const baseUrl = getBaseUrl(request);
  const next = request.nextUrl.searchParams.get("next") || "/";
  const state = await createOAuthState(next);

  return NextResponse.redirect(buildAppleAuthUrl(baseUrl, state));
}