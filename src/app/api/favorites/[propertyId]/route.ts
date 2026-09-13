import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// POST /api/favorites/[propertyId] - toggle favorite
export async function POST(
  request: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const user = await requireAuth();
    const { propertyId } = await params;

    // Check property exists
    const property = await db.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Propriété non trouvée" },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existing = await db.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId,
        },
      },
    });

    if (existing) {
      // Remove favorite
      await db.favorite.delete({
        where: { id: existing.id },
      });

      // Decrement favorite count
      await db.property.update({
        where: { id: propertyId },
        data: { favoriteCount: { decrement: 1 } },
      });

      return NextResponse.json({
        success: true,
        data: { favorited: false },
      });
    } else {
      // Add favorite
      await db.favorite.create({
        data: {
          userId: user.id,
          propertyId,
        },
      });

      // Increment favorite count
      await db.property.update({
        where: { id: propertyId },
        data: { favoriteCount: { increment: 1 } },
      });

      return NextResponse.json({
        success: true,
        data: { favorited: true },
      });
    }
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Favorite toggle error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites/[propertyId] - remove favorite
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const user = await requireAuth();
    const { propertyId } = await params;

    const existing = await db.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId,
        },
      },
    });

    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
      await db.property.update({
        where: { id: propertyId },
        data: { favoriteCount: { decrement: 1 } },
      });
    }

    return NextResponse.json({ success: true, data: { favorited: false } });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Favorite remove error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
