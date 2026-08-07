"use client";

import type {
  StockQuote,
  StockScreeningParams,
  StockScreeningSnapshot,
} from "@/lib/stocks";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const QUICK_SYMBOLS = [
  { label: "贵州茅台", query: "贵州茅台" },
  { label: "平安银行", query: "平安银行" },
  { label: "宁德时代", query: "宁德时代" },
  { label: "中国平安", query: "中国平安" },
  { label: "中芯国际", query: "中芯国际" },
];
const DEFAULT_SCREENING_PARAMS: StockScreeningParams = {
  trendLookbackDays: 20,
  ma20LookbackDays: 5,
  ma60MinChangePercent: -3,
  ma60MaxChangePercent: 8,
  ma20MinChangePercent: 0,
  priceVsMa60MinPercent: 98,
  dividendLookbackYears: 6,
  minDividendCount: 3,
  maxDividendGapYears: 2,
  latestDividendWithinYears: 2,
  universeSize: 30,
};

type SearchResponse = {
  success: boolean;
  data?: {
    query: string;
    quotes: StockQuote[];
  };
  error?: string;
};

type ScreenedResponse = {
  success: boolean;
  data?: StockScreeningSnapshot;
  error?: string;
};

function formatPrice(value: number | null) {
  if (value === null) {
    return "--";
  }

  return value.toFixed(2);
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "--";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatAmount(value: number | null) {
  if (value === null) {
    return "--";
  }

  if (Math.abs(value) >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(2)} 亿`;
  }

  if (Math.abs(value) >= 10_000) {
    return `${(value / 10_000).toFixed(2)} 万`;
  }

  return value.toLocaleString("zh-CN");
}

function getColorClass(value: number | null) {
  if (value === null || value === 0) {
    return "text-slate-300";
  }

  return value > 0 ? "text-rose-400" : "text-emerald-400";
}

export default function StockMarketBoard() {
  const [inputValue, setInputValue] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [screening, setScreening] = useState<StockScreeningSnapshot | null>(null);
  const [screeningParams, setScreeningParams] =
    useState<StockScreeningParams>(DEFAULT_SCREENING_PARAMS);
  const [appliedScreeningParams, setAppliedScreeningParams] =
    useState<StockScreeningParams>(DEFAULT_SCREENING_PARAMS);
  const [loading, setLoading] = useState(true);
  const [screeningLoading, setScreeningLoading] = useState(true);
  const [error, setError] = useState("");
  const [screeningError, setScreeningError] = useState("");

  const fetchResults = useCallback(async (query: string) => {
    setLoading(true);

    try {
      const searchParams = new URLSearchParams();
      if (query.trim()) {
        searchParams.set("q", query.trim());
      }

      const response = await fetch(`/api/stocks/search?${searchParams.toString()}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as SearchResponse;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? "搜索股票失败");
      }

      setQuotes(payload.data.quotes);
      setActiveQuery(payload.data.query);
      setError("");
    } catch (fetchError) {
      setQuotes([]);
      setError(fetchError instanceof Error ? fetchError.message : "搜索股票失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchResults("");
  }, [fetchResults]);

  const fetchScreening = useCallback(async (params: StockScreeningParams) => {
    setScreeningLoading(true);

    try {
      const searchParams = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      );
      const response = await fetch(`/api/stocks/screened?${searchParams.toString()}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as ScreenedResponse;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? "获取量化筛选结果失败");
      }

      setScreening(payload.data);
      setScreeningError("");
    } catch (fetchError) {
      setScreening(null);
      setScreeningError(
        fetchError instanceof Error ? fetchError.message : "获取量化筛选结果失败"
      );
    } finally {
      setScreeningLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchScreening(appliedScreeningParams);
  }, [appliedScreeningParams, fetchScreening]);

  const pageTitle = useMemo(() => {
    return activeQuery.trim() ? `搜索结果：${activeQuery}` : "热门股票列表";
  }, [activeQuery]);

  return (
    <div className="min-h-[calc(100vh-68px)] bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6">
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-6 shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-blue-300">A 股搜索中心</p>
              <h1 className="text-3xl font-bold">搜索并浏览股票列表</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-300">
                支持按股票代码、名称或拼音搜索。点击列表中的任意一项，进入对应的股票详情页，
                查看分时、日 K、周 K、月 K 和盘口明细。
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              <p>搜索示例：600519、贵州茅台、gzmt</p>
              <p>详情地址：/jtool/stocks/[symbol]</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">股票搜索</h2>
              <p className="mt-1 text-sm text-slate-400">
                输入代码、名称或拼音后搜索，点击结果可进入趋势图详情页。
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void fetchResults(inputValue);
                  }
                }}
                placeholder="输入股票代码或名称"
                className="min-w-[240px] rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm outline-none transition focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => void fetchResults(inputValue)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                搜索股票
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputValue("");
                  void fetchResults("");
                }}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                查看热门
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_SYMBOLS.map((item) => (
              <button
                key={item.query}
                type="button"
                onClick={() => {
                  setInputValue(item.query);
                  void fetchResults(item.query);
                }}
                className="rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
              >
                {item.label}
              </button>
            ))}
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div>
            <h2 className="text-xl font-semibold">{pageTitle}</h2>
            <p className="mt-1 text-sm text-slate-400">
              共 {quotes.length} 只股票，点击表格行或按钮进入图表详情。
            </p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="px-3 py-3 font-medium">股票</th>
                  <th className="px-3 py-3 font-medium">最新价</th>
                  <th className="px-3 py-3 font-medium">涨跌幅</th>
                  <th className="px-3 py-3 font-medium">成交额</th>
                  <th className="px-3 py-3 font-medium">今开 / 昨收</th>
                  <th className="px-3 py-3 font-medium">最高 / 最低</th>
                  <th className="px-3 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-slate-400">
                      正在加载股票列表...
                    </td>
                  </tr>
                ) : null}

                {!loading && quotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-slate-400">
                      没有搜索到股票，请换一个关键词试试。
                    </td>
                  </tr>
                ) : null}

                {!loading
                  ? quotes.map((quote) => {
                      const detailHref = `/jtool/stocks/${encodeURIComponent(
                        quote.symbol
                      )}`;

                      return (
                        <tr key={quote.symbol} className="transition hover:bg-slate-800/40">
                          <td className="px-3 py-4">
                            <Link href={detailHref} className="block">
                              <p className="font-semibold text-slate-100">{quote.name}</p>
                              <p className="mt-1 text-xs text-slate-400">{quote.symbol}</p>
                            </Link>
                          </td>
                          <td
                            className={`px-3 py-4 font-semibold ${getColorClass(
                              quote.changePercent
                            )}`}
                          >
                            {formatPrice(quote.lastPrice)}
                          </td>
                          <td className={`px-3 py-4 ${getColorClass(quote.changePercent)}`}>
                            {formatPercent(quote.changePercent)}
                          </td>
                          <td className="px-3 py-4 text-slate-300">
                            {formatAmount(quote.amount)}
                          </td>
                          <td className="px-3 py-4 text-slate-300">
                            {formatPrice(quote.openPrice)} / {formatPrice(quote.prevClose)}
                          </td>
                          <td className="px-3 py-4 text-slate-300">
                            {formatPrice(quote.highPrice)} / {formatPrice(quote.lowPrice)}
                          </td>
                          <td className="px-3 py-4">
                            <Link
                              href={detailHref}
                              className="inline-flex rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:bg-slate-800"
                            >
                              查看详情
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  : null}
              </tbody>
            </table>
          </div>
        </section>

        {!activeQuery.trim() ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">按你的条件量化筛选</h2>
                <p className="mt-1 text-sm text-slate-400">
                  候选池来自最近年报已实施分红、股息率靠前的股票，再叠加均线趋势和分红频率规则筛选。
                </p>
              </div>

              <div className="text-sm text-slate-400">
                <p>候选报告期：{screening?.reportDate ?? "--"}</p>
                <p>候选股票数：{screening?.universeSize ?? 0}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {(screening?.rules ?? []).map((rule) => (
                <article
                  key={rule.key}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <p className="text-sm font-semibold text-slate-100">{rule.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {rule.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    key: "trendLookbackDays",
                    label: "MA60回看天数",
                    value: screeningParams.trendLookbackDays,
                  },
                  {
                    key: "ma20LookbackDays",
                    label: "MA20回看天数",
                    value: screeningParams.ma20LookbackDays,
                  },
                  {
                    key: "ma60MinChangePercent",
                    label: "MA60最小变化%",
                    value: screeningParams.ma60MinChangePercent,
                  },
                  {
                    key: "ma60MaxChangePercent",
                    label: "MA60最大变化%",
                    value: screeningParams.ma60MaxChangePercent,
                  },
                  {
                    key: "ma20MinChangePercent",
                    label: "MA20最小变化%",
                    value: screeningParams.ma20MinChangePercent,
                  },
                  {
                    key: "priceVsMa60MinPercent",
                    label: "现价最低占MA60%",
                    value: screeningParams.priceVsMa60MinPercent,
                  },
                  {
                    key: "dividendLookbackYears",
                    label: "分红回看年数",
                    value: screeningParams.dividendLookbackYears,
                  },
                  {
                    key: "minDividendCount",
                    label: "最少分红次数",
                    value: screeningParams.minDividendCount,
                  },
                  {
                    key: "maxDividendGapYears",
                    label: "最大分红间隔年",
                    value: screeningParams.maxDividendGapYears,
                  },
                  {
                    key: "latestDividendWithinYears",
                    label: "最近分红需在几年内",
                    value: screeningParams.latestDividendWithinYears,
                  },
                  {
                    key: "universeSize",
                    label: "候选池数量",
                    value: screeningParams.universeSize,
                  },
                ].map((item) => (
                  <label key={item.key} className="block">
                    <span className="mb-2 block text-xs text-slate-400">{item.label}</span>
                    <input
                      type="number"
                      value={item.value}
                      onChange={(event) => {
                        const nextValue = Number(event.target.value);
                        setScreeningParams((prev) => ({
                          ...prev,
                          [item.key]: Number.isFinite(nextValue) ? nextValue : 0,
                        }));
                      }}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setAppliedScreeningParams(screeningParams)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  应用参数重新筛选
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScreeningParams(DEFAULT_SCREENING_PARAMS);
                    setAppliedScreeningParams(DEFAULT_SCREENING_PARAMS);
                  }}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                >
                  恢复默认参数
                </button>
              </div>
            </div>

            {screeningError ? (
              <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {screeningError}
              </div>
            ) : null}

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="px-3 py-3 font-medium">股票</th>
                    <th className="px-3 py-3 font-medium">最新价</th>
                    <th className="px-3 py-3 font-medium">MA20 5日变化</th>
                    <th className="px-3 py-3 font-medium">MA60 20日变化</th>
                    <th className="px-3 py-3 font-medium">近6年分红次数</th>
                    <th className="px-3 py-3 font-medium">最大间隔</th>
                    <th className="px-3 py-3 font-medium">最近年报股息率</th>
                    <th className="px-3 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {screeningLoading ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-slate-400">
                        正在计算量化筛选结果...
                      </td>
                    </tr>
                  ) : null}

                  {!screeningLoading &&
                  !screeningError &&
                  (screening?.results.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-slate-400">
                        当前没有股票同时满足这两条量化规则，你可以继续调整阈值。
                      </td>
                    </tr>
                  ) : null}

                  {!screeningLoading
                    ? (screening?.results ?? []).map((item) => {
                        const detailHref = `/jtool/stocks/${encodeURIComponent(
                          item.quote.symbol
                        )}`;

                        return (
                          <tr key={item.quote.symbol} className="transition hover:bg-slate-800/40">
                            <td className="px-3 py-4">
                              <Link href={detailHref} className="block">
                                <p className="font-semibold text-slate-100">
                                  {item.quote.name}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {item.quote.symbol}
                                </p>
                              </Link>
                            </td>
                            <td
                              className={`px-3 py-4 font-semibold ${getColorClass(
                                item.quote.changePercent
                              )}`}
                            >
                              {formatPrice(item.quote.lastPrice)}
                            </td>
                            <td className="px-3 py-4 text-slate-300">
                              {formatPercent(item.ma20Change5d)}
                            </td>
                            <td className="px-3 py-4 text-slate-300">
                              {formatPercent(item.ma60Change20d)}
                            </td>
                            <td className="px-3 py-4 text-slate-300">
                              {item.dividendCount6y} 次
                            </td>
                            <td className="px-3 py-4 text-slate-300">
                              {item.maxDividendGapYears} 年
                            </td>
                            <td className="px-3 py-4 text-slate-300">
                              {item.annualDividendYield === null
                                ? "--"
                                : `${(item.annualDividendYield * 100).toFixed(2)}%`}
                            </td>
                            <td className="px-3 py-4">
                              <Link
                                href={detailHref}
                                className="inline-flex rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:bg-slate-800"
                              >
                                查看详情
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    : null}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
