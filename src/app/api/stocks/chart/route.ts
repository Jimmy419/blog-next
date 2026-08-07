import { getStockChartSnapshot, normalizeSymbol } from "@/lib/stocks";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const symbolParam = request.nextUrl.searchParams.get("symbol");
  const normalized = symbolParam ? normalizeSymbol(symbolParam) : null;

  if (!normalized) {
    return NextResponse.json(
      { success: false, error: "请提供有效的股票代码" },
      { status: 400 }
    );
  }

  try {
    const chart = await getStockChartSnapshot(normalized.symbol);

    return NextResponse.json(
      {
        success: true,
        data: chart,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch stock chart:", error);

    return NextResponse.json(
      {
        success: false,
        error: "获取图表数据失败，请稍后再试",
      },
      { status: 500 }
    );
  }
}
