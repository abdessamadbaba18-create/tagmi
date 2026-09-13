import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const categories = await db.blogCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            posts: { where: { published: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        postCount: c._count.posts,
      })),
    });
  } catch (error) {
    console.error("Blog categories error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}