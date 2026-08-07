import StockDetailBoard from "@/components/stocks/StockDetailBoard";
import { normalizeSymbol } from "@/lib/stocks";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const decodedSymbol = decodeURIComponent(symbol);
  const normalized = normalizeSymbol(decodedSymbol);

  if (!normalized) {
    notFound();
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
        <Link
          href="/jtool/stocks"
          className="inline-flex rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800"
        >
          返回股票列表
        </Link>
      </div>
      <StockDetailBoard initialSymbol={normalized.symbol} />
    </div>
  );
}
