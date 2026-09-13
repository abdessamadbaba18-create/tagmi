import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("cityId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      user: { role: "AGENT" },
    };

    if (cityId) {
      where.agencyId = undefined;
      where.properties = {
        some: {
          cityId,
          status: "PUBLISHED",
        },
      };
    }

    const [agents, total] = await Promise.all([
      db.agent.findMany({
        where,
        orderBy: [{ rating: "desc" }, { listingCount: "desc" }],
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              phone: true,
              email: true,
            },
          },
          agency: {
            select: {
              name: true,
              slug: true,
              logo: true,
            },
          },
          _count: {
            select: {
              properties: { where: { status: "PUBLISHED" } },
            },
          },
        },
      }),
      db.agent.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: agents.map((a) => ({
        ...a,
        listingCount: a._count.properties,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Agents fetch error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
