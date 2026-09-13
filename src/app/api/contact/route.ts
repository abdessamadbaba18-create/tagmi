import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validation";
import { LeadSource, LeadStatus } from "@prisma/client";

// POST /api/contact - create lead from contact form
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Determine lead source
    const referer = request.headers.get("referer") || "";
    let source: LeadSource = LeadSource.WEBSITE;
    if (referer.includes("whatsapp")) source = LeadSource.WHATSAPP;

    // Find property details for context
    let agentId: string | null = null;
    let agencyId: string | null = null;
    let ownerId = "";

    if (data.propertyId) {
      const property = await db.property.findUnique({
        where: { id: data.propertyId },
        select: {
          agentId: true,
          agencyId: true,
          ownerId: true,
          title: true,
          price: true,
          currency: true,
        },
      });

      if (property) {
        agentId = property.agentId;
        agencyId = property.agencyId;
        ownerId = property.ownerId;
      }
    }

    if (data.agentId) {
      const agent = await db.agent.findUnique({
        where: { id: data.agentId },
        select: { userId: true },
      });
      if (agent) ownerId = agent.userId;
    }

    // Create lead
    const lead = await db.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        source,
        status: LeadStatus.NEW,
        score: 10, // Base score for inquiry
        propertyId: data.propertyId,
        agentId,
        agencyId,
        ownerId: ownerId || "", // Fallback
      },
    });

    return NextResponse.json({
      success: true,
      data: { leadId: lead.id },
      message: "Votre message a été envoyé avec succès",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'envoi" },
      { status: 500 }
    );
  }
}
