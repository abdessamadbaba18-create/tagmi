import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const KEYS = ["social.instagram", "social.facebook", "social.tiktok", "company.phone", "company.email"];

export async function GET() {
  try {
    const rows = await db.setting.findMany({ where: { key: { in: KEYS } } });
    const map = Object.fromEntries(rows.map((s) => [s.key, s.value]));

    return NextResponse.json({
      success: true,
      data: {
        instagram: map["social.instagram"] ?? "",
        facebook: map["social.facebook"] ?? "",
        tiktok: map["social.tiktok"] ?? "",
        phone: map["company.phone"] ?? "",
        email: map["company.email"] ?? "",
      },
    });
  } catch (error) {
    console.error("Social settings fetch error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}