import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/neighborhoods?cityId=xxx - get neighborhoods for a city
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("cityId");

    const where: any = { isActive: true };
    if (cityId) where.cityId = cityId;

    const neighborhoods = await db.neighborhood.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        city: { select: { name: true, slug: true } },
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
      data: neighborhoods.map((n) => ({
        id: n.id,
        name: n.name,
        slug: n.slug,
        nameAr: n.nameAr,
        nameFr: n.nameFr,
        cityName: n.city.name,
        propertyCount: n._count.properties,
      })),
    });
  } catch (error) {
    console.error("Neighborhoods fetch error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
