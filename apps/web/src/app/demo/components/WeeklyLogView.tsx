"use client";

import { useState, useMemo } from "react";
import { TriangleAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { type ExpenseMap, type Expense } from "../data";

type Props = {
  monthExpenses: ExpenseMap;
  month: number;
  onDayClick: (date: string) => void;
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const fmt = (n: number) => n.toLocaleString("ko-KR") + "원";

function parseDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const day = DAYS[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${day})`;
}

function getWeekLabel(dateStr: string, month: number) {
  const day = parseInt(dateStr.split("-")[2]);
  return `${month}월 ${Math.ceil(day / 7)}주차`;
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

export default function WeeklyLogView({ monthExpenses, month, onDayClick }: Props) {
  // 주차별 그룹핑 — 오름차순 (1주차 → 마지막 주차)
  const weeklyGroups = useMemo(() => {
    const dates = Object.keys(monthExpenses).sort((a, b) => b.localeCompare(a));
    const grouped = new Map<string, string[]>();
    for (const date of dates) {
      const label = getWeekLabel(date, month);
      if (!grouped.has(label)) grouped.set(label, []);
      grouped.get(label)!.push(date);
    }
    // 오름차순으로 변환 (index 기준 이동을 위해)
    return Array.from(grouped.entries()).reverse();
  }, [monthExpenses, month]);

  // 기본값: 가장 최근 주차
  const [activeIndex, setActiveIndex] = useState(() => weeklyGroups.length - 1);

  const safeIndex = Math.min(Math.max(activeIndex, 0), weeklyGroups.length - 1);
  const [weekLabel, dates] = weeklyGroups[safeIndex] ?? ["", []];

  const canGoPrev = safeIndex > 0;
  const canGoNext = safeIndex < weeklyGroups.length - 1;

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
          disabled={!canGoPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="이전 주차"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-sm font-bold text-gray-700">{weekLabel}</span>

        <button
          onClick={() => setActiveIndex((i) => i + 1)}
          disabled={!canGoNext}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="다음 주차"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 해당 주차 날짜 목록 */}
      <div className="flex flex-col gap-3">
        {dates.map((date) => (
          <DayCard
            key={date}
            date={date}
            items={monthExpenses[date] ?? []}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </div>
  );
}
