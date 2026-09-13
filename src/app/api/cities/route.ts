import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/cities - get all active cities
export async function GET() {
  try {
    const cities = await db.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            properties: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: cities.map((city) => ({
        id: city.id,
        name: city.name,
        slug: city.slug,
        nameAr: city.nameAr,
        nameFr: city.nameFr,
        propertyCount: city._count.properties,
      })),
    });
  } catch (error) {
    console.error("Cities fetch error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
