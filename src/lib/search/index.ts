import { db } from "@/lib/db";
import { SearchInput } from "@/lib/validation";
import { Prisma, PropertyStatus } from "@prisma/client";

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PropertySearchResult {
  id: string;
  title: string;
  slug: string;
  description: string;
  transactionType: string;
  propertyType: string;
  price: Prisma.Decimal;
  currency: string;
  surfaceArea: Prisma.Decimal | null;
  bedrooms: number | null;
  bathrooms: number | null;
  furnished: boolean;
  parking: boolean;
  pool: boolean;
  garden: boolean;
  verified: boolean;
  viewCount: number;
  createdAt: Date;
  city: {
    name: string;
    slug: string;
  };
  neighborhood: {
    name: string;
    slug: string;
  } | null;
  images: {
    url: string;
    alt: string | null;
    isPrimary: boolean;
  }[];
  agent: {
    user: {
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
  } | null;
}

export async function searchProperties(
  input: SearchInput
): Promise<SearchResult<PropertySearchResult>> {
  const where: Prisma.PropertyWhereInput = {
    status: PropertyStatus.PUBLISHED,
  };

  // Keyword search
  if (input.q) {
    where.OR = [
      { title: { contains: input.q } },
      { description: { contains: input.q } },
      { address: { contains: input.q } },
    ];
  }

  // City filter
  if (input.cityId) {
    where.cityId = input.cityId;
  }

  // Neighborhood filter
  if (input.neighborhoodId) {
    where.neighborhoodId = input.neighborhoodId;
  }

  // Property type filter
  if (input.propertyType) {
    where.propertyType = input.propertyType as any;
  }

  // Transaction type filter
  if (input.transactionType) {
    where.transactionType = input.transactionType as any;
  }

  // Price range
  if (input.minPrice || input.maxPrice) {
    where.price = {};
    if (input.minPrice) {
      where.price.gte = input.minPrice;
    }
    if (input.maxPrice) {
      where.price.lte = input.maxPrice;
    }
  }

  // Bedrooms
  if (input.bedrooms !== undefined) {
    where.bedrooms = { gte: input.bedrooms };
  }

  // Bathrooms
  if (input.bathrooms !== undefined) {
    where.bathrooms = { gte: input.bathrooms };
  }

  // Surface area
  if (input.minSurface || input.maxSurface) {
    where.surfaceArea = {};
    if (input.minSurface) {
      where.surfaceArea.gte = input.minSurface;
    }
    if (input.maxSurface) {
      where.surfaceArea.lte = input.maxSurface;
    }
  }

  // Boolean filters
  if (input.furnished !== undefined) {
    where.furnished = input.furnished;
  }
  if (input.parking !== undefined) {
    where.parking = input.parking;
  }
  if (input.pool !== undefined) {
    where.pool = input.pool;
  }
  if (input.garden !== undefined) {
    where.garden = input.garden;
  }
  if (input.terrace !== undefined) {
    where.terrace = input.terrace;
  }

  // Verified filter
  if (input.verified !== undefined) {
    where.verified = input.verified;
  }

  // Sorting
  let orderBy: Prisma.PropertyOrderByWithRelationInput | Prisma.PropertyOrderByWithRelationInput[];
  switch (input.sort) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "surface":
      orderBy = { surfaceArea: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "relevance":
    default:
      orderBy = [{ viewCount: "desc" }, { createdAt: "desc" }];
      break;
  }

  const skip = (input.page - 1) * input.limit;

  const [items, total] = await Promise.all([
    db.property.findMany({
      where,
      orderBy,
      skip,
      take: input.limit,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        transactionType: true,
        propertyType: true,
        price: true,
        currency: true,
        surfaceArea: true,
        bedrooms: true,
        bathrooms: true,
        furnished: true,
        parking: true,
        pool: true,
        garden: true,
        verified: true,
        viewCount: true,
        createdAt: true,
        city: {
          select: {
            name: true,
            slug: true,
          },
        },
        neighborhood: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: {
            url: true,
            alt: true,
            isPrimary: true,
          },
        },
        agent: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    }),
    db.property.count({ where }),
  ]);

  return {
    items,
    total,
    page: input.page,
    limit: input.limit,
    totalPages: Math.ceil(total / input.limit),
  };
}

// Future: Replace with Meilisearch/Elasticsearch
export interface SearchProvider {
  search(input: SearchInput): Promise<SearchResult<PropertySearchResult>>;
  indexProperty(property: PropertySearchResult): Promise<void>;
  removeProperty(id: string): Promise<void>;
}

// MySQL implementation (current)
export const mysqlSearchProvider: SearchProvider = {
  search: searchProperties,
  indexProperty: async () => {}, // No-op for MySQL
  removeProperty: async () => {}, // No-op for MySQL
};
