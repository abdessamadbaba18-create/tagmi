import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify, generateReference } from "@/lib/utils";
import { propertySchema, normalizePropertyBody } from "@/lib/validation";
import { requireAuth, canAccessResource } from "@/lib/auth";
import { PropertyStatus } from "@prisma/client";

// GET /api/properties - list published (public) + create (auth)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // ?mine=true — authenticated user's own properties (all statuses) for the dashboard
    if (searchParams.get("mine") === "true") {
      const user = await requireAuth();
      const [items, total] = await Promise.all([
        db.property.findMany({
          where: { ownerId: user.id },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            city: { select: { name: true, slug: true } },
            neighborhood: { select: { name: true, slug: true } },
            images: { where: { isPrimary: true }, take: 1 },
          },
        }),
        db.property.count({ where: { ownerId: user.id } }),
      ]);
      return NextResponse.json({
        success: true,
        data: items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    if (searchParams.get("featured") === "true") {
      const properties = await db.property.findMany({
        where: { status: PropertyStatus.PUBLISHED },
        orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
        take: limit,
        include: {
          city: { select: { name: true, slug: true } },
          neighborhood: { select: { name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
      });
      return NextResponse.json({ success: true, data: properties });
    }

    const [items, total] = await Promise.all([
      db.property.findMany({
        where: { status: PropertyStatus.PUBLISHED },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          city: { select: { name: true, slug: true } },
          neighborhood: { select: { name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 },
          agent: {
            select: {
              user: { select: { firstName: true, lastName: true, avatar: true } },
            },
          },
        },
      }),
      db.property.count({ where: { status: PropertyStatus.PUBLISHED } }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Properties fetch error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// POST /api/properties - create property (authenticated)
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const result = propertySchema.safeParse(normalizePropertyBody(body));

    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;
    const slug = slugify(data.title) + "-" + Date.now().toString(36);
    const reference = generateReference();

    // Find agent if user has one
    let agentId: string | null = null;
    if (user.role === "AGENT") {
      const agent = await db.agent.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      agentId = agent?.id ?? null;
    }

    // Admins publish instantly; owners submit to the moderation queue
    const isModerator =
      user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const status = isModerator
      ? PropertyStatus.PUBLISHED
      : PropertyStatus.PENDING_REVIEW;

    const property = await db.property.create({
      data: {
        title: data.title,
        slug,
        reference,
        description: data.description,
        transactionType: data.transactionType,
        propertyType: data.propertyType,
        price: data.price,
        currency: data.currency,
        surfaceArea: data.surfaceArea,
        landArea: data.landArea,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        rooms: data.rooms,
        floor: data.floor,
        totalFloors: data.totalFloors,
        yearBuilt: data.yearBuilt,
        furnished: data.furnished,
        parking: data.parking,
        garden: data.garden,
        pool: data.pool,
        terrace: data.terrace,
        balcony: data.balcony,
        elevator: data.elevator,
        airConditioning: data.airConditioning,
        heating: data.heating,
        security: data.security,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        cityId: data.cityId,
        neighborhoodId: data.neighborhoodId,
        ownerId: user.id,
        agentId,
        status,
        publishedAt: isModerator ? new Date() : null,
        images: Array.isArray(data.images)
          ? {
              create: data.images.map(
                (url: string, index: number) => ({
                  url,
                  sortOrder: index,
                  isPrimary: index === 0,
                })
              ),
            }
          : undefined,
        videos: Array.isArray(data.videos)
          ? {
              create: data.videos.map((url: string, index: number) => ({
                url,
                sortOrder: index,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, data: property }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Property create error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création" },
      { status: 500 }
    );
  }
}
