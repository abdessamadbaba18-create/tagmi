import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role, LeadStatus } from "@prisma/client";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const q = url.searchParams.get("q")?.trim() || "";
    const status = url.searchParams.get("status") || "";
    const source = url.searchParams.get("source") || "";

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }
    if (status && Object.values(LeadStatus).includes(status as LeadStatus)) {
      where.status = status;
    }
    if (source) {
      where.source = source;
    }

    const [total, leads, byStatus, totalAll] = await Promise.all([
      db.lead.count({ where }),
      db.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          owner: { select: { firstName: true, lastName: true } },
          property: { select: { id: true, title: true, slug: true } },
          agency: { select: { id: true, name: true } },
        },
      }),
      db.lead.groupBy({ by: ["status"], _count: { status: true } }),
      db.lead.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      },
      summary: {
        total: totalAll,
        byStatus,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin leads error:", error);
    return NextResponse.json({ success: false, error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const body = await request.json();
    const id: string = body?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "Identifiant requis" }, { status: 400 });
    }

    const data: any = {};
    if (body.status && Object.values(LeadStatus).includes(body.status)) {
      data.status = body.status;
    }
    if (typeof body.score === "number" && body.score >= 0 && body.score <= 100) {
      data.score = body.score;
    }
    if (typeof body.notes === "string" && body.notes.length <= 2000) {
      data.notes = body.notes;
    }

    const lead = await db.lead.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: lead });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "Prospect introuvable" }, { status: 404 });
    }
    console.error("Admin leads PATCH error:", error);
    return NextResponse.json({ success: false, error: "Erreur" }, { status: 500 });
  }
}