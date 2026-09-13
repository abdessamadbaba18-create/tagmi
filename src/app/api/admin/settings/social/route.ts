import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";

const KEYS = [
  "social.instagram",
  "social.facebook",
  "social.tiktok",
  "company.phone",
  "company.email",
] as const;

const socialSchema = z.object({
  instagram: z.string().trim().max(300).optional().nullable(),
  facebook: z.string().trim().max(300).optional().nullable(),
  tiktok: z.string().trim().max(300).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().email("Email invalide").max(120).optional().nullable(),
});

export async function GET() {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const rows = await db.setting.findMany({ where: { key: { in: [...KEYS] } } });
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
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin social settings fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const body = await request.json();
    const result = socialSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const fieldMap: Record<string, "instagram" | "facebook" | "tiktok" | "phone" | "email"> = {
      "social.instagram": "instagram",
      "social.facebook": "facebook",
      "social.tiktok": "tiktok",
      "company.phone": "phone",
      "company.email": "email",
    };
    const groupMap: Record<string, string> = {
      "social.instagram": "social",
      "social.facebook": "social",
      "social.tiktok": "social",
      "company.phone": "company",
      "company.email": "company",
    };

    const entries: { key: string; value: string; group: string }[] = [];
    for (const key of KEYS) {
      const field = fieldMap[key];
      const value = result.data[field];
      if (value !== undefined) {
        entries.push({ key, value: value ?? "", group: groupMap[key] });
      }
    }

    for (const { key, value, group } of entries) {
      await db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value, group },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin social settings save error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}