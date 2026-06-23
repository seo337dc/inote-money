"use client";

import { cn } from "@/lib/utils";
import { type ExpenseMap } from "../data";

type Props = {
  year: number;
  month: number;
  expenses: ExpenseMap;
  onDayClick: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function fmt(n: number) {
  if (n >= 10_000) return (n / 10_000).toFixed(n % 10_000 === 0 ? 0 : 1) + "만";
  return n.toLocaleString("ko-KR");
}

export default function LedgerCalendar({ year, month, expenses, onDayClick, onPrev, onNext }: Props) {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white dark:bg-gray-800 lg:rounded-2xl lg:shadow-sm border-y lg:border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={onPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors text-lg"
          aria-label="이전 달"
        >
          ‹
        </button>
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          {year}년 {month}월
        </h2>
        <button
          onClick={onNext}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors text-lg"
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              "py-2.5 text-center text-xs font-semibold",
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400 dark:text-gray-500"
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[60px] md:min-h-[100px] xl:min-h-[120px] bg-gray-50/40 dark:bg-gray-700/30 border-b border-r border-gray-50 dark:border-gray-700"
              />
            );
          }

          const dateKey = toDateKey(year, month, day);
          const dayExpenses = expenses[dateKey] ?? [];
          const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
          const waste = dayExpenses.filter((e) => e.isWaste).reduce((sum, e) => sum + e.amount, 0);
          const isToday = dateKey === todayKey;
          const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
          const hasData = total > 0;

          return (
            <button
              key={dateKey}
              onClick={() => onDayClick(dateKey)}
              className={cn(
                "min-h-[60px] md:min-h-[100px] xl:min-h-[120px] p-1.5 md:p-2.5 text-left border-b border-r border-gray-50 dark:border-gray-700",
                "flex flex-col transition-colors hover:bg-green-50/50 dark:hover:bg-green-900/20 focus:outline-none focus:bg-green-50/50 dark:focus:bg-green-900/20",
                "last-of-type:border-r-0"
              )}
            >
              {/* Date number */}
              <span
                className={cn(
                  "text-xs md:text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 shrink-0",
                  isToday
                    ? "bg-green-500 text-white"
                    : dayOfWeek === 0
                    ? "text-red-400"
                    : dayOfWeek === 6
                    ? "text-blue-400"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                {day}
              </span>

              {/* Desktop: amounts text */}
              {hasData && (
                <div className="hidden sm:flex flex-col gap-0.5 min-w-0 w-full">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium truncate leading-tight">
                    {fmt(total)}
                  </span>
                  {waste > 0 && (
                    <span className="text-[10px] text-orange-500 font-medium truncate leading-tight">
                      낭비 {fmt(waste)}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
                    {dayExpenses.length}건
                  </span>
                </div>
              )}

              {/* Mobile: colored dots */}
              {hasData && (
                <div className="flex gap-1 sm:hidden mt-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  {waste > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-xs text-gray-400 dark:text-gray-500">지출</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          <span className="text-xs text-gray-400 dark:text-gray-500">낭비</span>
        </div>
      </div>
    </div>
  );
}
