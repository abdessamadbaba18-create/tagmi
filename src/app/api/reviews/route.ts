import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { agentId, agencyId, rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Note invalide (1-5)" },
        { status: 400 }
      );
    }

    if (!agentId && !agencyId) {
      return NextResponse.json(
        { error: "Agent ou agence requis" },
        { status: 400 }
      );
    }

    const review = await db.review.create({
      data: {
        userId: user.id,
        agentId: agentId || null,
        agencyId: agencyId || null,
        rating,
        comment: comment || null,
      },
    });

    // Update agent/agency average rating
    if (agentId) {
      const stats = await db.review.aggregate({
        where: { agentId, approved: true },
        _avg: { rating: true },
        _count: { rating: true },
      });
      await db.agent.update({
        where: { id: agentId },
        data: {
          rating: stats._avg.rating || 0,
          reviewCount: stats._count.rating,
        },
      });
    }

    if (agencyId) {
      const stats = await db.review.aggregate({
        where: { agencyId, approved: true },
        _avg: { rating: true },
        _count: { rating: true },
      });
      await db.agency.update({
        where: { id: agencyId },
        data: {
          rating: stats._avg.rating || 0,
          reviewCount: stats._count.rating,
        },
      });
    }

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Review error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}