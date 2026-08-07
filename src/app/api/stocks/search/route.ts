import { searchStocks } from "@/lib/stocks";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const quotes = await searchStocks(query);

    return NextResponse.json(
      {
        success: true,
        data: {
          query,
          quotes,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to search stocks:", error);

    return NextResponse.json(
      {
        success: false,
        error: "搜索股票失败，请稍后再试",
      },
      { status: 500 }
    );
  }
}
