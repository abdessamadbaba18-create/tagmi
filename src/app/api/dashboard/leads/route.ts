import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    const leads = await db.lead.findMany({
      where: {
        OR: [
          { agentId: { not: null }, agent: { userId: user.id } },
          { ownerId: user.id },
        ],
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
        source: true,
        score: true,
        createdAt: true,
        property: {
          select: { title: true, slug: true, price: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: leads });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Leads fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const { leadId, status } = await request.json();

    if (!leadId || !status) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const lead = await db.lead.findUnique({
      where: { id: leadId },
      select: { id: true, ownerId: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Prospect non trouvé" }, { status: 404 });
    }

    if (lead.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await db.lead.update({
      where: { id: leadId },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Lead update error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}