"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { TriangleAlert } from "lucide-react";
import { type ExpenseMap, type Expense } from "../data";

type Props = {
  allExpenses: ExpenseMap;
  onDayClick: (date: string) => void;
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const CHUNK_SIZE = 5;
const fmt = (n: number) => n.toLocaleString("ko-KR") + "원";

function parseDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const day = DAYS[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${day})`;
}

function DayCard({
  date,
  items,
  onDayClick,
}: {
  date: string;
  items: Expense[];
  onDayClick: (date: string) => void;
}) {
  const total = items.reduce((sum, e) => sum + e.amount, 0);
  const waste = items.filter((e) => e.isWaste).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <h3 className="text-sm font-bold text-gray-700">{parseDateLabel(date)}</h3>
      </div>
      <ul className="divide-y divide-gray-50">
        {items.map((expense) => (
          <li
            key={expense.id}
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onDayClick(date)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {expense.isWaste ? (
                <TriangleAlert size={13} className="text-orange-400 shrink-0" />
              ) : (
                <span className="w-3.5 shrink-0" />
              )}
              <span className={`text-sm truncate ${expense.isWaste ? "text-orange-600" : "text-gray-800"}`}>
                {expense.place}
              </span>
            </div>
            <span className={`text-sm font-semibold shrink-0 ml-3 ${expense.isWaste ? "text-orange-500" : "text-gray-900"}`}>
              {fmt(expense.amount)}
            </span>
          </li>
        ))}
      </ul>
      <div className="px-4 py-2.5 bg-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-400">{items.length}건</span>
        <div className="flex items-center gap-3">
          {waste > 0 && (
            <span className="text-xs text-orange-500 font-medium">낭비 {fmt(waste)}</span>
          )}
          <span className="text-sm font-bold text-gray-800">{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

export default function AllLogView({ allExpenses, onDayClick }: Props) {
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const allDates = useMemo(
    () => Object.keys(allExpenses).sort((a, b) => b.localeCompare(a)),
    [allExpenses]
  );

  const visibleDates = allDates.slice(0, visibleCount);
  const hasMore = visibleCount < allDates.length;

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

  if (allDates.length === 0) {
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
          onDayClick={onDayClick}
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
