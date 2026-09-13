import { db } from "@/lib/db";
import { slugify, generateReference } from "@/lib/utils";
import { PropertyInput } from "@/lib/validation";
import { PropertyStatus, Prisma } from "@prisma/client";

export async function getPropertyBySlug(slug: string) {
  return db.property.findUnique({
    where: { slug },
    include: {
      city: true,
      neighborhood: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
      videos: {
        orderBy: { sortOrder: "asc" },
      },
      features: true,
      agent: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatar: true,
            },
          },
          agency: true,
        },
      },
      agency: true,
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  });
}

export async function getPublishedProperties({
  page = 1,
  limit = 20,
  orderBy = { createdAt: "desc" },
}: {
  page?: number;
  limit?: number;
  orderBy?: Prisma.PropertyOrderByWithRelationInput;
}) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    db.property.findMany({
      where: { status: PropertyStatus.PUBLISHED },
      orderBy,
      skip,
      take: limit,
      include: {
        city: {
          select: { name: true, slug: true },
        },
        neighborhood: {
          select: { name: true, slug: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        agent: {
          select: {
            user: {
              select: { firstName: true, lastName: true, avatar: true },
            },
          },
        },
      },
    }),
    db.property.count({
      where: { status: PropertyStatus.PUBLISHED },
    }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getFeaturedProperties(limit = 8) {
  return db.property.findMany({
    where: { status: PropertyStatus.PUBLISHED },
    orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      city: {
        select: { name: true, slug: true },
      },
      neighborhood: {
        select: { name: true, slug: true },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  });
}

export async function getPropertiesByCity(citySlug: string, limit = 20) {
  const city = await db.city.findUnique({
    where: { slug: citySlug },
  });

  if (!city) return null;

  const properties = await db.property.findMany({
    where: {
      status: PropertyStatus.PUBLISHED,
      cityId: city.id,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      neighborhood: {
        select: { name: true, slug: true },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  });

  return { city, properties };
}

export async function createProperty(
  data: PropertyInput,
  ownerId: string
) {
  const slug = slugify(data.title) + "-" + Date.now().toString(36);
  const reference = generateReference();

  const { images, videos, ...propertyData } = data;

  return db.property.create({
    data: {
      ...propertyData,
      slug,
      reference,
      ownerId,
      status: PropertyStatus.DRAFT,
      ...(Array.isArray(images)
        ? {
            images: {
              create: images.map((url, index) => ({
                url,
                isPrimary: index === 0,
                sortOrder: index,
              })),
            },
          }
        : {}),
      ...(Array.isArray(videos)
        ? {
            videos: {
              create: videos.map((url, index) => ({
                url,
                sortOrder: index,
              })),
            },
          }
        : {}),
    },
  });
}

export async function updateProperty(
  id: string,
  data: Partial<PropertyInput>,
  userId: string
) {
  const property = await db.property.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!property) throw new Error("Property not found");
  if (property.ownerId !== userId) throw new Error("Unauthorized");

  const { images, videos, ...propertyData } = data;

  return db.property.update({
    where: { id },
    data: {
      ...propertyData,
      ...(images
        ? {
            images: {
              deleteMany: {},
              create: images.map((url, index) => ({
                url,
                isPrimary: index === 0,
                sortOrder: index,
              })),
            },
          }
        : {}),
      ...(videos
        ? {
            videos: {
              deleteMany: {},
              create: videos.map((url, index) => ({
                url,
                sortOrder: index,
              })),
            },
          }
        : {}),
    },
  });
}

export async function incrementViewCount(propertyId: string, ipAddress?: string) {
  await db.property.update({
    where: { id: propertyId },
    data: { viewCount: { increment: 1 } },
  });

  // Log the view
  await db.propertyView.create({
    data: {
      propertyId,
      ipAddress,
    },
  });
}

export async function getPropertiesByAgent(agentId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    db.property.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        city: {
          select: { name: true, slug: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    }),
    db.property.count({ where: { agentId } }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
