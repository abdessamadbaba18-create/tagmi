import { cookies } from "next/headers";
import { SignJWT, importPKCS8 } from "jose";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { Role } from "@prisma/client";

const STATE_COOKIE = "oauth_state";
const STATE_MAX_AGE = 600;

export interface OAuthState {
  csrf: string;
  next: string;
}

export interface OAuthProfile {
  provider: "google" | "apple";
  providerId: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  picture: string | null;
}

export function getBaseUrl(request: Request): string {
  return new URL(request.url).origin;
}

export function sanitizeNext(next: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export function randomHex(len = 24): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createOAuthState(next: string): Promise<string> {
  const state: OAuthState = { csrf: randomHex(), next: sanitizeNext(next) };
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, JSON.stringify(state), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: STATE_MAX_AGE,
  });
  return JSON.stringify(state);
}

export async function consumeOAuthState(raw: string): Promise<OAuthState | null> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);
  if (!stored || stored !== raw) return null;
  try {
    const parsed = JSON.parse(stored) as OAuthState;
    if (!parsed.csrf) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function oauthErrorRedirect(baseUrl: string, code: string): NextResponse {
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(code)}`, baseUrl));
}

export async function findOrCreateOAuthUser(profile: OAuthProfile) {
  if (!profile.email) throw new Error("oauth_no_email");

  const existing = await db.user.findUnique({ where: { email: profile.email } });
  if (existing) return existing;

  const firstName = profile.firstName || "Membre";
  const lastName = profile.lastName || "TAGMI";

  const user = await db.user.create({
    data: {
      email: profile.email,
      passwordHash: await hashPassword(crypto.randomUUID()),
      firstName,
      lastName,
      avatar: profile.picture,
      emailVerified: profile.emailVerified,
      role: "BUYER" as Role,
    },
  });

  return user;
}

export async function finalizeOAuthSession(user: {
  id: string;
  email: string;
  role: Role;
}) {
  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  await setSessionCookie(token);
}

/* ------------------------------- Google ------------------------------- */

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function buildGoogleAuthUrl(baseUrl: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${baseUrl}/api/auth/oauth/callback/google`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
    access_type: "online",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(
  code: string,
  baseUrl: string
): Promise<OAuthProfile> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${baseUrl}/api/auth/oauth/callback/google`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) throw new Error("google_token");

  const tokenData = await tokenRes.json();
  const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!infoRes.ok) throw new Error("google_userinfo");

  const profile = await infoRes.json();
  return {
    provider: "google",
    providerId: String(profile.sub),
    email: String(profile.email || ""),
    emailVerified: Boolean(profile.email_verified),
    firstName: String(profile.given_name || ""),
    lastName: String(profile.family_name || ""),
    picture: profile.picture ? String(profile.picture) : null,
  };
}

/* ------------------------------- Apple -------------------------------- */

export function isAppleConfigured(): boolean {
  return Boolean(
    process.env.APPLE_CLIENT_ID &&
      process.env.APPLE_TEAM_ID &&
      process.env.APPLE_KEY_ID &&
      process.env.APPLE_PRIVATE_KEY
  );
}

export function buildAppleAuthUrl(baseUrl: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.APPLE_CLIENT_ID!,
    redirect_uri: `${baseUrl}/api/auth/oauth/callback/apple`,
    response_type: "code",
    scope: "name email",
    state,
    response_mode: "form_post",
  });
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

async function makeAppleClientSecret(): Promise<string> {
  const pem = (process.env.APPLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const privateKey = await importPKCS8(pem, "ES256");
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: process.env.APPLE_KEY_ID })
    .setIssuer(process.env.APPLE_TEAM_ID!)
    .setSubject(process.env.APPLE_CLIENT_ID!)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(privateKey);
}

export async function exchangeAppleCode(
  code: string,
  baseUrl: string,
  userJson?: string | null
): Promise<OAuthProfile> {
  const clientSecret = await makeAppleClientSecret();
  const tokenRes = await fetch("https://appleid.apple.com/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.APPLE_CLIENT_ID!,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${baseUrl}/api/auth/oauth/callback/apple`,
    }),
  });
  if (!tokenRes.ok) throw new Error("apple_token");

  const tokenData = await tokenRes.json();
  const idToken = tokenData.id_token as string | undefined;
  if (!idToken) throw new Error("apple_id_token");

  const payload = JSON.parse(
    Buffer.from(idToken.split(".")[1] || "", "base64url").toString("utf8")
  );

  let firstName = "";
  let lastName = "";
  if (userJson) {
    try {
      const u = JSON.parse(userJson);
      firstName = u?.name?.firstName || "";
      lastName = u?.name?.lastName || "";
    } catch {
      // ignore malformed user payload
    }
  }

  return {
    provider: "apple",
    providerId: String(payload.sub || ""),
    email: String(payload.email || ""),
    emailVerified: payload.email_verified === undefined ? true : Boolean(payload.email_verified),
    firstName,
    lastName,
    picture: null,
  };
}