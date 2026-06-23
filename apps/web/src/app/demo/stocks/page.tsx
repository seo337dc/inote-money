"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, X, Edit2, RefreshCw, BarChart2, ChevronLeft, ChevronRight } from "lucide-react";
import { useDarkMode } from "../dark-mode";
import { KoreanStockChart } from "./components/KoreanStockChart";

// ─── Types ───────────────────────────────────────────────
type Currency = "KRW" | "USD";

type Stock = {
  id: string;
  ticker: string;
  name: string;
  currency: Currency;
  inputMode: "shares" | "amount";
  quantity?: number;
  buyPrice?: number;
  investAmount?: number;
  memo?: string;
};

type ExchangeRates = {
  usdKrw: number;
  jpyKrw: number;
  eurKrw: number;
  fetchedAt: string;
  loading: boolean;
  error: boolean;
};

type ModalMode =
  | { type: "add"; defaultCurrency: Currency }
  | { type: "edit"; stock: Stock };

// ─── Constants ───────────────────────────────────────────
const STOCKS_KEY = "inote-stocks";

const SAMPLE_STOCKS: Stock[] = [
  // 국내
  { id: "s1", ticker: "KRX:005930", name: "삼성전자",        currency: "KRW", inputMode: "shares", quantity: 5,  buyPrice: 72000 },
  { id: "e1", ticker: "KRX:360750", name: "TIGER S&P500",    currency: "KRW", inputMode: "shares", quantity: 20, buyPrice: 16800 },
  { id: "e2", ticker: "KRX:133690", name: "TIGER 나스닥100", currency: "KRW", inputMode: "shares", quantity: 15, buyPrice: 98000 },
  { id: "e3", ticker: "KRX:445090", name: "TIGER 미국우주테크", currency: "KRW", inputMode: "shares", quantity: 10, buyPrice: 13500 },
  // 해외
  { id: "s2", ticker: "NASDAQ:NVDA", name: "엔비디아",       currency: "USD", inputMode: "amount", investAmount: 300 },
  { id: "s3", ticker: "NASDAQ:AAPL", name: "애플",           currency: "USD", inputMode: "amount", investAmount: 185 },
  { id: "s4", ticker: "NASDAQ:TSLA", name: "테슬라",         currency: "USD", inputMode: "amount", investAmount: 120 },
  { id: "s5", ticker: "NASDAQ:MSFT", name: "마이크로소프트", currency: "USD", inputMode: "amount", investAmount: 210 },
];

// ─── Helpers ─────────────────────────────────────────────
function loadStocks(): Stock[] {
  try {
    const saved = localStorage.getItem(STOCKS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return SAMPLE_STOCKS;
}

function saveStocks(stocks: Stock[]) {
  localStorage.setItem(STOCKS_KEY, JSON.stringify(stocks));
}

function fmt(n: number, currency: Currency = "KRW") {
  if (currency === "USD")
    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  return `${n.toLocaleString("ko-KR")}원`;
}

function fmtCompact(n: number) {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`;
  if (n >= 10_000) return `${Math.round(n / 10_000)}만원`;
  return `${n.toLocaleString("ko-KR")}원`;
}

function stockTotalKrw(stock: Stock, usdKrw: number): number {
  if (stock.inputMode === "amount") {
    const usd = stock.investAmount ?? 0;
    return stock.currency === "USD" && usdKrw > 0 ? usd * usdKrw : usd;
  }
  const total = (stock.quantity ?? 0) * (stock.buyPrice ?? 0);
  return stock.currency === "USD" && usdKrw > 0 ? total * usdKrw : total;
}

// ─── TradingView Chart (해외) ────────────────────────────
function TradingViewChart({ symbol, isDark }: { symbol: string; isDark: boolean }) {
  const theme = isDark ? "dark" : "light";
  const src =
    `https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(symbol)}` +
    `&interval=D&theme=${theme}&style=1&locale=kr` +
    `&timezone=Asia%2FSeoul&enable_publishing=false` +
    `&hide_top_toolbar=false&hide_side_toolbar=false&allow_symbol_change=false`;

  return (
    <iframe
      key={src}
      src={src}
      style={{ width: "100%", height: "100%", border: "none" }}
      allowFullScreen
    />
  );
}

// ─── Stock Modal ─────────────────────────────────────────
type FormState = {
  ticker: string;
  name: string;
  currency: Currency;
  inputMode: "shares" | "amount";
  quantity: string;
  buyPrice: string;
  investAmount: string;
  memo: string;
};

function StockModal({
  mode,
  onSave,
  onClose,
}: {
  mode: ModalMode;
  onSave: (stock: Omit<Stock, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => {
    if (mode.type === "edit") {
      const s = mode.stock;
      return {
        ticker: s.ticker, name: s.name, currency: s.currency, inputMode: s.inputMode,
        quantity: s.quantity != null ? String(s.quantity) : "",
        buyPrice: s.buyPrice != null ? String(s.buyPrice) : "",
        investAmount: s.investAmount != null ? String(s.investAmount) : "",
        memo: s.memo ?? "",
      };
    }
    const cur = mode.defaultCurrency;
    return {
      ticker: "", name: "", currency: cur,
      inputMode: cur === "KRW" ? "shares" : "amount",
      quantity: "", buyPrice: "", investAmount: "", memo: "",
    };
  });

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCurrencyChange = (v: string) =>
    setForm((f) => ({ ...f, currency: v as Currency, inputMode: v === "KRW" ? "shares" : "amount" }));

  const handleSave = () => {
    if (!form.ticker.trim() || !form.name.trim()) return;
    const base = {
      ticker: form.ticker.trim().toUpperCase(),
      name: form.name.trim(),
      currency: form.currency,
      inputMode: form.inputMode,
      memo: form.memo.trim() || undefined,
    };
    if (form.inputMode === "shares") {
      onSave({ ...base, quantity: Number(form.quantity) || 0, buyPrice: Number(form.buyPrice) || 0 });
    } else {
      onSave({ ...base, investAmount: Number(form.investAmount) || 0 });
    }
  };

  const INPUT =
    "w-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 focus:border-transparent transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600";
  const LABEL = "text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1";
  const TAB = (on: boolean) =>
    `flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
      on ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
         : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {mode.type === "add" ? "종목 추가" : "종목 수정"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          <div>
            <label className={LABEL}>종목명</label>
            <input type="text" value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="삼성전자, 애플..." className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>티커</label>
            <input type="text" value={form.ticker} onChange={(e) => set("ticker")(e.target.value)} placeholder="KRX:005930 또는 NASDAQ:AAPL" className={INPUT} />
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">거래소:티커 형식 · 예) KRX:005930, NASDAQ:AAPL</p>
          </div>
          <div>
            <label className={LABEL}>통화</label>
            <select value={form.currency} onChange={(e) => handleCurrencyChange(e.target.value)} className={INPUT}>
              <option value="KRW">원화 (KRW) — 국내</option>
              <option value="USD">달러 (USD) — 해외</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>입력 방식</label>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
              <button type="button" onClick={() => set("inputMode")("shares")} className={TAB(form.inputMode === "shares")}>
                수량으로 입력 (주)
              </button>
              <button type="button" onClick={() => set("inputMode")("amount")} className={TAB(form.inputMode === "amount")}>
                금액으로 입력
              </button>
            </div>
          </div>

          {form.inputMode === "shares" ? (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className={LABEL}>보유 수량</label>
                <div className="relative">
                  <input type="number" value={form.quantity} onChange={(e) => set("quantity")(e.target.value)} placeholder="0" className={INPUT + " pr-6"} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">주</span>
                </div>
              </div>
              <div className="flex-1">
                <label className={LABEL}>평균 매입가</label>
                <div className="relative">
                  <input type="number" value={form.buyPrice} onChange={(e) => set("buyPrice")(e.target.value)} placeholder="0" className={INPUT + " pr-8"} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    {form.currency === "KRW" ? "원" : "$"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className={LABEL}>투자 금액</label>
              <div className="relative">
                <input type="number" value={form.investAmount} onChange={(e) => set("investAmount")(e.target.value)} placeholder="0" className={INPUT + " pr-10"} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  {form.currency === "KRW" ? "원" : "USD"}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">소액 분할 매수 등 총 투자금액만 기록</p>
            </div>
          )}

          <div>
            <label className={LABEL}>메모 (선택)</label>
            <input type="text" value={form.memo} onChange={(e) => set("memo")(e.target.value)} placeholder="장기 보유, 분할 매수 중..." className={INPUT} />
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!form.ticker.trim() || !form.name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            {mode.type === "add" ? "추가하기" : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Exchange Rate Card ──────────────────────────────────
function ExchangeCard({ label, rate, sub, loading, error }: {
  label: string; rate: string; sub?: string; loading: boolean; error: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-3 shrink-0 min-w-[130px]">
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">{label}</p>
      {loading ? (
        <div className="h-5 w-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      ) : error ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">—</p>
      ) : (
        <>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{rate}</p>
          {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  );
}

// ─── Stock Card ──────────────────────────────────────────
function StockCard({ stock, selected, usdKrw, onSelect, onEdit, onDelete }: {
  stock: Stock; selected: boolean; usdKrw: number;
  onSelect: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const totalKrw = stockTotalKrw(stock, usdKrw);
  const subText = stock.inputMode === "shares"
    ? `${stock.quantity ?? 0}주 · 매입 ${fmt(stock.buyPrice ?? 0, stock.currency)}`
    : `투자 ${fmt(stock.investAmount ?? 0, stock.currency)}`;

  return (
    <div
      onClick={onSelect}
      className={`relative shrink-0 w-44 rounded-2xl border p-3.5 cursor-pointer transition-all ${
        selected
          ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
          : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-200 dark:hover:border-green-700"
      }`}
    >
      <div className="absolute top-2.5 right-2.5 flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-300 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
          <Edit2 size={10} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 dark:text-gray-500 hover:text-red-400 transition-colors">
          <X size={10} />
        </button>
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-12">{stock.name}</p>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{stock.ticker}</p>
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{subText}</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
          {totalKrw > 0 ? fmtCompact(totalKrw) : "—"}
        </p>
      </div>
    </div>
  );
}

// ─── Scrollable Card List ────────────────────────────────
function CardList({
  stocks, selectedId, usdKrw, onSelect, onEdit, onDelete, onAdd, scrollRef,
}: {
  stocks: Stock[]; selectedId: string | null; usdKrw: number;
  onSelect: (id: string) => void; onEdit: (s: Stock) => void;
  onDelete: (id: string) => void; onAdd: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const scroll = (dir: "left" | "right") =>
    scrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });

  return (
    <div className="relative">
      <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-7 h-7 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
        <ChevronLeft size={14} />
      </button>

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-1 px-1" style={{ scrollbarWidth: "none" }}>
        {stocks.length === 0 ? (
          <div className="shrink-0 flex items-center justify-center w-44 h-[92px] rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <button onClick={onAdd} className="text-xs text-gray-400 hover:text-green-500 font-medium transition-colors">
              + 종목 추가하기
            </button>
          </div>
        ) : (
          stocks.map((stock) => (
            <StockCard
              key={stock.id}
              stock={stock}
              selected={selectedId === stock.id}
              usdKrw={usdKrw}
              onSelect={() => onSelect(stock.id)}
              onEdit={() => onEdit(stock)}
              onDelete={() => onDelete(stock.id)}
            />
          ))
        )}
      </div>

      <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-7 h-7 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────
function Section({
  title, badge, stocks, selectedId, usdKrw, onSelect, onEdit, onDelete, onAdd, scrollRef, chart,
}: {
  title: string; badge: string; stocks: Stock[]; selectedId: string | null; usdKrw: number;
  onSelect: (id: string) => void; onEdit: (s: Stock) => void; onDelete: (id: string) => void;
  onAdd: () => void; scrollRef: React.RefObject<HTMLDivElement | null>; chart: React.ReactNode;
}) {
  const total = stocks.reduce((s, st) => s + stockTotalKrw(st, usdKrw), 0);
  const selectedStock = stocks.find((s) => s.id === selectedId);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-900 dark:text-white">{title}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">{badge}</span>
          {total > 0 && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500">총 {fmtCompact(total)}</span>
          )}
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          <Plus size={11} />
          추가
        </button>
      </div>

      {/* Card list */}
      <div className="px-4 pb-4">
        <CardList
          stocks={stocks} selectedId={selectedId} usdKrw={usdKrw}
          onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onAdd={onAdd}
          scrollRef={scrollRef}
        />
      </div>

      {/* Chart */}
      <div className="border-t border-gray-100 dark:border-gray-700" style={{ height: 420 }}>
        {selectedStock ? (
          chart
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/30">
            <BarChart2 size={28} className="text-gray-200 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500">종목을 선택하면 차트가 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function StocksPage() {
  const { isDark } = useDarkMode();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [domesticId, setDomesticId] = useState<string | null>(null);
  const [foreignId, setForeignId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalMode | null>(null);

  const domesticScrollRef = useRef<HTMLDivElement>(null);
  const foreignScrollRef = useRef<HTMLDivElement>(null);

  const [rates, setRates] = useState<ExchangeRates>({
    usdKrw: 0, jpyKrw: 0, eurKrw: 0, fetchedAt: "", loading: true, error: false,
  });

  useEffect(() => {
    const loaded = loadStocks();
    setStocks(loaded);
    const domestic = loaded.filter((s) => s.currency === "KRW");
    const foreign = loaded.filter((s) => s.currency === "USD");
    if (domestic.length) setDomesticId(domestic[0].id);
    if (foreign.length) setForeignId(foreign[0].id);
  }, []);

  const fetchRates = useCallback(async () => {
    setRates((r) => ({ ...r, loading: true, error: false }));
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await res.json();
      if (data.result === "success") {
        const krw: number = data.rates.KRW;
        const jpy: number = data.rates.JPY;
        const eur: number = data.rates.EUR;
        setRates({
          usdKrw: Math.round(krw),
          jpyKrw: Math.round((krw / jpy) * 100),
          eurKrw: Math.round(krw / eur),
          fetchedAt: new Date().toLocaleTimeString("ko-KR"),
          loading: false, error: false,
        });
      } else throw new Error("api error");
    } catch {
      setRates((r) => ({ ...r, loading: false, error: true }));
    }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const handleSave = (stockData: Omit<Stock, "id">) => {
    if (modal?.type === "edit") {
      const updated = stocks.map((s) =>
        s.id === modal.stock.id ? { ...stockData, id: modal.stock.id } : s
      );
      setStocks(updated);
      saveStocks(updated);
    } else {
      const newStock: Stock = { ...stockData, id: `${Date.now()}` };
      const updated = [...stocks, newStock];
      setStocks(updated);
      saveStocks(updated);
      if (newStock.currency === "KRW") setDomesticId(newStock.id);
      else setForeignId(newStock.id);
    }
    setModal(null);
  };

  const handleDelete = (id: string) => {
    const updated = stocks.filter((s) => s.id !== id);
    setStocks(updated);
    saveStocks(updated);
    const domestic = updated.filter((s) => s.currency === "KRW");
    const foreign = updated.filter((s) => s.currency === "USD");
    if (domesticId === id) setDomesticId(domestic[0]?.id ?? null);
    if (foreignId === id) setForeignId(foreign[0]?.id ?? null);
  };

  const domesticStocks = stocks.filter((s) => s.currency === "KRW");
  const foreignStocks = stocks.filter((s) => s.currency === "USD");
  const domesticSelected = domesticStocks.find((s) => s.id === domesticId);
  const foreignSelected = foreignStocks.find((s) => s.id === foreignId);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 pb-10 flex flex-col gap-4">

      {/* ── 환율 ── */}
      <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <ExchangeCard
          label="USD / KRW"
          rate={rates.usdKrw > 0 ? `${rates.usdKrw.toLocaleString("ko-KR")}원` : "—"}
          sub={rates.fetchedAt ? `${rates.fetchedAt} 기준` : undefined}
          loading={rates.loading} error={rates.error}
        />
        <ExchangeCard
          label="100엔 / KRW"
          rate={rates.jpyKrw > 0 ? `${rates.jpyKrw.toLocaleString("ko-KR")}원` : "—"}
          loading={rates.loading} error={rates.error}
        />
        <ExchangeCard
          label="EUR / KRW"
          rate={rates.eurKrw > 0 ? `${rates.eurKrw.toLocaleString("ko-KR")}원` : "—"}
          loading={rates.loading} error={rates.error}
        />
        <button
          onClick={fetchRates}
          disabled={rates.loading}
          className="shrink-0 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={rates.loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ── 국내 주식 / ETF ── */}
      <Section
        title="국내 주식 / ETF"
        badge="네이버 금융"
        stocks={domesticStocks}
        selectedId={domesticId}
        usdKrw={rates.usdKrw}
        onSelect={setDomesticId}
        onEdit={(s) => setModal({ type: "edit", stock: s })}
        onDelete={handleDelete}
        onAdd={() => setModal({ type: "add", defaultCurrency: "KRW" })}
        scrollRef={domesticScrollRef}
        chart={
          domesticSelected ? (
            <KoreanStockChart
              key={domesticSelected.ticker}
              ticker={domesticSelected.ticker}
              isDark={isDark}
            />
          ) : null
        }
      />

      {/* ── 해외 주식 ── */}
      <Section
        title="해외 주식"
        badge="TradingView"
        stocks={foreignStocks}
        selectedId={foreignId}
        usdKrw={rates.usdKrw}
        onSelect={setForeignId}
        onEdit={(s) => setModal({ type: "edit", stock: s })}
        onDelete={handleDelete}
        onAdd={() => setModal({ type: "add", defaultCurrency: "USD" })}
        scrollRef={foreignScrollRef}
        chart={
          foreignSelected ? (
            <TradingViewChart
              symbol={foreignSelected.ticker}
              isDark={isDark}
            />
          ) : null
        }
      />

      {modal && (
        <StockModal mode={modal} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
