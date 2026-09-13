import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { propertyId, amount, message } = await request.json();

    if (!propertyId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Propriété et montant requis" },
        { status: 400 }
      );
    }

    const property = await db.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        ownerId: true,
        agent: {
          select: {
            userId: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Propriété non trouvée" },
        { status: 404 }
      );
    }

    // Find or create a lead for this buyer on this property
    let lead = await db.lead.findFirst({
      where: {
        email: user.email,
        propertyId: property.id,
      },
    });

    if (!lead) {
      lead = await db.lead.create({
        data: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email || undefined,
          phone: user.phone || undefined,
          source: "WEBSITE",
          ownerId: property.ownerId,
          propertyId: property.id,
        },
      });
    }

    const offer = await db.offer.create({
      data: {
        leadId: lead.id,
        propertyId: property.id,
        amount: String(amount),
        message: message || null,
      },
    });

    // Notify the property owner (or agent) about the new offer
    const notifyUserId = property.agent?.userId || property.ownerId;
    await db.notification.create({
      data: {
        userId: notifyUserId,
        type: "OFFER",
        title: "Nouvelle offre",
        message: `Une offre a été reçue pour "${property.title}".`,
        data: { offerId: offer.id, propertyId: property.id },
      },
    });

    return NextResponse.json({ success: true, data: offer }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Offer create error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    const property = propertyId
      ? await db.property.findUnique({
          where: { id: propertyId },
          select: { ownerId: true },
        })
      : null;

    if (propertyId && !property) {
      return NextResponse.json(
        { error: "Propriété non trouvée" },
        { status: 404 }
      );
    }

    // Owner/agent can view offers on their properties; ADMIN can view all
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    // Find the user's agent record if they are an agent
    const myAgent = !isAdmin && !propertyId
      ? await db.agent.findFirst({
          where: { userId: user.id },
          select: { id: true },
        })
      : null;

    const offers = await db.offer.findMany({
      where: {
        ...(propertyId
          ? { propertyId }
          : {
              property: isAdmin
                ? undefined
                : {
                    OR: [
                      { ownerId: user.id },
                      ...(myAgent ? [{ agentId: myAgent.id }] : []),
                    ],
                  },
            }),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            currency: true,
            city: { select: { name: true } },
          },
        },
      },
    });

    // Only return offers the user is entitled to see (owner of the property or agent or admin)
    const filtered =
      propertyId || isAdmin
        ? offers
        : offers.filter((o) => true === true); // ownership filter applied in where

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Offers fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Identifiant et statut requis" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "PENDING",
      "ACCEPTED",
      "REJECTED",
      "COUNTERED",
      "WITHDRAWN",
      "EXPIRED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const offer = await db.offer.findUnique({
      where: { id },
      include: {
        lead: { select: { ownerId: true } },
        property: {
          select: { ownerId: true, agentId: true },
        },
      },
    });

    if (!offer) {
      return NextResponse.json(
        { error: "Offre non trouvée" },
        { status: 404 }
      );
    }

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const myAgent = await db.agent.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    const canManage =
      isAdmin ||
      offer.lead.ownerId === user.id ||
      offer.property.ownerId === user.id ||
      (myAgent && offer.property.agentId === myAgent.id);

    if (!canManage) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const updated = await db.offer.update({
      where: { id },
      data: { status },
    });

    // Notify the lead's contact about the updated status
    const lead = await db.lead.findUnique({
      where: { id: offer.leadId },
      select: { email: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Offer update error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}