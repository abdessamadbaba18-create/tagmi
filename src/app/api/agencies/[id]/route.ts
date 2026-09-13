import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agency = await db.agency.findUnique({
      where: { id },
      include: {
        agents: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
                phone: true,
              },
            },
          },
        },
        properties: {
          where: { status: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            currency: true,
            transactionType: true,
            propertyType: true,
            surfaceArea: true,
            bedrooms: true,
            bathrooms: true,
            city: { select: { name: true } },
            neighborhood: { select: { name: true } },
            images: {
              where: { isPrimary: true },
              select: { url: true },
              take: 1,
            },
          },
        },
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Agence non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: agency });
  } catch (error) {
    console.error("Agency detail error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}