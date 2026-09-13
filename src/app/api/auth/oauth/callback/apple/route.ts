import { NextRequest, NextResponse } from "next/server";
import {
  getBaseUrl,
  consumeOAuthState,
  exchangeAppleCode,
  findOrCreateOAuthUser,
  finalizeOAuthSession,
  oauthErrorRedirect,
} from "@/lib/oauth";

export const dynamic = "force-dynamic";

async function handleAppleCallback(
  request: NextRequest,
  code: string,
  userJson: string | null
) {
  const baseUrl = getBaseUrl(request);
  const state = request.nextUrl.searchParams.get("state") || "";

  const oauthState = state ? await consumeOAuthState(state) : null;
  if (!oauthState) return oauthErrorRedirect(baseUrl, "oauth_invalid_state");

  try {
    const profile = await exchangeAppleCode(code, baseUrl, userJson);
    const user = await findOrCreateOAuthUser(profile);
    await finalizeOAuthSession(user);
    return NextResponse.redirect(new URL(oauthState.next, baseUrl));
  } catch (err) {
    console.error("Apple OAuth callback error:", err);
    return oauthErrorRedirect(baseUrl, "oauth_failed");
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") || "";
  if (!code) return oauthErrorRedirect(getBaseUrl(request), "oauth_failed");
  return handleAppleCallback(request, code, null);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const code = String(formData.get("code") || "");
  const userJson = formData.get("user") ? String(formData.get("user")) : null;
  const stateFromBody = formData.get("state") ? String(formData.get("state")) : "";
  if (!code) return oauthErrorRedirect(getBaseUrl(request), "oauth_failed");

  const url = new URL(request.url);
  if (stateFromBody && !url.searchParams.has("state")) {
    url.searchParams.set("state", stateFromBody);
  }
  const patched = new NextRequest(url, request);
  return handleAppleCallback(patched, code, userJson);
}