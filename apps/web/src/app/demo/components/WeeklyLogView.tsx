"use client";

import { useState, useMemo } from "react";
import { TriangleAlert, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { type ExpenseMap, type Expense, CATEGORIES, CATEGORY_BADGE } from "../data";

type Props = {
  monthExpenses: ExpenseMap;
  month: number;
  onAddExpense: (date: string, expense: Omit<Expense, "id">) => void;
  onDeleteExpense: (date: string, id: string) => void;
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const fmt = (n: number) => n.toLocaleString("ko-KR") + "원";

function getTodayKey() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

function parseDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const day = DAYS[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${day})`;
}

function getWeekLabel(dateStr: string, month: number) {
  const day = parseInt(dateStr.split("-")[2]);
  return `${month}월 ${Math.ceil(day / 7)}주차`;
}

// ── 통합 날짜 카드 (오늘 + 과거 모두 클릭 시 인라인 입력) ─────────
function DayCard({
  date,
  items,
  isToday = false,
  onAdd,
  onDelete,
}: {
  date: string;
  items: Expense[];
  isToday?: boolean;
  onAdd: (expense: Omit<Expense, "id">) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pendingItems, setPendingItems] = useState<Omit<Expense, "id">[]>([]);
  const [place, setPlace] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [isWaste, setIsWaste] = useState(false);

  const isValid = Number(amount) > 0;
  const savedTotal = items.reduce((sum, e) => sum + e.amount, 0);
  const savedWaste = items.filter((e) => e.isWaste).reduce((sum, e) => sum + e.amount, 0);
  const pendingTotal = pendingItems.reduce((sum, e) => sum + e.amount, 0);
  const pendingWaste = pendingItems.filter((e) => e.isWaste).reduce((sum, e) => sum + e.amount, 0);
  const total = savedTotal + pendingTotal;
  const waste = savedWaste + pendingWaste;
  const totalCount = items.length + pendingItems.length;

  const handleAddPending = () => {
    if (!isValid) return;
    setPendingItems((prev) => [
      ...prev,
      { place: place.trim() || "-", amount: Number(amount), category, isWaste },
    ]);
    setAmount("");
    setPlace("");
    setCategory(CATEGORIES[0]);
    setIsWaste(false);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    pendingItems.forEach((item) => onAdd(item));
    setPendingItems([]);
    setExpanded(false);
  };

  const handleOpen = () => setExpanded(true);
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingItems([]);
    setExpanded(false);
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-colors ${
        isToday
          ? "border-2 border-dashed border-gray-200"
          : "border border-gray-100"
      } ${!expanded ? "cursor-pointer hover:bg-gray-50/50" : ""}`}
      onClick={!expanded ? handleOpen : undefined}
    >
      {/* 날짜 헤더 */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-700">{parseDateLabel(date)}</h3>
          {isToday && (
            <span className="text-[10px] bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-full">
              오늘
            </span>
          )}
        </div>
        {expanded && (
          <button
            onClick={handleClose}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* 아이템 리스트 (항상 표시) */}
      {items.length > 0 && (
        <ul className="divide-y divide-gray-50">
          {items.map((expense) => (
            <li key={expense.id} className="flex items-center gap-2 px-4 py-3 group">
              <span
                className={`text-sm font-semibold shrink-0 ${
                  expense.isWaste ? "text-orange-500" : "text-gray-900"
                }`}
              >
                {fmt(expense.amount)}
              </span>
              {expense.isWaste && (
                <TriangleAlert size={13} className="text-orange-400 shrink-0" />
              )}
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span
                  className={`text-sm truncate ${
                    expense.isWaste ? "text-orange-500" : "text-gray-600"
                  }`}
                >
                  {expense.place !== "-" ? expense.place : ""}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                    CATEGORY_BADGE[expense.category] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {expense.category}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(expense.id); }}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 저장 대기 아이템 */}
      {pendingItems.length > 0 && (
        <ul className="divide-y divide-green-50 bg-green-50/40">
          {pendingItems.map((expense, i) => (
            <li key={`pending-${i}`} className="flex items-center gap-2 px-4 py-3">
              <span className={`text-sm font-semibold shrink-0 ${expense.isWaste ? "text-orange-500" : "text-gray-900"}`}>
                {fmt(expense.amount)}
              </span>
              {expense.isWaste && <TriangleAlert size={13} className="text-orange-400 shrink-0" />}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`text-sm truncate ${expense.isWaste ? "text-orange-500" : "text-gray-600"}`}>
                  {expense.place !== "-" ? expense.place : ""}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${CATEGORY_BADGE[expense.category] ?? "bg-gray-100 text-gray-600"}`}>
                  {expense.category}
                </span>
              </div>
              <span className="ml-auto text-[10px] text-green-500 font-medium shrink-0">미저장</span>
            </li>
          ))}
        </ul>
      )}

      {/* 빈 상태 (접힌 + 아이템 없음) */}
      {!expanded && items.length === 0 && pendingItems.length === 0 && (
        <div className="px-4 py-8 flex flex-col items-center gap-2">
          <Plus size={22} className="text-gray-300" />
          <span className="text-sm text-gray-400">
            {isToday ? "오늘 지출 내역이 없습니다. 탭하여 추가하세요" : "탭하여 추가하세요"}
          </span>
        </div>
      )}

      {/* 입력 폼 (펼침 상태) */}
      {expanded && (
        <div
          className="px-4 pt-4 pb-3 flex flex-col gap-3 border-t border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2 items-center">
            <div className="relative w-36 shrink-0">
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPending()}
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-8 text-right text-base font-bold text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent focus:bg-white transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">원</span>
            </div>
            <input
              type="text"
              placeholder="사용처 (선택)"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPending()}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent focus:bg-white transition-colors"
            />
            <button type="button" onClick={() => setIsWaste((v) => !v)} className="flex items-center gap-1.5 shrink-0">
              <span className={`relative w-10 h-5 rounded-full transition-colors ${isWaste ? "bg-orange-400" : "bg-gray-200"}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isWaste ? "translate-x-5" : "translate-x-0"}`} />
              </span>
              <span className={`text-xs font-medium ${isWaste ? "text-orange-500" : "text-gray-400"}`}>낭비</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                    category === cat ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              onClick={handleAddPending}
              disabled={!isValid}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                isValid ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              추가
            </button>
          </div>
        </div>
      )}

      {/* 푸터 */}
      {(items.length > 0 || pendingItems.length > 0) && (
        <div className="px-4 py-2.5 bg-gray-50 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">{fmt(total)}</span>
            {waste > 0 && <span className="text-xs text-orange-500 font-medium">낭비 {fmt(waste)}</span>}
            <span className="text-xs text-gray-400">{totalCount}건</span>
          </div>
          {expanded && pendingItems.length > 0 && (
            <button onClick={handleSave} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition-colors">
              저장 ({pendingItems.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────
export default function WeeklyLogView({ monthExpenses, month, onAddExpense, onDeleteExpense }: Props) {
  const todayKey = getTodayKey();
  const todayMonth = new Date().getMonth() + 1;
  const todayWeekNum = Math.ceil(new Date().getDate() / 7);
  const todayWeekLabel = `${todayMonth}월 ${todayWeekNum}주차`;

  const weeklyGroups = useMemo(() => {
    const dates = Object.keys(monthExpenses).sort((a, b) => b.localeCompare(a));
    const grouped = new Map<string, string[]>();
    for (const date of dates) {
      const label = getWeekLabel(date, month);
      if (!grouped.has(label)) grouped.set(label, []);
      grouped.get(label)!.push(date);
    }
    if (month === todayMonth && !grouped.has(todayWeekLabel)) {
      grouped.set(todayWeekLabel, []);
    }
    return Array.from(grouped.entries()).sort(([a], [b]) => {
      const wA = parseInt(a.match(/(\d+)주차/)?.[1] ?? "0");
      const wB = parseInt(b.match(/(\d+)주차/)?.[1] ?? "0");
      return wA - wB;
    });
  }, [monthExpenses, month, todayWeekLabel, todayMonth]);

  const defaultIndex = useMemo(() => {
    const idx = weeklyGroups.findIndex(([label]) => label === todayWeekLabel);
    return idx >= 0 ? idx : weeklyGroups.length - 1;
  }, [weeklyGroups, todayWeekLabel]);

  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const safeIndex = Math.min(Math.max(activeIndex, 0), weeklyGroups.length - 1);
  const [weekLabel, dates] = weeklyGroups[safeIndex] ?? ["", []];

  const isCurrentWeek = weekLabel === todayWeekLabel && month === todayMonth;

  if (weeklyGroups.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        이번달 지출 내역이 없습니다
      </div>
    );
  }

  return (
    <div>
      {/* 주차 네비게이션 */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          onClick={() => setActiveIndex((i) => i - 1)}
          disabled={safeIndex === 0}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-bold text-gray-700">{weekLabel}</span>
        <button
          onClick={() => setActiveIndex((i) => i + 1)}
          disabled={safeIndex === weeklyGroups.length - 1}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 카드 목록 */}
      <div className="flex flex-col gap-3">
        {/* 오늘 카드 — 현재 주차에만 표시 */}
        {isCurrentWeek && (
          <DayCard
            date={todayKey}
            items={monthExpenses[todayKey] ?? []}
            isToday
            onAdd={(expense) => onAddExpense(todayKey, expense)}
            onDelete={(id) => onDeleteExpense(todayKey, id)}
          />
        )}

        {/* 나머지 날짜 카드 (오늘 제외, 최신순) */}
        {dates
          .filter((d) => d !== todayKey)
          .sort((a, b) => b.localeCompare(a))
          .map((date) => (
            <DayCard
              key={date}
              date={date}
              items={monthExpenses[date] ?? []}
              onAdd={(expense) => onAddExpense(date, expense)}
              onDelete={(id) => onDeleteExpense(date, id)}
            />
          ))}
      </div>
    </div>
  );
}
