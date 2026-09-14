import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { OrderStatus, Role } from "@prisma/client";

const REVENUE_STATUSES: OrderStatus[] = ["PAID", "PROCESSING", "CONFIRMED", "COMPLETED"];

function lastNMonths(n: number) {
  const months: { key: string; label: string; start: Date; end: Date }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
      start: d,
      end,
    });
  }
  return months;
}

export async function GET() {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const [totalUsers, totalProperties, totalOrders, totalLeads, totalAgencies, totalAgents] =
      await Promise.all([
        db.user.count(),
        db.property.count(),
        db.order.count(),
        db.lead.count(),
        db.agency.count(),
        db.agent.count(),
      ]);

    const revenueAgg = await db.order.aggregate({
      _sum: { amount: true },
      where: { status: { in: REVENUE_STATUSES } },
    });
    const revenue = Number(revenueAgg._sum?.amount ?? 0);

    const viewsAgg = await db.property.aggregate({
      _sum: { viewCount: true, favoriteCount: true, inquiryCount: true },
    });

    const months = lastNMonths(12);
    const series = await Promise.all([
      ...months.map(async (m) => {
        const count = await db.user.count({
          where: { createdAt: { gte: m.start, lt: m.end } },
        });
        return { key: m.key, label: m.label, count };
      }),
      ...months.map(async (m) => {
        const agg = await db.order.aggregate({
          _count: { _all: true },
          _sum: { amount: true },
          where: {
            createdAt: { gte: m.start, lt: m.end },
            status: { in: REVENUE_STATUSES },
          },
        });
        return {
          key: m.key,
          label: m.label,
          count: agg._count._all,
          revenue: Number(agg._sum?.amount ?? 0),
        };
      }),
    ]);

    const usersByMonth = series.slice(0, 12);
    const ordersByMonth = series.slice(12);

    const [leadsByStatus, leadsBySource, propertyStatus, transactionSplit] =
      await Promise.all([
        db.lead.groupBy({
          by: ["status"],
          _count: { status: true },
          orderBy: { _count: { status: "desc" } },
        }),
        db.lead.groupBy({
          by: ["source"],
          _count: { source: true },
          orderBy: { _count: { source: "desc" } },
        }),
        db.property.groupBy({
          by: ["status"],
          _count: { status: true },
          orderBy: { _count: { status: "desc" } },
        }),
        db.property.groupBy({
          by: ["transactionType"],
          _count: { transactionType: true },
          orderBy: { _count: { transactionType: "desc" } },
        }),
      ]);

    const topCityRows = await db.property.groupBy({
      by: ["cityId"],
      _count: { cityId: true },
      orderBy: { _count: { cityId: "desc" } },
      take: 6,
    });
    const cityIds = topCityRows.map((r) => r.cityId);
    const cities = cityIds.length
      ? await db.city.findMany({ where: { id: { in: cityIds } }, select: { id: true, name: true } })
      : [];
    const cityName = new Map(cities.map((c) => [c.id, c.name]));
    const topCities = topCityRows.map((r) => ({
      cityId: r.cityId,
      name: cityName.get(r.cityId) ?? "Inconnue",
      count: r._count.cityId,
    }));

    const [recentSignups, recentLeads, pendingReports] = await Promise.all([
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      db.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          source: true,
          createdAt: true,
          property: { select: { title: true } },
        },
      }),
      db.report.count({ where: { status: "PENDING" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          users: totalUsers,
          properties: totalProperties,
          orders: totalOrders,
          leads: totalLeads,
          agencies: totalAgencies,
          agents: totalAgents,
          revenue,
          pendingReports,
          views: Number(viewsAgg._sum?.viewCount ?? 0),
          favorites: Number(viewsAgg._sum?.favoriteCount ?? 0),
          inquiries: Number(viewsAgg._sum?.inquiryCount ?? 0),
        },
        usersByMonth,
        ordersByMonth,
        leadsByStatus,
        leadsBySource,
        propertyStatus,
        transactionSplit,
        topCities,
        recentSignups,
        recentLeads,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin analytics error:", error);
    return NextResponse.json({ success: false, error: "Erreur" }, { status: 500 });
  }
}