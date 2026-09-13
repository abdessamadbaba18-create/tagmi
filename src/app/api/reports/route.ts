import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { propertyId, reason, details } = await request.json();

    if (!propertyId || !reason) {
      return NextResponse.json(
        { error: "Propriété et motif requis" },
        { status: 400 }
      );
    }

    const validReasons = [
      "FAKE_LISTING",
      "SCAM",
      "MISLEADING_INFO",
      "DUPLICATE",
      "INAPPROPRIATE",
      "OTHER",
    ];

    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: "Motif invalide" },
        { status: 400 }
      );
    }

    // Check property exists
    const property = await db.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    if (!property) {
      return NextResponse.json(
        { error: "Propriété non trouvée" },
        { status: 404 }
      );
    }

    const report = await db.report.create({
      data: {
        propertyId,
        userId: user.id,
        reason,
        details: details || null,
      },
    });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Report error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}