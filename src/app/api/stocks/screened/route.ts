import { getStockScreeningSnapshot } from "@/lib/stocks";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function toOptionalNumber(value: string | null) {
  if (value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const snapshot = await getStockScreeningSnapshot({
      trendLookbackDays: toOptionalNumber(searchParams.get("trendLookbackDays")),
      ma20LookbackDays: toOptionalNumber(searchParams.get("ma20LookbackDays")),
      ma60MinChangePercent: toOptionalNumber(searchParams.get("ma60MinChangePercent")),
      ma60MaxChangePercent: toOptionalNumber(searchParams.get("ma60MaxChangePercent")),
      ma20MinChangePercent: toOptionalNumber(searchParams.get("ma20MinChangePercent")),
      priceVsMa60MinPercent: toOptionalNumber(searchParams.get("priceVsMa60MinPercent")),
      dividendLookbackYears: toOptionalNumber(searchParams.get("dividendLookbackYears")),
      minDividendCount: toOptionalNumber(searchParams.get("minDividendCount")),
      maxDividendGapYears: toOptionalNumber(searchParams.get("maxDividendGapYears")),
      latestDividendWithinYears: toOptionalNumber(searchParams.get("latestDividendWithinYears")),
      universeSize: toOptionalNumber(searchParams.get("universeSize")),
    });

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
    console.error("Failed to fetch screened stocks:", error);

    return NextResponse.json(
      {
        success: false,
        error: "获取量化筛选结果失败，请稍后再试",
      },
      { status: 500 }
    );
  }
}
