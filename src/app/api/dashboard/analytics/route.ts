import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    const [
      totalViews,
      publishedProperties,
      totalLeads,
      propertyViews,
      leadStatusBreakdown,
    ] = await Promise.all([
      db.property.aggregate({
        where: { ownerId: user.id },
        _sum: { viewCount: true },
      }),
      db.property.count({
        where: { ownerId: user.id, status: "PUBLISHED" },
      }),
      db.lead.count({
        where: {
          OR: [
            { agentId: { not: null }, agent: { userId: user.id } },
            { ownerId: user.id },
          ],
        },
      }),
      db.property.findMany({
        where: { ownerId: user.id },
        orderBy: { viewCount: "desc" },
        take: 10,
        select: { id: true, title: true, viewCount: true },
      }),
      db.lead.groupBy({
        by: ["status"],
        where: {
          OR: [
            { agentId: { not: null }, agent: { userId: user.id } },
            { ownerId: user.id },
          ],
        },
        _count: { status: true },
      }),
    ]);

    const avgLeadScore = await db.lead.aggregate({
      where: {
        OR: [
          { agentId: { not: null }, agent: { userId: user.id } },
          { ownerId: user.id },
        ],
        score: { gt: 0 },
      },
      _avg: { score: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalViews: totalViews._sum.viewCount || 0,
        publishedProperties,
        totalLeads,
        avgLeadScore: Math.round(avgLeadScore._avg.score || 0),
        propertyViews: propertyViews.map((p) => ({
          id: p.id,
          title: p.title,
          viewCount: p.viewCount,
        })),
        leadStatusBreakdown: leadStatusBreakdown.map((ls) => ({
          status: ls.status,
          count: ls._count.status,
        })),
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}