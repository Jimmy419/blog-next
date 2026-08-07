"use client";

import type {
  IntradayPoint,
  KlinePoint,
  OrderBookLevel,
  StockChartSnapshot,
  StockDetailSnapshot,
  StockMarketSnapshot,
  StockQuote,
  TradeDetail,
} from "@/lib/stocks";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

const DEFAULT_WATCHLIST = [
  "600519.SH",
  "000001.SZ",
  "300750.SZ",
  "601318.SH",
  "688981.SH",
];
const STORAGE_KEY = "jimmy-stock-watchlist";
const CHART_TABS = [
  { key: "intraday", label: "分时" },
  { key: "day", label: "日K" },
  { key: "week", label: "周K" },
  { key: "month", label: "月K" },
] as const;
const INTRADAY_RANGE_TABS = [
  { key: "1d", label: "1日" },
  { key: "5d", label: "5日" },
] as const;
const KLINE_ZOOM_OPTIONS = {
  day: [60, 120, 240],
  week: [26, 52, 104, 156],
  month: [24, 60, 120],
} as const;

type ChartTabKey = (typeof CHART_TABS)[number]["key"];
type IntradayRangeKey = (typeof INTRADAY_RANGE_TABS)[number]["key"];
type KlineZoomKey = keyof typeof KLINE_ZOOM_OPTIONS;

type SnapshotResponse = {
  success: boolean;
  data?: StockMarketSnapshot;
  error?: string;
};

type ChartResponse = {
  success: boolean;
  data?: StockChartSnapshot;
  error?: string;
};

type DetailResponse = {
  success: boolean;
  data?: StockDetailSnapshot;
  error?: string;
};

function clamp(value: number, minValue: number, maxValue: number) {
  return Math.min(maxValue, Math.max(minValue, value));
}

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

function formatBookVolume(value: number | null) {
  if (value === null) {
    return "--";
  }

  if (Math.abs(value) >= 10_000) {
    return `${(value / 10_000).toFixed(2)} 万股`;
  }

  return `${value.toLocaleString("zh-CN")} 股`;
}

function formatTradeVolume(value: number | null) {
  if (value === null) {
    return "--";
  }

  if (Math.abs(value) >= 10_000) {
    return `${(value / 10_000).toFixed(2)} 万手`;
  }

  return `${value.toLocaleString("zh-CN")} 手`;
}

function getColorClass(value: number | null) {
  if (value === null || value === 0) {
    return "text-slate-300";
  }

  return value > 0 ? "text-rose-400" : "text-emerald-400";
}

function getTradeSideClass(side: TradeDetail["side"]) {
  if (side === "buy") {
    return "text-rose-400";
  }

  if (side === "sell") {
    return "text-emerald-400";
  }

  return "text-slate-300";
}

function getTradeSideLabel(side: TradeDetail["side"]) {
  if (side === "buy") {
    return "买盘";
  }

  if (side === "sell") {
    return "卖盘";
  }

  return "中性盘";
}

function normalizeInputSymbol(input: string) {
  const raw = input.trim().toUpperCase();

  if (!raw) {
    return null;
  }

  const prefixedMatch = raw.match(/^(SH|SZ|BJ)(\d{6})$/);
  if (prefixedMatch) {
    return `${prefixedMatch[2]}.${prefixedMatch[1]}`;
  }

  const suffixedMatch = raw.match(/^(\d{6})\.(SH|SZ|BJ)$/);
  if (suffixedMatch) {
    return `${suffixedMatch[1]}.${suffixedMatch[2]}`;
  }

  if (/^\d{6}$/.test(raw)) {
    if (/^(6|5|9)/.test(raw)) {
      return `${raw}.SH`;
    }

    if (/^(0|3)/.test(raw)) {
      return `${raw}.SZ`;
    }

    if (/^(4|8)/.test(raw)) {
      return `${raw}.BJ`;
    }
  }

  return null;
}

function useFormattedTime(isoTime?: string) {
  return useMemo(() => {
    if (!isoTime) {
      return "--";
    }

    return new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(isoTime));
  }, [isoTime]);
}

function toTimeLabel(value: string) {
  const part = value.split(" ").pop() ?? value;
  return part.slice(0, 5);
}

function toDateTimeLabel(value: string) {
  const [datePart = "", timePart = ""] = value.split(" ");
  if (!datePart) {
    return value;
  }

  return `${datePart.slice(5)} ${timePart.slice(0, 5)}`.trim();
}

function toDateLabel(value: string) {
  return value.slice(5);
}

function buildLinePath(
  values: number[],
  width: number,
  height: number,
  padding: number,
  minValue: number,
  maxValue: number
) {
  if (values.length === 0) {
    return "";
  }

  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const valueRange = maxValue - minValue || 1;

  return values
    .map((value, index) => {
      const x =
        padding +
        (index / Math.max(1, values.length - 1)) * Math.max(plotWidth, 0);
      const y = padding + ((maxValue - value) / valueRange) * plotHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildLinePathFromPoints(
  points: Array<number | null>,
  xList: number[],
  yScale: (value: number) => number
) {
  let path = "";

  points.forEach((value, index) => {
    if (value === null) {
      return;
    }

    const command = path ? "L" : "M";
    path += `${command} ${xList[index].toFixed(2)} ${yScale(value).toFixed(2)} `;
  });

  return path.trim();
}

function calculateMA(points: KlinePoint[], windowSize: number) {
  return points.map((_, index) => {
    if (index + 1 < windowSize) {
      return null;
    }

    const subset = points.slice(index + 1 - windowSize, index + 1);
    const total = subset.reduce((sum, item) => sum + item.closePrice, 0);
    return total / windowSize;
  });
}

function calculateNumericMA(values: number[], windowSize: number) {
  return values.map((_, index) => {
    if (index + 1 < windowSize) {
      return null;
    }

    const subset = values.slice(index + 1 - windowSize, index + 1);
    const total = subset.reduce((sum, item) => sum + item, 0);
    return total / windowSize;
  });
}

function useChartViewport(totalCount: number, minVisibleCount = 20) {
  const [view, setView] = useState(() => ({
    start: 0,
    count: Math.max(1, totalCount),
  }));
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<{ startX: number; originStart: number } | null>(null);

  useEffect(() => {
    setView({
      start: 0,
      count: Math.max(1, totalCount),
    });
    setIsDragging(false);
    dragStateRef.current = null;
  }, [totalCount]);

  const handleWheel = useCallback(
    (
      event: ReactWheelEvent<SVGSVGElement>,
      svg: SVGSVGElement | null,
      plotWidth: number,
      padding: number
    ) => {
      if (!svg || totalCount <= 1) {
        return;
      }

      event.preventDefault();

      const rect = svg.getBoundingClientRect();
      const relativeX = ((event.clientX - rect.left) / rect.width) * svg.viewBox.baseVal.width;
      const clampedX = clamp(relativeX, padding, svg.viewBox.baseVal.width - padding);
      const ratio = (clampedX - padding) / Math.max(1, plotWidth);
      const focusIndex = view.start + Math.round(ratio * Math.max(1, view.count - 1));
      const step = Math.max(1, Math.round(view.count * 0.12));
      const nextCount = clamp(
        view.count + (event.deltaY > 0 ? step : -step),
        Math.min(minVisibleCount, totalCount),
        totalCount
      );

      if (nextCount === view.count) {
        return;
      }

      const nextStart = clamp(
        Math.round(focusIndex - ratio * Math.max(1, nextCount - 1)),
        0,
        Math.max(0, totalCount - nextCount)
      );

      setView({
        start: nextStart,
        count: nextCount,
      });
    },
    [minVisibleCount, totalCount, view.count, view.start]
  );

  const handleMouseDown = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>) => {
      if (totalCount <= view.count) {
        return;
      }

      dragStateRef.current = {
        startX: event.clientX,
        originStart: view.start,
      };
      setIsDragging(true);
    },
    [totalCount, view.count, view.start]
  );

  const handleMouseMove = useCallback(
    (event: ReactMouseEvent<SVGSVGElement>, svg: SVGSVGElement | null) => {
      if (!dragStateRef.current || !svg) {
        return false;
      }

      const rect = svg.getBoundingClientRect();
      const deltaPoints = Math.round(
        ((event.clientX - dragStateRef.current.startX) / Math.max(1, rect.width)) *
          view.count
      );
      const nextStart = clamp(
        dragStateRef.current.originStart - deltaPoints,
        0,
        Math.max(0, totalCount - view.count)
      );

      setView((prev) => ({
        ...prev,
        start: nextStart,
      }));

      return true;
    },
    [totalCount, view.count]
  );

  const endDrag = useCallback(() => {
    dragStateRef.current = null;
    setIsDragging(false);
  }, []);

  return {
    view,
    isDragging,
    setView,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    endDrag,
  };
}

function IntradayChart({
  points,
  prevClose,
  rangeLabel,
}: {
  points: IntradayPoint[];
  prevClose: number | null;
  rangeLabel: string;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 900;
  const height = 360;
  const padding = 28;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const { view, isDragging, handleWheel, handleMouseDown, handleMouseMove, endDrag } =
    useChartViewport(points.length, 30);

  const visiblePoints = useMemo(
    () => points.slice(view.start, view.start + view.count),
    [points, view.count, view.start]
  );

  useEffect(() => {
    setHoverIndex(null);
  }, [view.count, view.start, points.length]);

  if (visiblePoints.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-sm text-slate-400">
        暂无分时数据
      </div>
    );
  }

  const priceValues = visiblePoints.map((item) => item.lastPrice);
  const avgValues = visiblePoints.map((item) => item.averagePrice);
  const baselineValues = prevClose === null ? [] : [prevClose];
  const allValues = [...priceValues, ...avgValues, ...baselineValues];
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const safeMin = minValue - (maxValue - minValue || minValue * 0.02 || 1) * 0.08;
  const safeMax = maxValue + (maxValue - minValue || maxValue * 0.02 || 1) * 0.08;
  const pricePath = buildLinePath(
    priceValues,
    width,
    height,
    padding,
    safeMin,
    safeMax
  );
  const avgPath = buildLinePath(
    avgValues,
    width,
    height,
    padding,
    safeMin,
    safeMax
  );
  const xPositions = visiblePoints.map(
    (_, index) =>
      padding + (index / Math.max(1, visiblePoints.length - 1)) * Math.max(plotWidth, 0)
  );
  const referenceY =
    prevClose === null
      ? null
      : padding + ((safeMax - prevClose) / Math.max(1e-6, safeMax - safeMin)) * plotHeight;
  const xLabels = [
    toTimeLabel(visiblePoints[0].time),
    toTimeLabel(visiblePoints[Math.floor(visiblePoints.length / 2)].time),
    toTimeLabel(visiblePoints[visiblePoints.length - 1].time),
  ];
  const yLabels = [safeMax, (safeMax + safeMin) / 2, safeMin];
  const activeIndex = hoverIndex ?? visiblePoints.length - 1;
  const activePoint = visiblePoints[activeIndex];
  const activeX = xPositions[activeIndex];
  const activeY =
    padding + ((safeMax - activePoint.lastPrice) / Math.max(1e-6, safeMax - safeMin)) * plotHeight;
  const tooltipX = Math.min(width - 236, Math.max(padding + 8, activeX + 12));

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className={`h-[360px] w-full ${isDragging ? "cursor-grabbing" : "cursor-crosshair"}`}
        onWheel={(event) => handleWheel(event, svgRef.current, plotWidth, padding)}
        onMouseDown={handleMouseDown}
        onMouseUp={endDrag}
        onMouseLeave={() => {
          setHoverIndex(null);
          endDrag();
        }}
        onMouseMove={(event) => {
          const isPanning = handleMouseMove(event, svgRef.current);
          if (isPanning) {
            return;
          }

          const rect = svgRef.current?.getBoundingClientRect();
          if (!rect) {
            return;
          }

          const relativeX = ((event.clientX - rect.left) / rect.width) * width;
          const clampedX = clamp(relativeX, padding, width - padding);
          const ratio = (clampedX - padding) / Math.max(1, plotWidth);
          const nextIndex = Math.round(ratio * Math.max(1, visiblePoints.length - 1));
          setHoverIndex(clamp(nextIndex, 0, visiblePoints.length - 1));
        }}
      >
        {yLabels.map((item, index) => {
          const y =
            padding +
            (index / Math.max(1, yLabels.length - 1)) * (height - padding * 2);
          return (
            <g key={item}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="4 4"
              />
              <text x={6} y={y + 4} fill="#94a3b8" fontSize="12">
                {item.toFixed(2)}
              </text>
            </g>
          );
        })}
        {referenceY !== null ? (
          <line
            x1={padding}
            y1={referenceY}
            x2={width - padding}
            y2={referenceY}
            stroke="#475569"
            strokeDasharray="6 6"
          />
        ) : null}
        <path d={avgPath} fill="none" stroke="#f59e0b" strokeWidth="2" />
        <path d={pricePath} fill="none" stroke="#22c55e" strokeWidth="2.5" />
        <line
          x1={activeX}
          y1={padding}
          x2={activeX}
          y2={height - padding}
          stroke="#64748b"
          strokeDasharray="5 5"
        />
        <line
          x1={padding}
          y1={activeY}
          x2={width - padding}
          y2={activeY}
          stroke="#64748b"
          strokeDasharray="5 5"
        />
        <circle cx={activeX} cy={activeY} r="4" fill="#22c55e" />
        {xLabels.map((item, index) => {
          const x =
            padding +
            (index / Math.max(1, xLabels.length - 1)) * (width - padding * 2);
          return (
            <text
              key={`${item}-${index}`}
              x={x - 12}
              y={height - 6}
              fill="#94a3b8"
              fontSize="12"
            >
              {item}
            </text>
          );
        })}
        <rect
          x={tooltipX}
          y={padding + 12}
          width="208"
          height="108"
          rx="10"
          fill="#020617"
          stroke="#334155"
        />
        <text x={tooltipX + 14} y={padding + 34} fill="#e2e8f0" fontSize="13">
          {`${rangeLabel} ${toDateTimeLabel(activePoint.time)}`}
        </text>
        <text x={tooltipX + 14} y={padding + 56} fill="#22c55e" fontSize="13">
          {`最新价 ${activePoint.lastPrice.toFixed(2)}`}
        </text>
        <text x={tooltipX + 14} y={padding + 74} fill="#f59e0b" fontSize="13">
          {`均价 ${activePoint.averagePrice.toFixed(2)}`}
        </text>
        <text x={tooltipX + 14} y={padding + 92} fill="#94a3b8" fontSize="13">
          {`成交量 ${formatAmount(activePoint.volume)}`}
        </text>
        <text x={tooltipX + 14} y={padding + 110} fill="#94a3b8" fontSize="13">
          {`成交额 ${formatAmount(activePoint.amount)}`}
        </text>
      </svg>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          最新价
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          均价
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-500" />
          昨收参考线
        </span>
        <span>滚轮缩放，按住拖拽平移</span>
      </div>
    </div>
  );
}

function CandleChart({ points }: { points: KlinePoint[] }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 900;
  const height = 420;
  const padding = 28;
  const volumeHeight = 92;
  const chartGap = 18;
  const plotWidth = width - padding * 2;
  const { view, isDragging, handleWheel, handleMouseDown, handleMouseMove, endDrag } =
    useChartViewport(points.length, 20);

  const fullMa5 = useMemo(() => calculateMA(points, 5), [points]);
  const fullMa10 = useMemo(() => calculateMA(points, 10), [points]);
  const fullMa20 = useMemo(() => calculateMA(points, 20), [points]);
  const fullVma5 = useMemo(
    () => calculateNumericMA(points.map((item) => item.volume), 5),
    [points]
  );
  const fullVma10 = useMemo(
    () => calculateNumericMA(points.map((item) => item.volume), 10),
    [points]
  );

  const visiblePoints = useMemo(
    () => points.slice(view.start, view.start + view.count),
    [points, view.count, view.start]
  );
  const ma5 = useMemo(
    () => fullMa5.slice(view.start, view.start + view.count),
    [fullMa5, view.count, view.start]
  );
  const ma10 = useMemo(
    () => fullMa10.slice(view.start, view.start + view.count),
    [fullMa10, view.count, view.start]
  );
  const ma20 = useMemo(
    () => fullMa20.slice(view.start, view.start + view.count),
    [fullMa20, view.count, view.start]
  );
  const vma5 = useMemo(
    () => fullVma5.slice(view.start, view.start + view.count),
    [fullVma5, view.count, view.start]
  );
  const vma10 = useMemo(
    () => fullVma10.slice(view.start, view.start + view.count),
    [fullVma10, view.count, view.start]
  );

  useEffect(() => {
    setHoverIndex(null);
  }, [points.length, view.count, view.start]);

  if (visiblePoints.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-sm text-slate-400">
        暂无 K 线数据
      </div>
    );
  }

  const highs = visiblePoints.map((item) => item.highPrice);
  const lows = visiblePoints.map((item) => item.lowPrice);
  const minValue = Math.min(...lows);
  const maxValue = Math.max(...highs);
  const safeMin = minValue - (maxValue - minValue || minValue * 0.02 || 1) * 0.08;
  const safeMax = maxValue + (maxValue - minValue || maxValue * 0.02 || 1) * 0.08;
  const candleAreaHeight = height - padding * 2 - volumeHeight - chartGap;
  const candleSlot = plotWidth / Math.max(visiblePoints.length, 1);
  const candleWidth = Math.max(3, candleSlot * 0.6);
  const candleCenters = visiblePoints.map(
    (_, index) => padding + candleSlot * index + candleSlot / 2
  );
  const yScale = (price: number) =>
    padding +
    ((safeMax - price) / Math.max(1e-6, safeMax - safeMin)) * candleAreaHeight;
  const volumeTop = padding + candleAreaHeight + chartGap;
  const volumeBottom = volumeTop + volumeHeight;
  const maxVolume = Math.max(...visiblePoints.map((item) => item.volume), 1);
  const volumeYScale = (value: number) =>
    volumeBottom - (value / maxVolume) * (volumeHeight - 10);
  const ma5Path = buildLinePathFromPoints(ma5, candleCenters, yScale);
  const ma10Path = buildLinePathFromPoints(ma10, candleCenters, yScale);
  const ma20Path = buildLinePathFromPoints(ma20, candleCenters, yScale);
  const vma5Path = buildLinePathFromPoints(vma5, candleCenters, volumeYScale);
  const vma10Path = buildLinePathFromPoints(vma10, candleCenters, volumeYScale);
  const xLabels = [
    visiblePoints[0].date,
    visiblePoints[Math.floor(visiblePoints.length / 2)].date,
    visiblePoints[visiblePoints.length - 1].date,
  ];
  const activeIndex = hoverIndex ?? visiblePoints.length - 1;
  const activePoint = visiblePoints[activeIndex];
  const activeX = candleCenters[activeIndex];
  const activePriceY = yScale(activePoint.closePrice);
  const activeVolumeY = volumeYScale(activePoint.volume);
  const tooltipX = Math.min(width - 260, Math.max(padding + 8, activeX + 12));

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className={`h-[420px] w-full ${isDragging ? "cursor-grabbing" : "cursor-crosshair"}`}
        onWheel={(event) => handleWheel(event, svgRef.current, plotWidth, padding)}
        onMouseDown={handleMouseDown}
        onMouseUp={endDrag}
        onMouseLeave={() => {
          setHoverIndex(null);
          endDrag();
        }}
        onMouseMove={(event) => {
          const isPanning = handleMouseMove(event, svgRef.current);
          if (isPanning) {
            return;
          }

          const rect = svgRef.current?.getBoundingClientRect();
          if (!rect) {
            return;
          }

          const relativeX = ((event.clientX - rect.left) / rect.width) * width;
          const clampedX = clamp(relativeX, padding, width - padding);
          const ratio = (clampedX - padding) / Math.max(1, plotWidth);
          const nextIndex = Math.round(ratio * Math.max(1, visiblePoints.length - 1));
          setHoverIndex(clamp(nextIndex, 0, visiblePoints.length - 1));
        }}
      >
        {[safeMax, (safeMax + safeMin) / 2, safeMin].map((item, index) => {
          const y = padding + (index / 2) * candleAreaHeight;
          return (
            <g key={item}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="4 4"
              />
              <text x={6} y={y + 4} fill="#94a3b8" fontSize="12">
                {item.toFixed(2)}
              </text>
            </g>
          );
        })}
        <line
          x1={padding}
          y1={volumeTop}
          x2={width - padding}
          y2={volumeTop}
          stroke="#1e293b"
          strokeDasharray="4 4"
        />
        <text x={6} y={volumeTop + 4} fill="#94a3b8" fontSize="12">
          Vol
        </text>
        <line
          x1={activeX}
          y1={padding}
          x2={activeX}
          y2={height - padding}
          stroke="#64748b"
          strokeDasharray="5 5"
        />
        <line
          x1={padding}
          y1={activePriceY}
          x2={width - padding}
          y2={activePriceY}
          stroke="#64748b"
          strokeDasharray="5 5"
        />
        {visiblePoints.map((item, index) => {
          const centerX = candleCenters[index];
          const openY = yScale(item.openPrice);
          const closeY = yScale(item.closePrice);
          const highY = yScale(item.highPrice);
          const lowY = yScale(item.lowPrice);
          const isUp = item.closePrice >= item.openPrice;
          const candleColor = isUp ? "#f43f5e" : "#10b981";
          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.max(2, Math.abs(openY - closeY));
          const volumeBarHeight = (item.volume / maxVolume) * (volumeHeight - 10);

          return (
            <g key={`${item.date}-${index}`}>
              <line
                x1={centerX}
                y1={highY}
                x2={centerX}
                y2={lowY}
                stroke={candleColor}
                strokeWidth="1.5"
              />
              <rect
                x={centerX - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={candleColor}
                opacity="0.9"
                rx="1"
              />
              <rect
                x={centerX - candleWidth / 2}
                y={volumeBottom - volumeBarHeight}
                width={candleWidth}
                height={Math.max(2, volumeBarHeight)}
                fill={candleColor}
                opacity="0.7"
                rx="1"
              />
            </g>
          );
        })}
        {vma5Path ? (
          <path d={vma5Path} fill="none" stroke="#facc15" strokeWidth="1.8" />
        ) : null}
        {vma10Path ? (
          <path d={vma10Path} fill="none" stroke="#60a5fa" strokeWidth="1.8" />
        ) : null}
        {ma5Path ? (
          <path d={ma5Path} fill="none" stroke="#f59e0b" strokeWidth="2" />
        ) : null}
        {ma10Path ? (
          <path d={ma10Path} fill="none" stroke="#38bdf8" strokeWidth="2" />
        ) : null}
        {ma20Path ? (
          <path d={ma20Path} fill="none" stroke="#a855f7" strokeWidth="2" />
        ) : null}
        <circle cx={activeX} cy={activePriceY} r="4" fill="#e2e8f0" />
        <circle cx={activeX} cy={activeVolumeY} r="3" fill="#facc15" />
        {xLabels.map((item, index) => {
          const x =
            padding +
            (index / Math.max(1, xLabels.length - 1)) * (width - padding * 2);
          return (
            <text
              key={`${item}-${index}`}
              x={x - 20}
              y={height - 6}
              fill="#94a3b8"
              fontSize="12"
            >
              {item.slice(5)}
            </text>
          );
        })}
        <rect
          x={tooltipX}
          y={padding + 10}
          width="238"
          height="150"
          rx="10"
          fill="#020617"
          stroke="#334155"
        />
        <text x={tooltipX + 14} y={padding + 30} fill="#e2e8f0" fontSize="13">
          {toDateLabel(activePoint.date)}
        </text>
        <text x={tooltipX + 14} y={padding + 50} fill="#94a3b8" fontSize="13">
          {`开 ${activePoint.openPrice.toFixed(2)}  高 ${activePoint.highPrice.toFixed(2)}`}
        </text>
        <text x={tooltipX + 14} y={padding + 68} fill="#94a3b8" fontSize="13">
          {`低 ${activePoint.lowPrice.toFixed(2)}  收 ${activePoint.closePrice.toFixed(2)}`}
        </text>
        <text x={tooltipX + 14} y={padding + 86} fill="#22c55e" fontSize="13">
          {`量 ${formatAmount(activePoint.volume)}`}
        </text>
        <text x={tooltipX + 14} y={padding + 104} fill="#f59e0b" fontSize="13">
          {`MA5 ${ma5[activeIndex]?.toFixed(2) ?? "--"}  MA10 ${ma10[
            activeIndex
          ]?.toFixed(2) ?? "--"}`}
        </text>
        <text x={tooltipX + 14} y={padding + 122} fill="#a855f7" fontSize="13">
          {`MA20 ${ma20[activeIndex]?.toFixed(2) ?? "--"}  VMA5 ${
            vma5[activeIndex] ? formatAmount(vma5[activeIndex]) : "--"
          }`}
        </text>
        <text x={tooltipX + 14} y={padding + 140} fill="#60a5fa" fontSize="13">
          {`VMA10 ${vma10[activeIndex] ? formatAmount(vma10[activeIndex]) : "--"}`}
        </text>
      </svg>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          阳线 / 放量上涨
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          阴线 / 放量下跌
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          MA5
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          MA10
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet-500" />
          MA20
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-yellow-300" />
          VMA5
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          VMA10
        </span>
        <span>滚轮缩放，按住拖拽平移</span>
      </div>
    </div>
  );
}

function OrderBookPanel({ orderBook }: { orderBook: OrderBookLevel[] }) {
  if (orderBook.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
        暂无盘口数据
      </div>
    );
  }

  const sellRows = [...orderBook].reverse();

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">五档盘口</h3>
        <span className="text-xs text-slate-400">新浪实时盘口</span>
      </div>
      <div className="space-y-2 text-xs">
        {sellRows.map((level) => (
          <div
            key={`sell-${level.level}`}
            className="grid grid-cols-[54px_1fr_1fr] gap-3 rounded-lg bg-slate-900/80 px-3 py-2"
          >
            <span className="text-slate-400">{`卖${level.level}`}</span>
            <span className="text-rose-400">{formatPrice(level.sellPrice)}</span>
            <span className="text-right text-slate-300">
              {formatBookVolume(level.sellVolume)}
            </span>
          </div>
        ))}
        <div className="rounded-lg border border-slate-800 px-3 py-2 text-center text-xs text-slate-400">
          最新盘口分隔线
        </div>
        {orderBook.map((level) => (
          <div
            key={`buy-${level.level}`}
            className="grid grid-cols-[54px_1fr_1fr] gap-3 rounded-lg bg-slate-900/80 px-3 py-2"
          >
            <span className="text-slate-400">{`买${level.level}`}</span>
            <span className="text-emerald-400">{formatPrice(level.buyPrice)}</span>
            <span className="text-right text-slate-300">
              {formatBookVolume(level.buyVolume)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TradeDetailPanel({ trades }: { trades: TradeDetail[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">成交明细</h3>
        <span className="text-xs text-slate-400">最近 20 笔</span>
      </div>
      <div className="max-h-[340px] space-y-2 overflow-y-auto">
        {trades.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            暂无成交明细
          </div>
        ) : (
          trades
            .slice()
            .reverse()
            .map((trade, index) => (
              <div
                key={`${trade.time}-${trade.price}-${index}`}
                className="grid grid-cols-[70px_1fr_1fr_64px] items-center gap-2 rounded-lg bg-slate-900/80 px-3 py-2 text-xs"
              >
                <span className="text-slate-400">{trade.time}</span>
                <span className={getTradeSideClass(trade.side)}>
                  {trade.price.toFixed(2)}
                </span>
                <span className="text-slate-300">{formatTradeVolume(trade.volume)}</span>
                <span className={`text-right ${getTradeSideClass(trade.side)}`}>
                  {getTradeSideLabel(trade.side)}
                </span>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default function StockDetailBoard({
  initialSymbol,
}: {
  initialSymbol?: string;
}) {
  const normalizedInitialSymbol = useMemo(
    () => (initialSymbol ? normalizeInputSymbol(initialSymbol) : null),
    [initialSymbol]
  );
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);
  const [inputValue, setInputValue] = useState("");
  const [snapshot, setSnapshot] = useState<StockMarketSnapshot | null>(null);
  const [chart, setChart] = useState<StockChartSnapshot | null>(null);
  const [detail, setDetail] = useState<StockDetailSnapshot | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [chartTab, setChartTab] = useState<ChartTabKey>("intraday");
  const [intradayRange, setIntradayRange] = useState<IntradayRangeKey>("1d");
  const [klineZoom, setKlineZoom] = useState({
    day: 120,
    week: 52,
    month: 60,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const initializedRef = useRef(false);

  const fetchSnapshot = useCallback(async (symbols: string[], silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const searchParams = new URLSearchParams({
        symbols: symbols.join(","),
      });
      const response = await fetch(`/api/stocks?${searchParams.toString()}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as SnapshotResponse;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? "获取数据失败");
      }

      setSnapshot(payload.data);
      setError("");
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "获取数据失败");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchChart = useCallback(async (symbol: string, silent = false) => {
    if (!symbol) {
      return;
    }

    setChartLoading(true);

    try {
      const searchParams = new URLSearchParams({ symbol });
      const response = await fetch(`/api/stocks/chart?${searchParams.toString()}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as ChartResponse;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? "获取图表数据失败");
      }

      setChart(payload.data);
      if (!silent) {
        setError("");
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "获取图表数据失败");
    } finally {
      setChartLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (symbol: string, silent = false) => {
    if (!symbol) {
      return;
    }

    setDetailLoading(true);

    try {
      const searchParams = new URLSearchParams({ symbol });
      const response = await fetch(`/api/stocks/detail?${searchParams.toString()}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as DetailResponse;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? "获取盘口数据失败");
      }

      setDetail(payload.data);
      if (!silent) {
        setError("");
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "获取盘口数据失败");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    const parsed = storedValue
      ? storedValue
          .split(",")
          .map((item) => normalizeInputSymbol(item))
          .filter((item): item is string => Boolean(item))
      : [];
    const nextWatchlist = parsed.length > 0 ? parsed : DEFAULT_WATCHLIST;
    const mergedWatchlist = normalizedInitialSymbol
      ? Array.from(new Set([normalizedInitialSymbol, ...nextWatchlist]))
      : nextWatchlist;

    setWatchlist(mergedWatchlist);
    setSelectedSymbol(normalizedInitialSymbol ?? mergedWatchlist[0] ?? "");
    void fetchSnapshot(mergedWatchlist);
  }, [fetchSnapshot, normalizedInitialSymbol]);

  useEffect(() => {
    if (!initializedRef.current) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, watchlist.join(","));
  }, [watchlist]);

  useEffect(() => {
    if (!initializedRef.current || !selectedSymbol) {
      return;
    }

    void fetchChart(selectedSymbol);
    void fetchDetail(selectedSymbol);
  }, [fetchChart, fetchDetail, selectedSymbol]);

  useEffect(() => {
    if (!initializedRef.current) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchSnapshot(watchlist, true);

        if (selectedSymbol) {
          void fetchChart(selectedSymbol, true);
          void fetchDetail(selectedSymbol, true);
        }
      }
    }, 15_000);

    return () => window.clearInterval(intervalId);
  }, [fetchChart, fetchDetail, fetchSnapshot, selectedSymbol, watchlist]);

  const quotesBySymbol = useMemo(() => {
    const nextMap = new Map<string, StockQuote>();

    for (const item of snapshot?.quotes ?? []) {
      nextMap.set(item.symbol, item);
    }

    return nextMap;
  }, [snapshot?.quotes]);

  const orderedQuotes = useMemo(
    () =>
      watchlist
        .map((symbol) => quotesBySymbol.get(symbol))
        .filter((item): item is StockQuote => Boolean(item)),
    [quotesBySymbol, watchlist]
  );

  useEffect(() => {
    if (orderedQuotes.length === 0) {
      return;
    }

    const hasSelected = orderedQuotes.some((item) => item.symbol === selectedSymbol);
    if (!hasSelected) {
      setSelectedSymbol(orderedQuotes[0].symbol);
    }
  }, [orderedQuotes, selectedSymbol]);

  const refreshedTime = useFormattedTime(snapshot?.refreshedAt);
  const chartRefreshedTime = useFormattedTime(chart?.refreshedAt);
  const detailRefreshedTime = useFormattedTime(detail?.refreshedAt);
  const selectedQuote = selectedSymbol ? quotesBySymbol.get(selectedSymbol) ?? null : null;
  const selectedChartTitle = selectedQuote?.name ?? chart?.name ?? "请选择股票";
  const activeIntradayPoints = useMemo(
    () => (intradayRange === "5d" ? chart?.intraday5d ?? [] : chart?.intraday ?? []),
    [chart?.intraday, chart?.intraday5d, intradayRange]
  );

  const activeKlinePoints = useMemo(() => {
    if (!chart) {
      return [];
    }

    if (chartTab === "day") {
      return chart.dayCandles.slice(-klineZoom.day);
    }

    if (chartTab === "week") {
      return chart.weekCandles.slice(-klineZoom.week);
    }

    if (chartTab === "month") {
      return chart.monthCandles.slice(-klineZoom.month);
    }

    return [];
  }, [chart, chartTab, klineZoom.day, klineZoom.month, klineZoom.week]);

  const handleRefresh = () => {
    void fetchSnapshot(watchlist, true);

    if (selectedSymbol) {
      void fetchChart(selectedSymbol, true);
      void fetchDetail(selectedSymbol, true);
    }
  };

  const handleAddSymbol = () => {
    const normalizedSymbol = normalizeInputSymbol(inputValue);

    if (!normalizedSymbol) {
      setError("请输入有效的 A 股代码，例如 600519 或 000001");
      return;
    }

    if (watchlist.includes(normalizedSymbol)) {
      setError("该股票已经在自选列表中");
      setSelectedSymbol(normalizedSymbol);
      return;
    }

    const nextWatchlist = [...watchlist, normalizedSymbol];
    setWatchlist(nextWatchlist);
    setSelectedSymbol(normalizedSymbol);
    setInputValue("");
    setError("");
    void fetchSnapshot(nextWatchlist, true);
  };

  const handleRemoveSymbol = (symbol: string) => {
    const nextWatchlist = watchlist.filter((item) => item !== symbol);
    const fallbackWatchlist =
      nextWatchlist.length > 0 ? nextWatchlist : DEFAULT_WATCHLIST;
    const nextSelectedSymbol =
      symbol === selectedSymbol ? fallbackWatchlist[0] ?? "" : selectedSymbol;

    setWatchlist(fallbackWatchlist);
    setSelectedSymbol(nextSelectedSymbol);
    void fetchSnapshot(fallbackWatchlist, true);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6">
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-6 shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-blue-300">A 股行情原型</p>
              <h1 className="text-3xl font-bold">Next.js 股票行情看板</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-300">
                已支持分时图、K 线图、滚轮缩放、拖拽平移，以及五档盘口和成交明细侧栏。
                页面通过本站 API 代理多个公开行情口子，并做了短时缓存。
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              <p>行情刷新：{refreshedTime}</p>
              <p>图表刷新：{chartRefreshedTime}</p>
              <p>盘口刷新：{detailRefreshedTime}</p>
              <p>缓存命中：{snapshot?.cached ? "是" : "否"}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {(snapshot?.indices ?? []).map((indexItem) => (
            <article
              key={indexItem.symbol}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <p className="text-sm text-slate-400">{indexItem.name}</p>
              <p className={`mt-3 text-3xl font-bold ${getColorClass(indexItem.changePercent)}`}>
                {formatPrice(indexItem.lastPrice)}
              </p>
              <div
                className={`mt-2 flex items-center gap-3 text-sm ${getColorClass(
                  indexItem.changePercent
                )}`}
              >
                <span>{formatPercent(indexItem.changePercent)}</span>
                <span>{formatPrice(indexItem.changeAmount)}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">图表分析</h2>
              <p className="mt-1 text-sm text-slate-400">
                支持鼠标滚轮缩放和按住拖拽平移，右侧可同时查看盘口和成交明细。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {CHART_TABS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setChartTab(item.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    chartTab === item.key
                      ? "bg-emerald-500 text-black"
                      : "border border-slate-700 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {chartTab === "intraday"
              ? INTRADAY_RANGE_TABS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setIntradayRange(item.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      intradayRange === item.key
                        ? "bg-blue-600 text-white"
                        : "border border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {item.label}分时
                  </button>
                ))
              : (
                  KLINE_ZOOM_OPTIONS[chartTab as KlineZoomKey] ?? []
                ).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setKlineZoom((prev) => ({
                        ...prev,
                        [chartTab]: size,
                      }))
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      klineZoom[chartTab as KlineZoomKey] === size
                        ? "bg-blue-600 text-white"
                        : "border border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    近{size}{chartTab === "day" ? "日" : chartTab === "week" ? "周" : "月"}
                  </button>
                ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_360px]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div>
                  <p className="text-sm text-slate-400">{selectedChartTitle}</p>
                  <div className="mt-2 flex flex-wrap items-end gap-3">
                    <span
                      className={`text-3xl font-bold ${getColorClass(
                        selectedQuote?.changePercent ?? null
                      )}`}
                    >
                      {formatPrice(selectedQuote?.lastPrice ?? null)}
                    </span>
                    <span
                      className={`pb-1 text-sm font-medium ${getColorClass(
                        selectedQuote?.changePercent ?? null
                      )}`}
                    >
                      {formatPercent(selectedQuote?.changePercent ?? null)}
                    </span>
                    <span
                      className={`pb-1 text-sm ${getColorClass(
                        selectedQuote?.changeAmount ?? null
                      )}`}
                    >
                      {formatPrice(selectedQuote?.changeAmount ?? null)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  <p>股票代码：{selectedSymbol || "--"}</p>
                  <p>图表源：东财分时 / K 线</p>
                </div>
              </div>

              {chartLoading ? (
                <div className="flex h-[360px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-sm text-slate-400">
                  正在加载图表数据...
                </div>
              ) : chartTab === "intraday" ? (
                <IntradayChart
                  points={activeIntradayPoints}
                  prevClose={selectedQuote?.prevClose ?? null}
                  rangeLabel={intradayRange === "5d" ? "5日分时" : "1日分时"}
                />
              ) : (
                <CandleChart points={activeKlinePoints} />
              )}
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                {[
                  {
                    label: "今开 / 昨收",
                    value: `${formatPrice(selectedQuote?.openPrice ?? null)} / ${formatPrice(
                      selectedQuote?.prevClose ?? null
                    )}`,
                  },
                  {
                    label: "最高 / 最低",
                    value: `${formatPrice(selectedQuote?.highPrice ?? null)} / ${formatPrice(
                      selectedQuote?.lowPrice ?? null
                    )}`,
                  },
                  {
                    label: "成交额",
                    value: formatAmount(selectedQuote?.amount ?? null),
                  },
                  {
                    label: "换手率",
                    value:
                      selectedQuote?.turnoverRate === null ||
                      selectedQuote?.turnoverRate === undefined
                        ? "--"
                        : `${selectedQuote.turnoverRate.toFixed(2)}%`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-100">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {detailLoading && !detail ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  正在加载盘口与成交明细...
                </div>
              ) : (
                <>
                  <OrderBookPanel orderBook={detail?.orderBook ?? []} />
                  <TradeDetailPanel trades={detail?.recentTrades ?? []} />
                </>
              )}

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-7 text-slate-300">
                <p className="font-semibold text-slate-100">使用说明</p>
                <p className="mt-2">
                  鼠标移入图表后可滚轮缩放，按住并拖拽可平移；右侧侧栏展示五档盘口与最近成交明细。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">自选股</h2>
              <p className="mt-1 text-sm text-slate-400">
                支持输入 `600519`、`000001`、`sh600519`、`000001.SZ`
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleAddSymbol();
                  }
                }}
                placeholder="输入股票代码"
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm outline-none ring-0 transition focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSymbol}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                添加股票
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                {refreshing ? "刷新中..." : "立即刷新"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          ) : null}

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
                  <th className="px-3 py-3 font-medium">换手率</th>
                  <th className="px-3 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-slate-400">
                      正在加载行情数据...
                    </td>
                  </tr>
                ) : null}

                {!loading && orderedQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-slate-400">
                      暂无行情数据，请检查股票代码或稍后重试。
                    </td>
                  </tr>
                ) : null}

                {!loading
                  ? orderedQuotes.map((quote) => (
                      <tr
                        key={quote.symbol}
                        className={`cursor-pointer transition hover:bg-slate-800/40 ${
                          selectedSymbol === quote.symbol ? "bg-slate-800/50" : ""
                        }`}
                        onClick={() => setSelectedSymbol(quote.symbol)}
                      >
                        <td className="px-3 py-4">
                          <div>
                            <p className="font-semibold text-slate-100">{quote.name}</p>
                            <p className="mt-1 text-xs text-slate-400">{quote.symbol}</p>
                          </div>
                        </td>
                        <td className={`px-3 py-4 font-semibold ${getColorClass(quote.changePercent)}`}>
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
                        <td className="px-3 py-4 text-slate-300">
                          {quote.turnoverRate === null ? "--" : `${quote.turnoverRate.toFixed(2)}%`}
                        </td>
                        <td className="px-3 py-4">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRemoveSymbol(quote.symbol);
                            }}
                            className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:bg-slate-800"
                          >
                            移除
                          </button>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
