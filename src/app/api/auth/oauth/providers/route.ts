import { NextResponse } from "next/server";
import { isGoogleConfigured, isAppleConfigured } from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    google: isGoogleConfigured(),
    apple: isAppleConfigured(),
  });
}