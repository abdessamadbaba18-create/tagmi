import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [agencies, total] = await Promise.all([
      db.agency.findMany({
        where: { isActive: true },
        orderBy: [{ verified: "desc" }, { rating: "desc" }],
        skip,
        take: limit,
        include: {
          owner: {
            select: { firstName: true, lastName: true, avatar: true },
          },
          _count: {
            select: {
              agents: { where: { isActive: true } },
              properties: { where: { status: "PUBLISHED" } },
            },
          },
        },
      }),
      db.agency.count({ where: { isActive: true } }),
    ]);

    return NextResponse.json({
      success: true,
      data: agencies,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Agencies fetch error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
