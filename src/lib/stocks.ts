type MarketCode = "SH" | "SZ" | "BJ";

type EastMoneyDiffItem = {
  f2?: number | string;
  f3?: number | string;
  f4?: number | string;
  f5?: number | string;
  f6?: number | string;
  f8?: number | string;
  f12?: string;
  f14?: string;
  f15?: number | string;
  f16?: number | string;
  f17?: number | string;
  f18?: number | string;
};

type EastMoneyResponse = {
  data?: {
    diff?: EastMoneyDiffItem[];
  };
};

export type StockQuote = {
  symbol: string;
  code: string;
  name: string;
  market: MarketCode;
  lastPrice: number | null;
  changePercent: number | null;
  changeAmount: number | null;
  openPrice: number | null;
  highPrice: number | null;
  lowPrice: number | null;
  prevClose: number | null;
  volume: number | null;
  amount: number | null;
  turnoverRate: number | null;
};

export type MarketIndex = {
  symbol: string;
  name: string;
  lastPrice: number | null;
  changePercent: number | null;
  changeAmount: number | null;
};

export type StockMarketSnapshot = {
  indices: MarketIndex[];
  quotes: StockQuote[];
  refreshedAt: string;
  source: string;
  cached: boolean;
};

export type IntradayPoint = {
  time: string;
  lastPrice: number;
  averagePrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  amount: number;
};

export type KlinePoint = {
  date: string;
  openPrice: number;
  closePrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  amount: number;
  amplitude: number | null;
  changePercent: number | null;
  changeAmount: number | null;
  turnoverRate: number | null;
};

export type StockChartSnapshot = {
  symbol: string;
  code: string;
  market: MarketCode;
  name: string;
  intraday: IntradayPoint[];
  intraday5d: IntradayPoint[];
  dayCandles: KlinePoint[];
  weekCandles: KlinePoint[];
  monthCandles: KlinePoint[];
  refreshedAt: string;
  source: string;
  cached: boolean;
};

export type OrderBookLevel = {
  level: number;
  buyPrice: number | null;
  buyVolume: number | null;
  sellPrice: number | null;
  sellVolume: number | null;
};

export type TradeDetail = {
  time: string;
  price: number;
  volume: number;
  orderCount: number;
  side: "buy" | "sell" | "neutral";
};

export type StockDetailSnapshot = {
  symbol: string;
  code: string;
  market: MarketCode;
  name: string;
  orderBook: OrderBookLevel[];
  recentTrades: TradeDetail[];
  refreshedAt: string;
  source: string;
  cached: boolean;
};

export type StockScreeningRule = {
  key: string;
  label: string;
  description: string;
};

export type StockScreeningParams = {
  trendLookbackDays: number;
  ma20LookbackDays: number;
  ma60MinChangePercent: number;
  ma60MaxChangePercent: number;
  ma20MinChangePercent: number;
  priceVsMa60MinPercent: number;
  dividendLookbackYears: number;
  minDividendCount: number;
  maxDividendGapYears: number;
  latestDividendWithinYears: number;
  universeSize: number;
};

export type ScreenedStock = {
  quote: StockQuote;
  ma20Change5d: number;
  ma60Change20d: number;
  dividendCount6y: number;
  maxDividendGapYears: number;
  latestDividendReportYear: number | null;
  annualDividendYield: number | null;
  annualCashDividendPer10: number | null;
  matchedRules: string[];
};

export type StockScreeningSnapshot = {
  reportDate: string;
  universeSize: number;
  results: ScreenedStock[];
  params: StockScreeningParams;
  rules: StockScreeningRule[];
  refreshedAt: string;
  source: string;
  cached: boolean;
};

type EastMoneySuggestItem = {
  Code?: string;
  Name?: string;
  QuoteID?: string;
  SecurityTypeName?: string;
  Classify?: string;
};

type EastMoneySuggestResponse = {
  QuotationCodeTable?: {
    Data?: EastMoneySuggestItem[];
  };
};

type EastMoneyDatacenterResponse<T> = {
  result?: {
    data?: T[];
    pages?: number;
  };
};

type EastMoneyDividendItem = {
  SECURITY_CODE?: string;
  SECURITY_NAME_ABBR?: string;
  REPORT_DATE?: string;
  ASSIGN_PROGRESS?: string;
  PRETAX_BONUS_RMB?: number | string;
  DIVIDENT_RATIO?: number | string;
  EX_DIVIDEND_DATE?: string;
  NOTICE_DATE?: string;
  PLAN_NOTICE_DATE?: string;
  IMPL_PLAN_PROFILE?: string;
};

const EAST_MONEY_API =
  "https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&fid=f3&np=1&pi=0&pz=50";
const CACHE_TTL_MS = 15_000;
const DEFAULT_SYMBOLS = ["600519", "000001", "300750", "601318", "688981"];
const MAJOR_INDICES = [
  { code: "000001", market: "SH" as const, name: "上证指数" },
  { code: "399001", market: "SZ" as const, name: "深证成指" },
  { code: "399006", market: "SZ" as const, name: "创业板指" },
];

const snapshotCache = new Map<
  string,
  { expiresAt: number; value: Omit<StockMarketSnapshot, "cached"> }
>();
const chartCache = new Map<
  string,
  { expiresAt: number; value: Omit<StockChartSnapshot, "cached"> }
>();
const detailCache = new Map<
  string,
  { expiresAt: number; value: Omit<StockDetailSnapshot, "cached"> }
>();
const searchCache = new Map<
  string,
  { expiresAt: number; value: StockQuote[] }
>();
const screeningCache = new Map<
  string,
  { expiresAt: number; value: Omit<StockScreeningSnapshot, "cached"> }
>();
const CHART_CACHE_TTL_MS = 60_000;
const DETAIL_CACHE_TTL_MS = 10_000;
const SEARCH_CACHE_TTL_MS = 30_000;
const SCREENING_CACHE_TTL_MS = 30 * 60_000;
const EAST_MONEY_SEARCH_TOKEN = "D43BF722C8E33BDC906FB84D85E326E8";
const DEFAULT_STOCK_SCREENING_PARAMS: StockScreeningParams = {
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

function normalizeScreeningParams(
  params?: Partial<StockScreeningParams>
): StockScreeningParams {
  return {
    trendLookbackDays: Math.max(
      5,
      Math.min(60, Math.round(params?.trendLookbackDays ?? DEFAULT_STOCK_SCREENING_PARAMS.trendLookbackDays))
    ),
    ma20LookbackDays: Math.max(
      1,
      Math.min(20, Math.round(params?.ma20LookbackDays ?? DEFAULT_STOCK_SCREENING_PARAMS.ma20LookbackDays))
    ),
    ma60MinChangePercent: Math.max(
      -20,
      Math.min(20, params?.ma60MinChangePercent ?? DEFAULT_STOCK_SCREENING_PARAMS.ma60MinChangePercent)
    ),
    ma60MaxChangePercent: Math.max(
      -20,
      Math.min(30, params?.ma60MaxChangePercent ?? DEFAULT_STOCK_SCREENING_PARAMS.ma60MaxChangePercent)
    ),
    ma20MinChangePercent: Math.max(
      -20,
      Math.min(20, params?.ma20MinChangePercent ?? DEFAULT_STOCK_SCREENING_PARAMS.ma20MinChangePercent)
    ),
    priceVsMa60MinPercent: Math.max(
      80,
      Math.min(120, params?.priceVsMa60MinPercent ?? DEFAULT_STOCK_SCREENING_PARAMS.priceVsMa60MinPercent)
    ),
    dividendLookbackYears: Math.max(
      3,
      Math.min(10, Math.round(params?.dividendLookbackYears ?? DEFAULT_STOCK_SCREENING_PARAMS.dividendLookbackYears))
    ),
    minDividendCount: Math.max(
      1,
      Math.min(10, Math.round(params?.minDividendCount ?? DEFAULT_STOCK_SCREENING_PARAMS.minDividendCount))
    ),
    maxDividendGapYears: Math.max(
      1,
      Math.min(5, Math.round(params?.maxDividendGapYears ?? DEFAULT_STOCK_SCREENING_PARAMS.maxDividendGapYears))
    ),
    latestDividendWithinYears: Math.max(
      1,
      Math.min(5, Math.round(params?.latestDividendWithinYears ?? DEFAULT_STOCK_SCREENING_PARAMS.latestDividendWithinYears))
    ),
    universeSize: Math.max(
      10,
      Math.min(80, Math.round(params?.universeSize ?? DEFAULT_STOCK_SCREENING_PARAMS.universeSize))
    ),
  };
}

function buildScreeningRules(params: StockScreeningParams): StockScreeningRule[] {
  return [
    {
      key: "trend",
      label: "均线平稳或拐头向上",
      description:
        `以日线为准，MA60 近 ${params.trendLookbackDays} 个交易日变化率需在 ` +
        `${params.ma60MinChangePercent}% 到 ${params.ma60MaxChangePercent}% 之间，` +
        `MA20 近 ${params.ma20LookbackDays} 个交易日变化率不低于 ${params.ma20MinChangePercent}%，` +
        `且现价不低于 MA60 的 ${params.priceVsMa60MinPercent}%。`,
    },
    {
      key: "dividend",
      label: "分红至少两年一次",
      description:
        `统计最近 ${params.dividendLookbackYears} 个报告年，现金分红实施年份至少 ` +
        `${params.minDividendCount} 次，相邻两次分红年份间隔不超过 ${params.maxDividendGapYears} 年，` +
        `最近一次分红不早于近 ${params.latestDividendWithinYears} 个报告年。`,
    },
  ];
}
const EAST_MONEY_HEADERS = {
  Referer: "https://quote.eastmoney.com/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
};

type EastMoneyTrendResponse = {
  data?: {
    code?: string;
    name?: string;
    market?: number;
    trends?: string[];
  };
};

type EastMoneyKlineResponse = {
  data?: {
    code?: string;
    name?: string;
    market?: number;
    klines?: string[];
  };
};

type EastMoneyDetailResponse = {
  data?: {
    code?: string;
    market?: number;
    decimal?: number;
    prePrice?: number;
    details?: string[];
  };
};

function toNumber(value: number | string | undefined): number | null {
  if (value === undefined || value === null || value === "" || value === "-") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function inferMarketFromCode(code: string): MarketCode | null {
  if (/^(6|5|9)/.test(code)) {
    return "SH";
  }

  if (/^(0|3)/.test(code)) {
    return "SZ";
  }

  if (/^(4|8)/.test(code)) {
    return "BJ";
  }

  return null;
}

function toIsoDate(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const matched = value.match(/\d{4}-\d{2}-\d{2}/);
  return matched?.[0] ?? null;
}

export function normalizeSymbol(input: string): {
  code: string;
  market: MarketCode;
  symbol: string;
  secid: string;
} | null {
  const raw = input.trim().toUpperCase();
  if (!raw) {
    return null;
  }

  const prefixedMatch = raw.match(/^(SH|SZ|BJ)(\d{6})$/);
  if (prefixedMatch) {
    const market = prefixedMatch[1] as MarketCode;
    const code = prefixedMatch[2];
    return {
      code,
      market,
      symbol: `${code}.${market}`,
      secid: `${market === "SH" ? "1" : "0"}.${code}`,
    };
  }

  const suffixedMatch = raw.match(/^(\d{6})\.(SH|SZ|BJ)$/);
  if (suffixedMatch) {
    const code = suffixedMatch[1];
    const market = suffixedMatch[2] as MarketCode;
    return {
      code,
      market,
      symbol: `${code}.${market}`,
      secid: `${market === "SH" ? "1" : "0"}.${code}`,
    };
  }

  if (/^\d{6}$/.test(raw)) {
    const market = inferMarketFromCode(raw);
    if (!market) {
      return null;
    }

    return {
      code: raw,
      market,
      symbol: `${raw}.${market}`,
      secid: `${market === "SH" ? "1" : "0"}.${raw}`,
    };
  }

  return null;
}

export function parseSymbolsParam(symbolsParam: string | null): string[] {
  const inputSymbols = symbolsParam
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const candidateSymbols =
    inputSymbols && inputSymbols.length > 0 ? inputSymbols : DEFAULT_SYMBOLS;

  const uniqueSymbols = new Map<string, string>();

  for (const candidate of candidateSymbols) {
    const normalized = normalizeSymbol(candidate);
    if (!normalized) {
      continue;
    }

    uniqueSymbols.set(normalized.symbol, normalized.symbol);
  }

  return Array.from(uniqueSymbols.values());
}

function buildSecids(symbols: string[]) {
  return symbols
    .map((symbol) => normalizeSymbol(symbol))
    .filter(
      (
        item
      ): item is {
        code: string;
        market: MarketCode;
        symbol: string;
        secid: string;
      } => Boolean(item)
    )
    .map((item) => item.secid);
}

async function fetchEastMoneyJson<T>(url: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: EAST_MONEY_HEADERS,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`EastMoney request failed with status ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;

      if (attempt < 2) {
        await sleep(300 * (attempt + 1));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("EastMoney request failed");
}

async function fetchEastMoneyDatacenter<T>(
  params: Record<string, string>
): Promise<EastMoneyDatacenterResponse<T>> {
  const searchParams = new URLSearchParams({
    columns: "ALL",
    quoteColumns: "",
    source: "WEB",
    client: "WEB",
    ...params,
  });

  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(
        `https://datacenter-web.eastmoney.com/api/data/v1/get?${searchParams.toString()}`,
        {
          headers: {
            Referer: "https://data.eastmoney.com/",
            "User-Agent": EAST_MONEY_HEADERS["User-Agent"],
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `EastMoney datacenter request failed with status ${response.status}`
        );
      }

      return (await response.json()) as EastMoneyDatacenterResponse<T>;
    } catch (error) {
      lastError = error;

      if (attempt < 2) {
        await sleep(300 * (attempt + 1));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("EastMoney datacenter request failed");
}

function inferMarketFromSecid(secid: string): MarketCode {
  if (secid.startsWith("1.")) {
    return "SH";
  }

  return "SZ";
}

function parseTrendLine(line: string): IntradayPoint | null {
  const [
    time,
    _openPrice,
    closePrice,
    highPrice,
    lowPrice,
    volume,
    amount,
    averagePrice,
  ] = line.split(",");

  const lastPriceNumber = toNumber(closePrice);
  const averagePriceNumber = toNumber(averagePrice);
  const highPriceNumber = toNumber(highPrice);
  const lowPriceNumber = toNumber(lowPrice);
  const volumeNumber = toNumber(volume);
  const amountNumber = toNumber(amount);

  if (
    !time ||
    lastPriceNumber === null ||
    averagePriceNumber === null ||
    highPriceNumber === null ||
    lowPriceNumber === null ||
    volumeNumber === null ||
    amountNumber === null
  ) {
    return null;
  }

  return {
    time,
    lastPrice: lastPriceNumber,
    averagePrice: averagePriceNumber,
    highPrice: highPriceNumber,
    lowPrice: lowPriceNumber,
    volume: volumeNumber,
    amount: amountNumber,
  };
}

function parseKlineLine(line: string): KlinePoint | null {
  const [
    date,
    openPrice,
    closePrice,
    highPrice,
    lowPrice,
    volume,
    amount,
    amplitude,
    changePercent,
    changeAmount,
    turnoverRate,
  ] = line.split(",");

  const openPriceNumber = toNumber(openPrice);
  const closePriceNumber = toNumber(closePrice);
  const highPriceNumber = toNumber(highPrice);
  const lowPriceNumber = toNumber(lowPrice);
  const volumeNumber = toNumber(volume);
  const amountNumber = toNumber(amount);

  if (
    !date ||
    openPriceNumber === null ||
    closePriceNumber === null ||
    highPriceNumber === null ||
    lowPriceNumber === null ||
    volumeNumber === null ||
    amountNumber === null
  ) {
    return null;
  }

  return {
    date,
    openPrice: openPriceNumber,
    closePrice: closePriceNumber,
    highPrice: highPriceNumber,
    lowPrice: lowPriceNumber,
    volume: volumeNumber,
    amount: amountNumber,
    amplitude: toNumber(amplitude),
    changePercent: toNumber(changePercent),
    changeAmount: toNumber(changeAmount),
    turnoverRate: toNumber(turnoverRate),
  };
}

function parseTradeSide(value: string | undefined): TradeDetail["side"] {
  if (value === "1") {
    return "buy";
  }

  if (value === "2") {
    return "sell";
  }

  return "neutral";
}

function parseTradeDetailLine(line: string): TradeDetail | null {
  const [time, price, volume, orderCount, side] = line.split(",");
  const priceNumber = toNumber(price);
  const volumeNumber = toNumber(volume);
  const orderCountNumber = toNumber(orderCount);

  if (
    !time ||
    priceNumber === null ||
    volumeNumber === null ||
    orderCountNumber === null
  ) {
    return null;
  }

  return {
    time,
    price: priceNumber,
    volume: volumeNumber,
    orderCount: orderCountNumber,
    side: parseTradeSide(side),
  };
}

function formatSinaSymbol(symbol: string) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    throw new Error("Invalid stock symbol");
  }

  return `${normalized.market.toLowerCase()}${normalized.code}`;
}

async function fetchSinaOrderBook(symbol: string) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    throw new Error("Invalid stock symbol");
  }

  const sinaSymbol = formatSinaSymbol(symbol);
  const response = await fetch(`https://hq.sinajs.cn/list=${sinaSymbol}`, {
    headers: {
      Referer: "https://finance.sina.com.cn/",
      "User-Agent": EAST_MONEY_HEADERS["User-Agent"],
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Sina request failed with status ${response.status}`);
  }

  const rawBuffer = await response.arrayBuffer();
  const rawText = new TextDecoder("gbk").decode(rawBuffer);
  const matched = rawText.match(/="([^"]*)"/);
  const payload = matched?.[1] ?? "";
  const fields = payload.split(",");

  if (fields.length < 30) {
    throw new Error("Sina order book payload is invalid");
  }

  const orderBook: OrderBookLevel[] = Array.from({ length: 5 }, (_, index) => {
    const buyVolume = toNumber(fields[10 + index * 2]);
    const buyPrice = toNumber(fields[11 + index * 2]);
    const sellVolume = toNumber(fields[20 + index * 2]);
    const sellPrice = toNumber(fields[21 + index * 2]);

    return {
      level: 5 - index,
      buyPrice,
      buyVolume,
      sellPrice,
      sellVolume,
    };
  }).reverse();

  return {
    name: fields[0] || normalized.symbol,
    orderBook,
  };
}

async function fetchEastMoneyTradeDetails(symbol: string) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    throw new Error("Invalid stock symbol");
  }

  const url =
    `https://push2.eastmoney.com/api/qt/stock/details/get?secid=${normalized.secid}` +
    "&pos=-20&fields1=f1,f2,f3,f4&fields2=f51,f52,f53,f54,f55";
  const payload = await fetchEastMoneyJson<EastMoneyDetailResponse>(url);

  return (payload.data?.details ?? [])
    .map((item) => parseTradeDetailLine(item))
    .filter((item): item is TradeDetail => Boolean(item));
}

async function fetchEastMoneyBatch(secids: string[]): Promise<EastMoneyDiffItem[]> {
  if (secids.length === 0) {
    return [];
  }

  const fields = [
    "f2",
    "f3",
    "f4",
    "f5",
    "f6",
    "f8",
    "f12",
    "f14",
    "f15",
    "f16",
    "f17",
    "f18",
  ].join(",");

  const url = `${EAST_MONEY_API}&fields=${fields}&secids=${secids.join(",")}`;
  const payload = await fetchEastMoneyJson<EastMoneyResponse>(url);
  return payload.data?.diff ?? [];
}

function toStockQuote(item: EastMoneyDiffItem): StockQuote | null {
  if (!item.f12) {
    return null;
  }

  const normalized = normalizeSymbol(item.f12);
  if (!normalized) {
    return null;
  }

  return {
    symbol: normalized.symbol,
    code: normalized.code,
    name: item.f14 ?? normalized.symbol,
    market: normalized.market,
    lastPrice: toNumber(item.f2),
    changePercent: toNumber(item.f3),
    changeAmount: toNumber(item.f4),
    volume: toNumber(item.f5),
    amount: toNumber(item.f6),
    turnoverRate: toNumber(item.f8),
    highPrice: toNumber(item.f15),
    lowPrice: toNumber(item.f16),
    openPrice: toNumber(item.f17),
    prevClose: toNumber(item.f18),
  };
}

function toMarketIndex(item: EastMoneyDiffItem): MarketIndex | null {
  if (!item.f12) {
    return null;
  }

  const normalized = normalizeSymbol(item.f12);
  if (!normalized) {
    return null;
  }

  const indexMeta = MAJOR_INDICES.find(
    (indexItem) =>
      indexItem.code === normalized.code && indexItem.market === normalized.market
  );

  return {
    symbol: normalized.symbol,
    name: item.f14 ?? indexMeta?.name ?? normalized.symbol,
    lastPrice: toNumber(item.f2),
    changePercent: toNumber(item.f3),
    changeAmount: toNumber(item.f4),
  };
}

export async function getStockMarketSnapshot(
  symbols: string[]
): Promise<StockMarketSnapshot> {
  const normalizedSymbols = parseSymbolsParam(symbols.join(","));
  const cacheKey = normalizedSymbols.join(",");
  const cachedItem = snapshotCache.get(cacheKey);

  if (cachedItem && cachedItem.expiresAt > Date.now()) {
    return {
      ...cachedItem.value,
      cached: true,
    };
  }

  const quoteSecids = buildSecids(normalizedSymbols);
  const indexSecids = MAJOR_INDICES.map(
    (item) => `${item.market === "SH" ? "1" : "0"}.${item.code}`
  );

  const [quoteItems, indexItems] = await Promise.all([
    fetchEastMoneyBatch(quoteSecids),
    fetchEastMoneyBatch(indexSecids),
  ]);

  const snapshotBase = {
    source: "EastMoney public quote endpoint",
    refreshedAt: new Date().toISOString(),
    quotes: quoteItems
      .map((item) => toStockQuote(item))
      .filter((item): item is StockQuote => Boolean(item)),
    indices: indexItems
      .map((item) => toMarketIndex(item))
      .filter((item): item is MarketIndex => Boolean(item)),
  };

  snapshotCache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    value: snapshotBase,
  });

  return {
    ...snapshotBase,
    cached: false,
  };
}

async function fetchIntradayChart(symbol: string, ndays: 1 | 5) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    throw new Error("Invalid stock symbol");
  }

  const url =
    `https://push2his.eastmoney.com/api/qt/stock/trends2/get?secid=${normalized.secid}` +
    "&fields1=f1,f2,f3,f4,f5,f6,f7,f8" +
    "&fields2=f51,f52,f53,f54,f55,f56,f57,f58" +
    `&ndays=${ndays}&iscr=0&iscca=0`;

  const payload = await fetchEastMoneyJson<EastMoneyTrendResponse>(url);
  const rawTrends = payload.data?.trends ?? [];

  return {
    code: payload.data?.code ?? normalized.code,
    name: payload.data?.name ?? normalized.symbol,
    market: inferMarketFromSecid(normalized.secid),
    intraday: rawTrends
      .map((item) => parseTrendLine(item))
      .filter((item): item is IntradayPoint => Boolean(item)),
  };
}

async function fetchKlineChart(symbol: string, klt: 101 | 102 | 103, limit: number) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    throw new Error("Invalid stock symbol");
  }

  const url =
    `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${normalized.secid}` +
    "&fields1=f1,f2,f3,f4,f5,f6" +
    "&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61" +
    `&klt=${klt}&fqt=1&lmt=${limit}&end=20500000`;

  const payload = await fetchEastMoneyJson<EastMoneyKlineResponse>(url);

  return {
    code: payload.data?.code ?? normalized.code,
    name: payload.data?.name ?? normalized.symbol,
    market: inferMarketFromSecid(normalized.secid),
    candles: (payload.data?.klines ?? [])
      .map((item) => parseKlineLine(item))
      .filter((item): item is KlinePoint => Boolean(item)),
  };
}

function calculateMovingAverageSeries(points: KlinePoint[], windowSize: number) {
  return points.map((_, index) => {
    if (index + 1 < windowSize) {
      return null;
    }

    const subset = points.slice(index + 1 - windowSize, index + 1);
    const total = subset.reduce((sum, item) => sum + item.closePrice, 0);
    return total / windowSize;
  });
}

function calculatePercentChange(current: number, previous: number) {
  if (previous === 0) {
    return 0;
  }

  return ((current - previous) / previous) * 100;
}

function extractYear(dateString: string | null) {
  if (!dateString) {
    return null;
  }

  const matched = dateString.match(/^(\d{4})-/);
  return matched ? Number(matched[1]) : null;
}

function getScreeningReportDates() {
  const currentYear = new Date().getFullYear();
  return [`${currentYear - 1}-12-31`, `${currentYear - 2}-12-31`];
}

async function fetchDividendUniverseByReportDate(reportDate: string, pageSize: number) {
  const payload = await fetchEastMoneyDatacenter<EastMoneyDividendItem>({
    sortColumns: "DIVIDENT_RATIO",
    sortTypes: "-1",
    pageSize: String(pageSize),
    pageNumber: "1",
    reportName: "RPT_SHAREBONUS_DET",
    filter: `(REPORT_DATE='${reportDate}')(ASSIGN_PROGRESS="实施分配")`,
    columns:
      "SECURITY_CODE,SECURITY_NAME_ABBR,REPORT_DATE,ASSIGN_PROGRESS,PRETAX_BONUS_RMB,DIVIDENT_RATIO",
  });

  return payload.result?.data ?? [];
}

async function fetchDividendHistory(symbol: string) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    throw new Error("Invalid stock symbol");
  }

  const payload = await fetchEastMoneyDatacenter<EastMoneyDividendItem>({
    sortColumns: "REPORT_DATE",
    sortTypes: "-1",
    pageSize: "50",
    pageNumber: "1",
    reportName: "RPT_SHAREBONUS_DET",
    filter: `(SECURITY_CODE="${normalized.code}")`,
    columns:
      "SECURITY_CODE,REPORT_DATE,ASSIGN_PROGRESS,PRETAX_BONUS_RMB,DIVIDENT_RATIO,EX_DIVIDEND_DATE,NOTICE_DATE,PLAN_NOTICE_DATE,IMPL_PLAN_PROFILE",
  });

  return payload.result?.data ?? [];
}

function computeTrendMetrics(candles: KlinePoint[], params: StockScreeningParams) {
  const ma20Series = calculateMovingAverageSeries(candles, 20);
  const ma60Series = calculateMovingAverageSeries(candles, 60);
  const latestIndex = candles.length - 1;
  const ma20Current = ma20Series[latestIndex];
  const ma20Past = ma20Series[latestIndex - params.ma20LookbackDays];
  const ma60Current = ma60Series[latestIndex];
  const ma60Past = ma60Series[latestIndex - params.trendLookbackDays];
  const latestClose = candles[latestIndex]?.closePrice ?? null;

  if (
    ma20Current === null ||
    ma20Past === null ||
    ma60Current === null ||
    ma60Past === null ||
    latestClose === null
  ) {
    return null;
  }

  const ma20Change5d = calculatePercentChange(ma20Current, ma20Past);
  const ma60Change20d = calculatePercentChange(ma60Current, ma60Past);
  const passedTrend =
    ma60Change20d >= params.ma60MinChangePercent &&
    ma60Change20d <= params.ma60MaxChangePercent &&
    ma20Change5d >= params.ma20MinChangePercent &&
    latestClose >= ma60Current * (params.priceVsMa60MinPercent / 100);

  return {
    ma20Change5d,
    ma60Change20d,
    passedTrend,
  };
}

function computeDividendMetrics(
  records: EastMoneyDividendItem[],
  params: StockScreeningParams
) {
  const currentYear = new Date().getFullYear();
  const validYears = Array.from(
    new Set(
      records
        .filter((item) => {
          const reportYear = extractYear(toIsoDate(item.REPORT_DATE));
          const cashDividend = toNumber(item.PRETAX_BONUS_RMB);
          const progress = item.ASSIGN_PROGRESS ?? "";

          return (
            reportYear !== null &&
            reportYear >= currentYear - params.dividendLookbackYears &&
            cashDividend !== null &&
            cashDividend > 0 &&
            progress.includes("实施")
          );
        })
        .map((item) => extractYear(toIsoDate(item.REPORT_DATE)))
        .filter((item): item is number => item !== null)
    )
  ).sort((a, b) => a - b);

  if (validYears.length === 0) {
    return {
      dividendCount6y: 0,
      maxDividendGapYears: Number.POSITIVE_INFINITY,
      latestDividendReportYear: null,
      passedDividend: false,
    };
  }

  let maxDividendGapYears = 0;
  for (let index = 1; index < validYears.length; index += 1) {
    maxDividendGapYears = Math.max(
      maxDividendGapYears,
      validYears[index] - validYears[index - 1]
    );
  }

  const latestDividendReportYear = validYears[validYears.length - 1] ?? null;
  const dividendCount6y = validYears.length;
  const passedDividend =
    dividendCount6y >= params.minDividendCount &&
    maxDividendGapYears <= params.maxDividendGapYears &&
    latestDividendReportYear !== null &&
    latestDividendReportYear >= currentYear - params.latestDividendWithinYears;

  return {
    dividendCount6y,
    maxDividendGapYears,
    latestDividendReportYear,
    passedDividend,
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
) {
  const results = new Array<R>(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const targetIndex = currentIndex;
      currentIndex += 1;
      results[targetIndex] = await mapper(items[targetIndex]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );

  return results;
}

export async function getStockChartSnapshot(
  symbol: string
): Promise<StockChartSnapshot> {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    throw new Error("Invalid stock symbol");
  }

  const cacheKey = normalized.symbol;
  const cachedItem = chartCache.get(cacheKey);

  if (cachedItem && cachedItem.expiresAt > Date.now()) {
    return {
      ...cachedItem.value,
      cached: true,
    };
  }

  const [intradayResult, intraday5dResult, dayResult, weekResult, monthResult] = await Promise.all([
    fetchIntradayChart(normalized.symbol, 1),
    fetchIntradayChart(normalized.symbol, 5),
    fetchKlineChart(normalized.symbol, 101, 240),
    fetchKlineChart(normalized.symbol, 102, 156),
    fetchKlineChart(normalized.symbol, 103, 120),
  ]);

  const chartBase = {
    symbol: normalized.symbol,
    code: normalized.code,
    market: normalized.market,
    name:
      intradayResult.name !== normalized.symbol
        ? intradayResult.name
        : dayResult.name !== normalized.symbol
        ? dayResult.name
        : normalized.symbol,
    intraday: intradayResult.intraday,
    intraday5d: intraday5dResult.intraday,
    dayCandles: dayResult.candles,
    weekCandles: weekResult.candles,
    monthCandles: monthResult.candles,
    refreshedAt: new Date().toISOString(),
    source: "EastMoney public trend and kline endpoints",
  };

  chartCache.set(cacheKey, {
    expiresAt: Date.now() + CHART_CACHE_TTL_MS,
    value: chartBase,
  });

  return {
    ...chartBase,
    cached: false,
  };
}

export async function getStockDetailSnapshot(
  symbol: string
): Promise<StockDetailSnapshot> {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    throw new Error("Invalid stock symbol");
  }

  const cacheKey = normalized.symbol;
  const cachedItem = detailCache.get(cacheKey);

  if (cachedItem && cachedItem.expiresAt > Date.now()) {
    return {
      ...cachedItem.value,
      cached: true,
    };
  }

  const [orderBookResult, recentTrades] = await Promise.all([
    fetchSinaOrderBook(normalized.symbol),
    fetchEastMoneyTradeDetails(normalized.symbol),
  ]);

  const detailBase = {
    symbol: normalized.symbol,
    code: normalized.code,
    market: normalized.market,
    name: orderBookResult.name,
    orderBook: orderBookResult.orderBook,
    recentTrades,
    refreshedAt: new Date().toISOString(),
    source: "Sina public quote endpoint + EastMoney public detail endpoint",
  };

  detailCache.set(cacheKey, {
    expiresAt: Date.now() + DETAIL_CACHE_TTL_MS,
    value: detailBase,
  });

  return {
    ...detailBase,
    cached: false,
  };
}

export async function getStockScreeningSnapshot(
  inputParams?: Partial<StockScreeningParams>
): Promise<StockScreeningSnapshot> {
  const params = normalizeScreeningParams(inputParams);
  const rules = buildScreeningRules(params);
  const reportDates = getScreeningReportDates();
  const cacheKey = `screening-v3:${reportDates.join(",")}:${JSON.stringify(params)}`;
  const cachedItem = screeningCache.get(cacheKey);

  if (cachedItem && cachedItem.expiresAt > Date.now()) {
    return {
      ...cachedItem.value,
      cached: true,
    };
  }

  let reportDate = reportDates[0];
  let universeItems: EastMoneyDividendItem[] = [];

  for (const candidateReportDate of reportDates) {
    const candidateItems = await fetchDividendUniverseByReportDate(
      candidateReportDate,
      params.universeSize
    );

    if (candidateItems.length > 0) {
      reportDate = candidateReportDate;
      universeItems = candidateItems;
      break;
    }
  }

  const candidateSymbols = Array.from(
    new Set(
      universeItems
        .map((item) => item.SECURITY_CODE)
        .filter((item): item is string => Boolean(item))
        .map((item) => normalizeSymbol(item))
        .filter(
          (
            item
          ): item is {
            code: string;
            market: MarketCode;
            symbol: string;
            secid: string;
          } => Boolean(item)
        )
        .map((item) => item.symbol)
    )
  ).slice(0, params.universeSize);

  if (candidateSymbols.length === 0) {
    const emptyBase = {
      reportDate,
      universeSize: 0,
      results: [],
      params,
      rules,
      refreshedAt: new Date().toISOString(),
      source:
        "EastMoney dividend detail endpoint + EastMoney daily kline endpoint + EastMoney quote endpoint",
    };

    screeningCache.set(cacheKey, {
      expiresAt: Date.now() + SCREENING_CACHE_TTL_MS,
      value: emptyBase,
    });

    return {
      ...emptyBase,
      cached: false,
    };
  }

  const annualUniverseMap = new Map(
    universeItems
      .map((item) => {
        const normalized = item.SECURITY_CODE ? normalizeSymbol(item.SECURITY_CODE) : null;

        if (!normalized) {
          return null;
        }

        return [
          normalized.symbol,
          {
            name: item.SECURITY_NAME_ABBR ?? normalized.symbol,
            annualDividendYield: toNumber(item.DIVIDENT_RATIO),
            annualCashDividendPer10: toNumber(item.PRETAX_BONUS_RMB),
          },
        ] as const;
      })
      .filter(
        (
          item
        ): item is readonly [
          string,
          {
            name: string;
            annualDividendYield: number | null;
            annualCashDividendPer10: number | null;
          }
        ] => Boolean(item)
      )
  );

  const screenedResults = await mapWithConcurrency(candidateSymbols, 2, async (symbol) => {
    try {
      const [dayResult, dividendHistory] = await Promise.all([
        fetchKlineChart(symbol, 101, 160),
        fetchDividendHistory(symbol),
      ]);
      const trendMetrics = computeTrendMetrics(dayResult.candles, params);
      const dividendMetrics = computeDividendMetrics(dividendHistory, params);

      if (!trendMetrics || !trendMetrics.passedTrend || !dividendMetrics.passedDividend) {
        return null;
      }

      const annualUniverseMetrics = annualUniverseMap.get(symbol);
      const latestCandle = dayResult.candles[dayResult.candles.length - 1];

      if (!latestCandle) {
        return null;
      }

      const normalized = normalizeSymbol(symbol);
      if (!normalized) {
        return null;
      }

      const quote: StockQuote = {
        symbol: normalized.symbol,
        code: normalized.code,
        name: annualUniverseMetrics?.name ?? normalized.symbol,
        market: normalized.market,
        lastPrice: latestCandle.closePrice,
        changePercent: latestCandle.changePercent,
        changeAmount: latestCandle.changeAmount,
        openPrice: latestCandle.openPrice,
        highPrice: latestCandle.highPrice,
        lowPrice: latestCandle.lowPrice,
        prevClose:
          latestCandle.changeAmount === null
            ? null
            : latestCandle.closePrice - latestCandle.changeAmount,
        volume: latestCandle.volume,
        amount: latestCandle.amount,
        turnoverRate: latestCandle.turnoverRate,
      };

      return {
        quote,
        ma20Change5d: trendMetrics.ma20Change5d,
        ma60Change20d: trendMetrics.ma60Change20d,
        dividendCount6y: dividendMetrics.dividendCount6y,
        maxDividendGapYears: dividendMetrics.maxDividendGapYears,
        latestDividendReportYear: dividendMetrics.latestDividendReportYear,
        annualDividendYield: annualUniverseMetrics?.annualDividendYield ?? null,
        annualCashDividendPer10: annualUniverseMetrics?.annualCashDividendPer10 ?? null,
        matchedRules: rules.map((item) => item.label),
      } satisfies ScreenedStock;
    } catch {
      return null;
    }
  });

  const screeningBase = {
    reportDate,
    universeSize: candidateSymbols.length,
    results: screenedResults
      .filter((item): item is ScreenedStock => Boolean(item))
      .sort((left, right) => {
        if (right.dividendCount6y !== left.dividendCount6y) {
          return right.dividendCount6y - left.dividendCount6y;
        }

        if (left.maxDividendGapYears !== right.maxDividendGapYears) {
          return left.maxDividendGapYears - right.maxDividendGapYears;
        }

        return right.ma20Change5d - left.ma20Change5d;
      })
      .slice(0, 12),
    params,
    rules,
    refreshedAt: new Date().toISOString(),
    source:
      "EastMoney dividend detail endpoint + EastMoney daily kline endpoint + EastMoney quote endpoint",
  };

  screeningCache.set(cacheKey, {
    expiresAt: Date.now() + SCREENING_CACHE_TTL_MS,
    value: screeningBase,
  });

  return {
    ...screeningBase,
    cached: false,
  };
}

export async function searchStocks(query: string): Promise<StockQuote[]> {
  const trimmedQuery = query.trim();
  const cacheKey = trimmedQuery.toUpperCase();
  const cachedItem = searchCache.get(cacheKey);

  if (cachedItem && cachedItem.expiresAt > Date.now()) {
    return cachedItem.value;
  }

  if (!trimmedQuery) {
    const popularSnapshot = await getStockMarketSnapshot(DEFAULT_SYMBOLS);
    searchCache.set(cacheKey, {
      expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
      value: popularSnapshot.quotes,
    });
    return popularSnapshot.quotes;
  }

  const directSymbol = normalizeSymbol(trimmedQuery);
  const directMatches = directSymbol ? [directSymbol.symbol] : [];
  const url =
    "https://searchapi.eastmoney.com/api/suggest/get" +
    `?input=${encodeURIComponent(trimmedQuery)}` +
    "&type=14" +
    `&token=${EAST_MONEY_SEARCH_TOKEN}` +
    "&count=20";
  const payload = await fetchEastMoneyJson<EastMoneySuggestResponse>(url);
  const suggestedSymbols = (payload.QuotationCodeTable?.Data ?? [])
    .map((item) => item.Code)
    .filter((item): item is string => Boolean(item))
    .map((item) => normalizeSymbol(item))
    .filter(
      (
        item
      ): item is {
        code: string;
        market: MarketCode;
        symbol: string;
        secid: string;
      } => Boolean(item)
    )
    .map((item) => item.symbol);
  const symbols = Array.from(new Set([...directMatches, ...suggestedSymbols])).slice(
    0,
    20
  );

  if (symbols.length === 0) {
    searchCache.set(cacheKey, {
      expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
      value: [],
    });
    return [];
  }

  const snapshot = await getStockMarketSnapshot(symbols);
  const quotesBySymbol = new Map(snapshot.quotes.map((item) => [item.symbol, item]));
  const orderedQuotes = symbols
    .map((symbol) => quotesBySymbol.get(symbol))
    .filter((item): item is StockQuote => Boolean(item));

  searchCache.set(cacheKey, {
    expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
    value: orderedQuotes,
  });

  return orderedQuotes;
}
