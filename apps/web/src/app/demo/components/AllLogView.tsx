"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { TriangleAlert, Plus } from "lucide-react";
import { type ExpenseMap, type Expense, CATEGORIES, CATEGORY_BADGE } from "../data";

type Props = {
  allExpenses: ExpenseMap;
  onAddExpense: (date: string, expense: Omit<Expense, "id">) => void;
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const CHUNK_SIZE = 5;
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

function DayCard({
  date,
  items,
  isToday = false,
  onAdd,
}: {
  date: string;
  items: Expense[];
  isToday?: boolean;
  onAdd: (expense: Omit<Expense, "id">) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [place, setPlace] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [isWaste, setIsWaste] = useState(false);

  const isValid = Number(amount) > 0;
  const total = items.reduce((sum, e) => sum + e.amount, 0);
  const waste = items.filter((e) => e.isWaste).reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = () => {
    if (!isValid) return;
    onAdd({ place: place.trim() || "-", amount: Number(amount), category, isWaste });
    setAmount("");
    setPlace("");
    setCategory(CATEGORIES[0]);
    setIsWaste(false);
  };

  const handleOpen = () => setExpanded(true);
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
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

      {/* 아이템 리스트 */}
      {items.length > 0 && (
        <ul className="divide-y divide-gray-50">
          {items.map((expense) => (
            <li key={expense.id} className="flex items-center gap-2 px-4 py-3">
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
              <div className="flex items-center gap-1.5 min-w-0">
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
            </li>
          ))}
        </ul>
      )}

      {/* 빈 상태 */}
      {!expanded && items.length === 0 && (
        <div className="px-4 py-8 flex flex-col items-center gap-2">
          <Plus size={22} className="text-gray-300" />
          <span className="text-sm text-gray-400">
            {isToday ? "오늘 지출 내역이 없습니다. 탭하여 추가하세요" : "탭하여 추가하세요"}
          </span>
        </div>
      )}

      {/* 입력 폼 */}
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
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-8 text-right text-base font-bold text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent focus:bg-white transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
                원
              </span>
            </div>
            <input
              type="text"
              placeholder="사용처 (선택)"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent focus:bg-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setIsWaste((v) => !v)}
              className="flex items-center gap-1.5 shrink-0"
            >
              <span
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  isWaste ? "bg-orange-400" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    isWaste ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </span>
              <span
                className={`text-xs font-medium ${
                  isWaste ? "text-orange-500" : "text-gray-400"
                }`}
              >
                낭비
              </span>
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
                    category === cat
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              onClick={handleAdd}
              disabled={!isValid}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                isValid
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              추가
            </button>
          </div>
        </div>
      )}

      {/* 푸터 */}
      {items.length > 0 && (
        <div
          className="px-4 py-2.5 bg-gray-50 flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">{fmt(total)}</span>
            {waste > 0 && (
              <span className="text-xs text-orange-500 font-medium">낭비 {fmt(waste)}</span>
            )}
            <span className="text-xs text-gray-400">{items.length}건</span>
          </div>
          {expanded && (
            <button
              onClick={handleClose}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              저장
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AllLogView({ allExpenses, onAddExpense }: Props) {
  const todayKey = getTodayKey();
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const allDates = useMemo(
    () => Object.keys(allExpenses).sort((a, b) => b.localeCompare(a)),
    [allExpenses]
  );

  // 오늘 날짜가 목록에 없으면 맨 앞에 추가
  const datesWithToday = useMemo(() => {
    if (allDates.includes(todayKey)) return allDates;
    return [todayKey, ...allDates];
  }, [allDates, todayKey]);

  const visibleDates = datesWithToday.slice(0, visibleCount);
  const hasMore = visibleCount < datesWithToday.length;

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((c) => c + CHUNK_SIZE);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  if (datesWithToday.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        지출 내역이 없습니다
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {visibleDates.map((date) => (
        <DayCard
          key={date}
          date={date}
          items={allExpenses[date] ?? []}
          isToday={date === todayKey}
          onAdd={(expense) => onAddExpense(date, expense)}
        />
      ))}

      {hasMore ? (
        <div ref={sentinelRef} className="flex items-center justify-center py-6 text-sm text-gray-400">
          불러오는 중...
        </div>
      ) : (
        <p className="text-center text-xs text-gray-400 py-6">모든 내역을 불러왔습니다</p>
      )}
    </div>
  );
}
