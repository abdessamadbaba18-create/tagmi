import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const searches = await db.savedSearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ success: true, data: searches });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Saved searches error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const {
      name,
      query,
      cityId,
      propertyType,
      transactionType,
      minPrice,
      maxPrice,
      bedrooms,
      notifyNewMatch,
    } = body;

    if (!query || typeof query !== "object") {
      return NextResponse.json(
        { error: "Filtres de recherche requis" },
        { status: 400 }
      );
    }

    const saved = await db.savedSearch.create({
      data: {
        userId: user.id,
        name: name || null,
        query: query as any,
        cityId: cityId || null,
        propertyType: propertyType || null,
        transactionType: transactionType || null,
        minPrice: minPrice ? String(minPrice) : null,
        maxPrice: maxPrice ? String(maxPrice) : null,
        bedrooms: bedrooms || null,
        notifyNewMatch: !!notifyNewMatch,
      },
    });

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Saved search create error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Identifiant requis" }, { status: 400 });
    }

    const result = await db.savedSearch.deleteMany({
      where: { id, userId: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Recherche non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Saved search delete error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}