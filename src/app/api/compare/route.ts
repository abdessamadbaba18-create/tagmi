import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];

    if (ids.length < 2 || ids.length > 4) {
      return NextResponse.json(
        { error: "Veuillez sélectionner entre 2 et 4 propriétés à comparer" },
        { status: 400 }
      );
    }

    const properties = await db.property.findMany({
      where: { id: { in: ids }, status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        transactionType: true,
        propertyType: true,
        price: true,
        currency: true,
        surfaceArea: true,
        landArea: true,
        bedrooms: true,
        bathrooms: true,
        rooms: true,
        floor: true,
        totalFloors: true,
        yearBuilt: true,
        furnished: true,
        parking: true,
        garden: true,
        pool: true,
        terrace: true,
        balcony: true,
        elevator: true,
        airConditioning: true,
        heating: true,
        security: true,
        verified: true,
        viewCount: true,
        reference: true,
        city: { select: { name: true, slug: true } },
        neighborhood: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
        agent: {
          select: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: properties });
  } catch (error) {
    console.error("Compare error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
