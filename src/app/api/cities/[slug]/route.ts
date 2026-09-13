import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const city = await db.city.findUnique({
      where: { slug },
      include: {
        neighborhoods: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: {
                properties: { where: { status: "PUBLISHED" } },
              },
            },
          },
        },
        _count: {
          select: {
            properties: { where: { status: "PUBLISHED" } },
          },
        },
      },
    });

    if (!city) {
      return NextResponse.json(
        { error: "Ville non trouvée" },
        { status: 404 }
      );
    }

    const properties = await db.property.findMany({
      where: { cityId: city.id, status: "PUBLISHED" },
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      take: 12,
      include: {
        city: { select: { name: true, slug: true } },
        neighborhood: { select: { name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...city,
        neighborhoods: city.neighborhoods,
        properties,
      },
    });
  } catch (error) {
    console.error("City detail error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
