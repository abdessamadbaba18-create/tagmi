import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PaymentMethod, OrderStatus } from "@prisma/client";

function generateOrderNumber(): string {
  const now = new Date();
  const ymd =
    now.getFullYear().toString().slice(2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TAG-${ymd}-${rand}`;
}

// POST /api/orders - create a purchase / deposit order from checkout
export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const {
      propertyId,
      reservationType,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      amount,
      depositAmount,
      notes,
    } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: "Propriété requise" },
        { status: 400 }
      );
    }

    const property = await db.property.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true, price: true, currency: true, status: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Propriété non trouvée" },
        { status: 404 }
      );
    }

    const total =
      typeof amount === "number" && amount > 0
        ? amount
        : parseFloat(property.price.toString());

    let method: PaymentMethod = PaymentMethod.CARD;
    if (paymentMethod === "CASH") method = PaymentMethod.CASH;
    else if (paymentMethod === "BANK_TRANSFER") method = PaymentMethod.BANK_TRANSFER;
    else if (paymentMethod === "PAYPAL") method = PaymentMethod.PAYPAL;
    else if (paymentMethod === "OTHER") method = PaymentMethod.OTHER;

    let orderNumber = generateOrderNumber();
    for (let i = 0; i < 5; i++) {
      const exists = await db.order.findUnique({ where: { orderNumber } });
      if (!exists) break;
      orderNumber = generateOrderNumber();
    }

    const order = await db.order.create({
      data: {
        orderNumber,
        status: OrderStatus.PAID,
        paymentMethod: method,
        amount: total,
        currency: property.currency,
        depositAmount:
          typeof depositAmount === "number" && depositAmount > 0
            ? depositAmount
            : null,
        reservationType: reservationType === "deposit" ? "deposit" : "buy",
        customerName: customerName || `${user.firstName} ${user.lastName}`,
        customerEmail: customerEmail || user.email,
        customerPhone: customerPhone || user.phone || "",
        notes: notes || null,
        paidAt: new Date(),
        userId: user.id,
        propertyId: property.id,
      },
    });

    await db.property.update({
      where: { id: property.id },
      data: { inquiryCount: { increment: 1 } },
    });

    return NextResponse.json(
      { success: true, data: order },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Order create error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la commande" },
      { status: 500 }
    );
  }
}

// GET /api/orders - current user's orders
export async function GET() {
  try {
    const user = await requireAuth();

    const orders = await db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            city: { select: { name: true } },
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Orders fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}