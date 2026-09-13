import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const INTERACTION_TYPES = ["email", "phone", "whatsapp", "meeting", "note"];
const DIRECTIONS = ["inbound", "outbound"];
const ACTIVE_STATUSES = [
  "CONTACTED",
  "QUALIFIED",
  "VISIT_SCHEDULED",
  "NEGOTIATING",
];

function visibleLeadsWhere(userId: string) {
  return {
    OR: [
      { agentId: { not: null }, agent: { userId } },
      { ownerId: userId },
    ],
  };
}

export async function GET() {
  try {
    const user = await requireAuth();

    const leads = await db.lead.findMany({
      where: visibleLeadsWhere(user.id),
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 200,
      include: {
        interactions: { orderBy: { createdAt: "desc" }, take: 30 },
        offers: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        visits: {
          select: { id: true, scheduledAt: true, status: true },
          orderBy: { scheduledAt: "asc" },
        },
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            currency: true,
            city: { select: { name: true } },
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });

    const upcomingVisits = await db.visit.count({
      where: {
        lead: visibleLeadsWhere(user.id),
        scheduledAt: { gte: new Date() },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    const mappedLeads = leads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      message: lead.message,
      status: lead.status,
      source: lead.source,
      score: lead.score,
      budget: lead.budget ? Number(lead.budget) : null,
      notes: lead.notes,
      lastContact: lead.lastContact,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      interactions: lead.interactions,
      offers: lead.offers.map((o) => ({
        ...o,
        amount: Number(o.amount),
      })),
      visits: lead.visits,
      property: lead.property
        ? {
            ...lead.property,
            price: Number(lead.property.price),
          }
        : null,
    }));

    const total = mappedLeads.length;
    const active = mappedLeads.filter((l) =>
      ACTIVE_STATUSES.includes(l.status)
    ).length;
    const won = mappedLeads.filter((l) => l.status === "WON").length;
    const lost = mappedLeads.filter((l) => l.status === "LOST").length;
    const closed = won + lost;
    const pipelineValue = mappedLeads
      .filter(
        (l) => ACTIVE_STATUSES.includes(l.status) && typeof l.budget === "number"
      )
      .reduce((sum, l) => sum + (l.budget ?? 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total,
          active,
          won,
          lost,
          closed,
          conversionRate: closed > 0 ? Math.round((won / closed) * 100) : 0,
          pipelineValue,
        },
        upcomingVisits,
        leads: mappedLeads,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("CRM fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const { leadId, status, score, budget, notes } = await request.json();

    if (!leadId) {
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

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (score !== undefined) data.score = score;
    if (budget !== undefined) data.budget = budget;
    if (notes !== undefined) data.notes = notes;

    const updated = await db.lead.update({
      where: { id: leadId },
      data,
      select: { id: true, status: true, score: true, budget: true, notes: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("CRM update error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { leadId, type, content, direction } = await request.json();

    if (!leadId || !type || !direction) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    if (!INTERACTION_TYPES.includes(type)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    if (!DIRECTIONS.includes(direction)) {
      return NextResponse.json({ error: "Direction invalide" }, { status: 400 });
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

    const interaction = await db.leadInteraction.create({
      data: {
        leadId,
        type,
        content: content?.trim() || null,
        direction,
      } as any,
    });

    if (type !== "note") {
      await db.lead.update({
        where: { id: leadId },
        data: { lastContact: new Date() },
      });
    }

    return NextResponse.json({ success: true, data: interaction });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("CRM interaction error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}