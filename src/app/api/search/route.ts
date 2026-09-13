import { NextResponse } from "next/server";
import { searchProperties } from "@/lib/search";
import { searchSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const params: Record<string, unknown> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const result = searchSchema.safeParse(params);

    if (!result.success) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const searchResult = await searchProperties(result.data);

    return NextResponse.json({
      success: true,
      data: searchResult.items,
      pagination: {
        page: searchResult.page,
        limit: searchResult.limit,
        total: searchResult.total,
        totalPages: searchResult.totalPages,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la recherche" },
      { status: 500 }
    );
  }
}
