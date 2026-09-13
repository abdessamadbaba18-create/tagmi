import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { slugify } from "@/lib/utils";

const neighborhoodAdminSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(120),
  cityId: z.string().min(1, "La ville est requise"),
  nameAr: z.string().trim().max(120).optional().nullable(),
  image: z.string().trim().max(500).optional().nullable(),
  description: z.string().trim().max(1200).optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/neighborhoods?cityId=xxx - all neighborhoods (incl. inactive)
export async function GET(request: Request) {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("cityId");

    const where: any = {};
    if (cityId) where.cityId = cityId;

    const neighborhoods = await db.neighborhood.findMany({
      where,
      orderBy: [{ city: { name: "asc" } }, { name: "asc" }],
      include: {
        city: { select: { name: true, slug: true } },
        _count: {
          select: { properties: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: neighborhoods });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin neighborhoods fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

// POST /api/admin/neighborhoods - create a neighborhood
export async function POST(request: Request) {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const body = await request.json();
    const result = neighborhoodAdminSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    const city = await db.city.findUnique({ where: { id: data.cityId } });
    if (!city) {
      return NextResponse.json({ error: "Ville introuvable" }, { status: 400 });
    }

    const baseSlug = slugify(data.name) || "quartier";
    let slug = baseSlug;
    let n = 1;
    while (
      await db.neighborhood.findUnique({
        where: { cityId_slug: { cityId: data.cityId, slug } },
      })
    ) {
      slug = `${baseSlug}-${n++}`;
    }

    const neighborhood = await db.neighborhood.create({
      data: { ...data, slug },
    });

    return NextResponse.json({ success: true, data: neighborhood }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin neighborhood create error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

// PATCH /api/admin/neighborhoods - update a neighborhood ({ id, ...fields })
export async function PATCH(request: Request) {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const body = await request.json();
    const { id, ...updates } = body || {};
    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const existing = await db.neighborhood.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Quartier introuvable" }, { status: 404 });
    }

    const result = neighborhoodAdminSchema.partial().safeParse(updates);
    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // If city changed, ensure the target city exists
    if (result.data.cityId && result.data.cityId !== existing.cityId) {
      const city = await db.city.findUnique({ where: { id: result.data.cityId } });
      if (!city) {
        return NextResponse.json({ error: "Ville introuvable" }, { status: 400 });
      }
    }

    const neighborhood = await db.neighborhood.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ success: true, data: neighborhood });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin neighborhood update error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

// DELETE /api/admin/neighborhoods?id=xxx
export async function DELETE(request: Request) {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const existing = await db.neighborhood.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Quartier introuvable" }, { status: 404 });
    }

    try {
      await db.neighborhood.delete({ where: { id } });
      return NextResponse.json({ success: true, deleted: true });
    } catch {
      await db.neighborhood.update({ where: { id }, data: { isActive: false } });
      return NextResponse.json({ success: true, deleted: false, deactivated: true });
    }
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin neighborhood delete error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}