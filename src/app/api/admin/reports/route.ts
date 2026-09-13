import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role, PropertyStatus } from "@prisma/client";

export async function GET() {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const reports = await db.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        property: {
          select: { title: true, slug: true, status: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: reports });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Reports fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);
    const { reportId, status, action } = await request.json();

    if (!reportId || !status) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const report = await db.report.update({
      where: { id: reportId },
      data: {
        status,
        resolvedAt: new Date(),
      },
    });

    // If admin chose to hide the property
    if (action === "HIDE_PROPERTY" && report.propertyId) {
      await db.property.update({
        where: { id: report.propertyId },
        data: { status: PropertyStatus.ARCHIVED },
      });
    }

    if (action === "UNPUBLISH_PROPERTY" && report.propertyId) {
      await db.property.update({
        where: { id: report.propertyId },
        data: { status: PropertyStatus.DRAFT },
      });
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Report update error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}