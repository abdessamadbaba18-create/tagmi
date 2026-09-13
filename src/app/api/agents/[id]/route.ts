import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agent = await db.agent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
            email: true,
            createdAt: true,
          },
        },
        agency: {
          select: {
            name: true,
            slug: true,
            logo: true,
            phone: true,
            email: true,
            verified: true,
          },
        },
        properties: {
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          take: 12,
          include: {
            city: { select: { name: true, slug: true } },
            neighborhood: { select: { name: true, slug: true } },
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { firstName: true, lastName: true, avatar: true } },
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: agent });
  } catch (error) {
    console.error("Agent fetch error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
