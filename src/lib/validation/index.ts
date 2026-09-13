import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
    ),
  confirmPassword: z.string(),
  role: z.enum(["BUYER", "RENTER", "PROPERTY_OWNER", "AGENT"]).default("BUYER"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

const mediaUrl = z.string().refine(
  (v) => {
    try {
      new URL(v);
      return true;
    } catch {
      return v.startsWith("/");
    }
  },
  "URL invalide"
);

const PROPERTY_NUMERIC_FIELDS = [
  "price", "surfaceArea", "landArea", "bedrooms", "bathrooms",
  "rooms", "floor", "totalFloors", "yearBuilt", "latitude", "longitude",
] as const;

export function normalizePropertyBody(
  body: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (value === null || value === undefined || value === "") continue;
    if ((PROPERTY_NUMERIC_FIELDS as readonly string[]).includes(key)) {
      const n = typeof value === "number" ? value : Number(value);
      if (Number.isFinite(n)) {
        out[key] = n;
      }
      continue;
    }
    out[key] = value;
  }
  return out;
}

export const propertySchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(50, "La description doit contenir au moins 50 caractères"),
  transactionType: z.enum(["SALE", "RENT", "SHORT_TERM_RENT", "INVESTMENT"]),
  propertyType: z.enum([
    "APARTMENT", "VILLA", "HOUSE", "RIAD", "LAND", "OFFICE",
    "SHOP", "COMMERCIAL", "HOTEL", "FARM", "NEW_DEVELOPMENT", "OTHER"
  ]),
  price: z.number().positive("Le prix doit être positif"),
  currency: z.enum(["MAD", "USD", "EUR"]).default("MAD"),
  surfaceArea: z.number().positive().optional(),
  landArea: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  rooms: z.number().int().min(0).optional(),
  floor: z.number().int().min(0).optional(),
  totalFloors: z.number().int().min(0).optional(),
  yearBuilt: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  furnished: z.boolean().default(false),
  parking: z.boolean().default(false),
  garden: z.boolean().default(false),
  pool: z.boolean().default(false),
  terrace: z.boolean().default(false),
  balcony: z.boolean().default(false),
  elevator: z.boolean().default(false),
  airConditioning: z.boolean().default(false),
  heating: z.boolean().default(false),
  security: z.boolean().default(false),
  address: z.string().optional(),
  cityId: z.string().min(1, "La ville est requise"),
  neighborhoodId: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  images: z.array(mediaUrl).optional(),
  videos: z.array(mediaUrl).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().min(10, "Numéro de téléphone invalide").optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  propertyId: z.string().optional(),
  agentId: z.string().optional(),
}).refine(
  (data) => data.email || data.phone,
  { message: "Email ou téléphone requis" }
);

export const searchSchema = z.object({
  q: z.string().optional(),
  cityId: z.string().optional(),
  neighborhoodId: z.string().optional(),
  propertyType: z.enum([
    "APARTMENT", "VILLA", "HOUSE", "RIAD", "LAND", "OFFICE",
    "SHOP", "COMMERCIAL", "HOTEL", "FARM", "NEW_DEVELOPMENT", "OTHER"
  ]).optional(),
  transactionType: z.enum(["SALE", "RENT", "SHORT_TERM_RENT", "INVESTMENT"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  minSurface: z.coerce.number().min(0).optional(),
  maxSurface: z.coerce.number().min(0).optional(),
  furnished: z.coerce.boolean().optional(),
  parking: z.coerce.boolean().optional(),
  pool: z.coerce.boolean().optional(),
  garden: z.coerce.boolean().optional(),
  terrace: z.coerce.boolean().optional(),
  verified: z.coerce.boolean().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "surface", "relevance"]).default("relevance"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
