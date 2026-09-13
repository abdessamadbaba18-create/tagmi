import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { slugify } from "@/lib/utils";

const cityAdminSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(120),
  nameAr: z.string().trim().max(120).optional().nullable(),
  image: z.string().trim().max(500).optional().nullable(),
  description: z.string().trim().max(1200).optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/cities - all cities (incl. inactive) for the admin console
export async function GET() {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const cities = await db.city.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { neighborhoods: true, properties: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: cities });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin cities fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

// POST /api/admin/cities - create a city
export async function POST(request: Request) {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const body = await request.json();
    const result = cityAdminSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    const baseSlug = slugify(data.name) || "ville";
    let slug = baseSlug;
    let n = 1;
    while (await db.city.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${n++}`;
    }

    const city = await db.city.create({
      data: { ...data, slug },
    });

    return NextResponse.json({ success: true, data: city }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin city create error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

// PATCH /api/admin/cities - update a city ({ id, ...fields })
export async function PATCH(request: Request) {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const body = await request.json();
    const { id, ...updates } = body || {};
    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const existing = await db.city.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ville introuvable" }, { status: 404 });
    }

    const result = cityAdminSchema.partial().safeParse(updates);
    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const city = await db.city.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ success: true, data: city });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin city update error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

// DELETE /api/admin/cities?id=xxx - delete a city (falls back to deactivation if referenced)
export async function DELETE(request: Request) {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const existing = await db.city.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ville introuvable" }, { status: 404 });
    }

    try {
      await db.city.delete({ where: { id } });
      return NextResponse.json({ success: true, deleted: true });
    } catch {
      // Referenced by properties/neighborhoods → soft deactivate instead
      await db.city.update({ where: { id }, data: { isActive: false } });
      return NextResponse.json({ success: true, deleted: false, deactivated: true });
    }
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin city delete error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}