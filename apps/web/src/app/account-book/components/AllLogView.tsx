'use client';

import { useRef, useCallback } from 'react';
import { type Expense, type ExpenseMap } from '../types';
import DayCard from './DayCard';

type Props = {
  year: number;
  month: number;
  expenses: ExpenseMap;
  onAdd: (dateKey: string, expense: Omit<Expense, 'id'>) => Promise<void>;
  onEdit: (dateKey: string, updated: Expense) => Promise<void>;
  onDelete: (dateKey: string, id: string) => Promise<void>;
  onLoadMore?: () => void;
  hasMore?: boolean;
};

function getMonthDateKeys(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }).reverse();
}

export default function AllLogView({ year, month, expenses, onAdd, onEdit, onDelete, onLoadMore, hasMore }: Props) {
  const observer = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      if (!node || !onLoadMore) return;
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });
      observer.current.observe(node);
    },
    [onLoadMore, hasMore]
  );

  const dateKeys = getMonthDateKeys(year, month);
  const datesWithData = dateKeys.filter((k) => (expenses[k] ?? []).length > 0);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Show today + dates with data (deduplicated)
  const displayKeys = Array.from(new Set([todayKey, ...datesWithData])).sort((a, b) => b.localeCompare(a)).filter(
    (k) => k.startsWith(`${year}-${String(month).padStart(2, '0')}`)
  );

  if (displayKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl mb-4">📋</span>
        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">이번 달 지출 내역이 없어요</p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">날짜를 클릭해 지출을 기록해보세요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {displayKeys.map((dateKey, idx) => (
        <DayCard
          key={dateKey}
          dateKey={dateKey}
          expenses={expenses[dateKey] ?? []}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          showDate
        />
      ))}

      {hasMore && (
        <div ref={sentinelRef} className="h-10 flex items-center justify-center">
          <span className="text-xs text-gray-400 dark:text-gray-500">불러오는 중...</span>
        </div>
      )}
    </div>
  );
}
