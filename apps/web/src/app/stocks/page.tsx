"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, X, Edit2, RefreshCw, BarChart2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useDarkMode } from "@/lib/dark-mode";
import { api } from "@/lib/api";
import { KoreanStockChart } from "./components/KoreanStockChart";
import { Input } from "@/components/ui/input";
import { Dialog, DialogPortal, DialogOverlay, DialogPopup } from "@/components/ui/dialog";
import LoadingScreen from "@/components/LoadingScreen";

// ─── Types ───────────────────────────────────────────────
type Market = "KR" | "US";
type InputMode = "QUANTITY" | "AMOUNT";

type Holding = {
  id: string;
  market: Market;
  ticker: string | null;
  name: string;
  inputMode: InputMode;
  quantity: number | null;
  averagePrice: number | null;
  investedAmount: number | null;
};

type HoldingBody = {
  market: Market;
  ticker?: string;
  name: string;
  inputMode: InputMode;
  quantity?: number;
  averagePrice?: number;
  investedAmount?: number;
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
  | { type: "add"; defaultMarket: Market }
  | { type: "edit"; holding: Holding };

// ─── Helpers ─────────────────────────────────────────────
function fmt(n: number, market: Market = "KR") {
  if (market === "US")
    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  return `${n.toLocaleString("ko-KR")}원`;
}

function fmtCompact(n: number) {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`;
  if (n >= 10_000) return `${Math.round(n / 10_000)}만원`;
  return `${n.toLocaleString("ko-KR")}원`;
}

function holdingTotalKrw(h: Holding, usdKrw: number): number {
  if (h.inputMode === "AMOUNT") {
    const usd = h.investedAmount ?? 0;
    return h.market === "US" && usdKrw > 0 ? usd * usdKrw : usd;
  }
  const total = (h.quantity ?? 0) * (h.averagePrice ?? 0);
  return h.market === "US" && usdKrw > 0 ? total * usdKrw : total;
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

// ─── Holding Modal ───────────────────────────────────────
type FormState = {
  ticker: string;
  name: string;
  market: Market;
  inputMode: InputMode;
  quantity: string;
  averagePrice: string;
  investedAmount: string;
};

function HoldingModal({
  mode,
  onSave,
  onClose,
  saving,
}: {
  mode: ModalMode;
  onSave: (body: HoldingBody) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(() => {
    if (mode.type === "edit") {
      const h = mode.holding;
      return {
        ticker: h.ticker ?? "", name: h.name, market: h.market, inputMode: h.inputMode,
        quantity: h.quantity != null ? String(h.quantity) : "",
        averagePrice: h.averagePrice != null ? String(h.averagePrice) : "",
        investedAmount: h.investedAmount != null ? String(h.investedAmount) : "",
      };
    }
    const market = mode.defaultMarket;
    return {
      ticker: "", name: "", market,
      inputMode: market === "KR" ? "QUANTITY" : "AMOUNT",
      quantity: "", averagePrice: "", investedAmount: "",
    };
  });

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleMarketChange = (v: string) =>
    setForm((f) => ({ ...f, market: v as Market, inputMode: v === "KR" ? "QUANTITY" : "AMOUNT" }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    const base: HoldingBody = {
      market: form.market,
      name: form.name.trim(),
      inputMode: form.inputMode,
      ...(form.ticker.trim() ? { ticker: form.ticker.trim().toUpperCase() } : {}),
    };
    if (form.inputMode === "QUANTITY") {
      const quantity = Number(form.quantity);
      const averagePrice = Number(form.averagePrice);
      onSave({
        ...base,
        ...(quantity > 0 ? { quantity } : {}),
        ...(averagePrice > 0 ? { averagePrice } : {}),
      });
    } else {
      const investedAmount = Number(form.investedAmount);
      onSave({ ...base, ...(investedAmount > 0 ? { investedAmount } : {}) });
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPopup className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
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
            <Input type="text" value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="삼성전자, 애플..." />
          </div>
          <div>
            <label className={LABEL}>티커 (선택)</label>
            <Input type="text" value={form.ticker} onChange={(e) => set("ticker")(e.target.value)} placeholder="국내: 005930 / 해외: NASDAQ:AAPL" />
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">국내는 종목코드, 해외는 거래소:티커 형식 (차트 조회에 사용돼요)</p>
          </div>
          <div>
            <label className={LABEL}>시장</label>
            <select value={form.market} onChange={(e) => handleMarketChange(e.target.value)} className={INPUT}>
              <option value="KR">국내 (KR)</option>
              <option value="US">해외 (US)</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>입력 방식</label>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
              <button type="button" onClick={() => set("inputMode")("QUANTITY")} className={TAB(form.inputMode === "QUANTITY")}>
                수량으로 입력 (주)
              </button>
              <button type="button" onClick={() => set("inputMode")("AMOUNT")} className={TAB(form.inputMode === "AMOUNT")}>
                금액으로 입력
              </button>
            </div>
          </div>

          {form.inputMode === "QUANTITY" ? (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className={LABEL}>보유 수량</label>
                <div className="relative">
                  <Input type="number" value={form.quantity} onChange={(e) => set("quantity")(e.target.value)} placeholder="0" className="pr-6" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">주</span>
                </div>
              </div>
              <div className="flex-1">
                <label className={LABEL}>평균 매입가</label>
                <div className="relative">
                  <Input type="number" value={form.averagePrice} onChange={(e) => set("averagePrice")(e.target.value)} placeholder="0" className="pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    {form.market === "KR" ? "원" : "$"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className={LABEL}>투자 금액</label>
              <div className="relative">
                <Input type="number" value={form.investedAmount} onChange={(e) => set("investedAmount")(e.target.value)} placeholder="0" className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  {form.market === "KR" ? "원" : "USD"}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">소액 분할 매수 등 총 투자금액만 기록</p>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || saving}
            className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            {saving ? "저장 중..." : mode.type === "add" ? "추가하기" : "저장하기"}
          </button>
        </div>
      </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
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

// ─── Holding Card ────────────────────────────────────────
function HoldingCard({ holding, selected, usdKrw, onSelect, onEdit, onDelete }: {
  holding: Holding; selected: boolean; usdKrw: number;
  onSelect: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const totalKrw = holdingTotalKrw(holding, usdKrw);
  const subText = holding.inputMode === "QUANTITY"
    ? `${holding.quantity ?? 0}주 · 매입 ${fmt(holding.averagePrice ?? 0, holding.market)}`
    : `투자 ${fmt(holding.investedAmount ?? 0, holding.market)}`;

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
      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-12">{holding.name}</p>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{holding.ticker || "—"}</p>
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
  holdings, selectedId, usdKrw, onSelect, onEdit, onDelete, onAdd, scrollRef,
}: {
  holdings: Holding[]; selectedId: string | null; usdKrw: number;
  onSelect: (id: string) => void; onEdit: (h: Holding) => void;
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
        {holdings.length === 0 ? (
          <div className="shrink-0 flex items-center justify-center w-44 h-[92px] rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <button onClick={onAdd} className="text-xs text-gray-400 hover:text-green-500 font-medium transition-colors">
              + 종목 추가하기
            </button>
          </div>
        ) : (
          holdings.map((holding) => (
            <HoldingCard
              key={holding.id}
              holding={holding}
              selected={selectedId === holding.id}
              usdKrw={usdKrw}
              onSelect={() => onSelect(holding.id)}
              onEdit={() => onEdit(holding)}
              onDelete={() => onDelete(holding.id)}
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
  title, badge, holdings, selectedId, usdKrw, onSelect, onEdit, onDelete, onAdd, scrollRef, chart,
}: {
  title: string; badge: string; holdings: Holding[]; selectedId: string | null; usdKrw: number;
  onSelect: (id: string) => void; onEdit: (h: Holding) => void; onDelete: (id: string) => void;
  onAdd: () => void; scrollRef: React.RefObject<HTMLDivElement | null>; chart: React.ReactNode;
}) {
  const total = holdings.reduce((s, h) => s + holdingTotalKrw(h, usdKrw), 0);
  const selectedHolding = holdings.find((h) => h.id === selectedId);

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
          holdings={holdings} selectedId={selectedId} usdKrw={usdKrw}
          onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onAdd={onAdd}
          scrollRef={scrollRef}
        />
      </div>

      {/* Chart */}
      <div className="border-t border-gray-100 dark:border-gray-700" style={{ height: 420 }}>
        {selectedHolding ? (
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
  const qc = useQueryClient();
  const [domesticId, setDomesticId] = useState<string | null>(null);
  const [foreignId, setForeignId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalMode | null>(null);

  const domesticScrollRef = useRef<HTMLDivElement>(null);
  const foreignScrollRef = useRef<HTMLDivElement>(null);

  const [rates, setRates] = useState<ExchangeRates>({
    usdKrw: 0, jpyKrw: 0, eurKrw: 0, fetchedAt: "", loading: true, error: false,
  });

  const { data: holdings = [], isLoading } = useQuery({
    queryKey: ["holdings"],
    queryFn: () => api.get<Holding[]>("/money/stocks"),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["holdings"] });

  const createMutation = useMutation({
    mutationFn: (body: HoldingBody) => api.post<Holding>("/money/stocks", body),
    onSuccess: (created) => {
      invalidate();
      if (created.market === "KR") setDomesticId(created.id);
      else setForeignId(created.id);
      setModal(null);
    },
    onError: () => toast.error("종목 저장에 실패했어요. 다시 시도해주세요."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: HoldingBody & { id: string }) =>
      api.patch<Holding>(`/money/stocks/${id}`, body),
    onSuccess: () => {
      invalidate();
      setModal(null);
    },
    onError: () => toast.error("종목 수정에 실패했어요. 다시 시도해주세요."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<void>(`/money/stocks/${id}`),
    onSuccess: (_, id) => {
      invalidate();
      if (domesticId === id) setDomesticId(null);
      if (foreignId === id) setForeignId(null);
    },
    onError: () => toast.error("종목 삭제에 실패했어요. 다시 시도해주세요."),
  });

  useEffect(() => {
    if (!holdings.length) return;
    const domestic = holdings.filter((h) => h.market === "KR");
    const foreign = holdings.filter((h) => h.market === "US");
    setDomesticId((cur) => cur ?? domestic[0]?.id ?? null);
    setForeignId((cur) => cur ?? foreign[0]?.id ?? null);
  }, [holdings]);

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

  const handleSave = (body: HoldingBody) => {
    if (modal?.type === "edit") {
      updateMutation.mutate({ id: modal.holding.id, ...body });
    } else {
      createMutation.mutate(body);
    }
  };

  const domesticHoldings = holdings.filter((h) => h.market === "KR");
  const foreignHoldings = holdings.filter((h) => h.market === "US");
  const domesticSelected = domesticHoldings.find((h) => h.id === domesticId);
  const foreignSelected = foreignHoldings.find((h) => h.id === foreignId);

  if (isLoading) return <LoadingScreen messages={["보유 종목을 불러오고 있습니다."]} />;

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
        holdings={domesticHoldings}
        selectedId={domesticId}
        usdKrw={rates.usdKrw}
        onSelect={setDomesticId}
        onEdit={(h) => setModal({ type: "edit", holding: h })}
        onDelete={(id) => deleteMutation.mutate(id)}
        onAdd={() => setModal({ type: "add", defaultMarket: "KR" })}
        scrollRef={domesticScrollRef}
        chart={
          domesticSelected?.ticker ? (
            <KoreanStockChart
              key={domesticSelected.ticker}
              ticker={domesticSelected.ticker}
              isDark={isDark}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/30">
              <p className="text-sm text-gray-400 dark:text-gray-500">티커를 등록하면 차트가 표시됩니다</p>
            </div>
          )
        }
      />

      {/* ── 해외 주식 ── */}
      <Section
        title="해외 주식"
        badge="TradingView"
        holdings={foreignHoldings}
        selectedId={foreignId}
        usdKrw={rates.usdKrw}
        onSelect={setForeignId}
        onEdit={(h) => setModal({ type: "edit", holding: h })}
        onDelete={(id) => deleteMutation.mutate(id)}
        onAdd={() => setModal({ type: "add", defaultMarket: "US" })}
        scrollRef={foreignScrollRef}
        chart={
          foreignSelected?.ticker ? (
            <TradingViewChart
              symbol={foreignSelected.ticker}
              isDark={isDark}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/30">
              <p className="text-sm text-gray-400 dark:text-gray-500">티커를 등록하면 차트가 표시됩니다</p>
            </div>
          )
        }
      />

      {modal && (
        <HoldingModal
          mode={modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
