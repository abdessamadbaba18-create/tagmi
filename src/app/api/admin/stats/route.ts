import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const [users, properties, agents, agencies, leads, reports, orders, revenueData] =
      await Promise.all([
        db.user.count(),
        db.property.count(),
        db.agent.count(),
        db.agency.count(),
        db.lead.count(),
        db.report.count({ where: { status: "PENDING" } }),
        db.order.count(),
        db.order.aggregate({
          _sum: { amount: true },
          where: {
            status: { in: ["PAID", "PROCESSING", "CONFIRMED", "COMPLETED"] },
          },
        }),
      ]);

    const orderStatus = await db.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const recentOrders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        property: {
          select: { title: true, slug: true, city: { select: { name: true } } },
        },
      },
    });

    const propStatus = await db.property.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const recentProperties = await db.property.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        owner: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    const recentUsers = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          users,
          properties,
          agents,
          agencies,
          leads,
          pendingReports: reports,
          orders,
          revenue: revenueData._sum?.amount ?? 0,
        },
        propertyStatus: propStatus,
        orderStatus,
        recentProperties,
        recentUsers,
        recentOrders,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}