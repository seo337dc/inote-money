"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, ColorType } from "lightweight-charts";

type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export function KoreanStockChart({
  ticker,
  isDark,
}: {
  ticker: string;
  isDark: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ok">("loading");

  useEffect(() => {
    setStatus("loading");
    setCandles([]);
    const code = ticker.replace(/^KRX:/i, "");
    fetch(`/api/stock/${code}`)
      .then((r) => r.json())
      .then((d: { candles?: Candle[] }) => {
        if (d.candles?.length) {
          setCandles(d.candles);
          setStatus("ok");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [ticker]);

  useEffect(() => {
    if (status !== "ok" || !containerRef.current || !candles.length) return;

    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: {
          type: ColorType.Solid,
          color: isDark ? "#1f2937" : "#ffffff",
        },
        textColor: isDark ? "#9ca3af" : "#6b7280",
      },
      grid: {
        vertLines: { color: isDark ? "#374151" : "#f3f4f6" },
        horzLines: { color: isDark ? "#374151" : "#f3f4f6" },
      },
      rightPriceScale: { borderColor: isDark ? "#374151" : "#e5e7eb" },
      timeScale: {
        borderColor: isDark ? "#374151" : "#e5e7eb",
        timeVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    series.setData(candles as any);
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      chart.applyOptions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [candles, isDark, status]);

  if (status === "loading") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <span className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-green-500 rounded-full animate-spin" />
          차트 로딩 중...
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-gray-800 gap-1">
        <p className="text-sm text-gray-400 dark:text-gray-500">데이터를 불러올 수 없어요</p>
        <p className="text-[11px] text-gray-300 dark:text-gray-600">네이버 금융 API 연결 실패</p>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
