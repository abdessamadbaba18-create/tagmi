import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    const messages = await db.lead.findMany({
      where: {
        OR: [
          { agentId: { not: null }, agent: { userId: user.id } },
          { ownerId: user.id },
        ],
        message: { not: "" },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        status: true,
        createdAt: true,
        property: {
          select: { title: true, slug: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Messages fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}