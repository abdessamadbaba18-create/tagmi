import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, canAccessResource } from "@/lib/auth";
import { propertySchema, normalizePropertyBody } from "@/lib/validation";
import { PropertyStatus } from "@prisma/client";

// GET /api/properties/[slug] - get single property
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const property = await db.property.findUnique({
      where: { slug },
      include: {
        city: true,
        neighborhood: true,
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        },
        videos: { orderBy: { sortOrder: "asc" } },
        features: true,
        agent: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
              },
            },
            agency: true,
          },
        },
        agency: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Propriété non trouvée" },
        { status: 404 }
      );
    }

    // Increment view count
    await db.property.update({
      where: { id: property.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error("Property fetch error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[slug] - update property
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireAuth();
    const { slug } = await params;
    const body = await request.json();

    const existing = await db.property.findUnique({
      where: { slug },
      select: { id: true, ownerId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Propriété non trouvée" },
        { status: 404 }
      );
    }

    // Only owner, admin, or agent assigned can edit
    if (
      user.role !== "SUPER_ADMIN" &&
      user.role !== "ADMIN" &&
      existing.ownerId !== user.id
    ) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const result = propertySchema.partial().safeParse(normalizePropertyBody(body));
    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { images, videos, ...updateData } = result.data;

    const property = await db.property.update({
      where: { id: existing.id },
      data: {
        ...updateData,
        images: Array.isArray(images)
          ? {
              deleteMany: {},
              create: images.map((url, index) => ({
                url,
                sortOrder: index,
                isPrimary: index === 0,
              })),
            }
          : undefined,
        videos: Array.isArray(videos)
          ? {
              deleteMany: {},
              create: videos.map((url, index) => ({
                url,
                sortOrder: index,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, data: property });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Property update error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la modification" },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[slug] - delete property
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireAuth();
    const { slug } = await params;

    const existing = await db.property.findUnique({
      where: { slug },
      select: { id: true, ownerId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Propriété non trouvée" },
        { status: 404 }
      );
    }

    if (
      user.role !== "SUPER_ADMIN" &&
      user.role !== "ADMIN" &&
      existing.ownerId !== user.id
    ) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    await db.property.delete({ where: { id: existing.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Property delete error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression" },
      { status: 500 }
    );
  }
}
