import { NextRequest, NextResponse } from "next/server";
import {
  getBaseUrl,
  consumeOAuthState,
  exchangeGoogleCode,
  findOrCreateOAuthUser,
  finalizeOAuthSession,
  oauthErrorRedirect,
} from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code") || "";
  const state = searchParams.get("state") || "";
  const oauthError = searchParams.get("error");

  const oauthState = await consumeOAuthState(state);
  if (!oauthState) return oauthErrorRedirect(baseUrl, "oauth_invalid_state");
  if (oauthError) return oauthErrorRedirect(baseUrl, "oauth_denied");

  try {
    const profile = await exchangeGoogleCode(code, baseUrl);
    const user = await findOrCreateOAuthUser(profile);
    await finalizeOAuthSession(user);
    return NextResponse.redirect(new URL(oauthState.next, baseUrl));
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return oauthErrorRedirect(baseUrl, "oauth_failed");
  }
}