import { getStockMarketSnapshot, parseSymbolsParam } from "@/lib/stocks";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const symbols = parseSymbolsParam(request.nextUrl.searchParams.get("symbols"));

  if (symbols.length === 0) {
    return NextResponse.json(
      { error: "请至少提供一个有效的股票代码" },
      { status: 400 }
    );
  }

  try {
    const snapshot = await getStockMarketSnapshot(symbols);

    return NextResponse.json(
      {
        success: true,
        data: snapshot,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch stock quotes:", error);

    return NextResponse.json(
      {
        success: false,
        error: "获取行情数据失败，请稍后再试",
      },
      { status: 500 }
    );
  }
}
