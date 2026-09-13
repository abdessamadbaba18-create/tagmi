import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { OrderStatus, Role } from "@prisma/client";

const VALID_STATUSES = new Set<string>([
  "PENDING",
  "PAID",
  "PROCESSING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
]);

// GET /api/admin/orders - list orders (pagination + optional status filter)
export async function GET(request: Request) {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status && VALID_STATUSES.has(status)) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { property: { title: { contains: search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              city: { select: { name: true } },
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin orders fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

// PATCH /api/admin/orders - update order status
export async function PATCH(request: Request) {
  try {
    await requireRole(Role.ADMIN, Role.SUPER_ADMIN);

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status || !VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: {
        status: status as OrderStatus,
        paidAt: status === "PAID" ? new Date() : undefined,
      },
    });

    if (status === "COMPLETED") {
      await db.property.update({
        where: { id: order.propertyId },
        data: { status: "SOLD" },
      });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("Admin order update error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}