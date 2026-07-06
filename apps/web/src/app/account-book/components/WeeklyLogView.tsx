'use client';

import { type Expense, type ExpenseMap } from '../types';
import DayCard from './DayCard';

type Props = {
  year: number;
  month: number;
  expenses: ExpenseMap;
  onAdd: (dateKey: string, expense: Omit<Expense, 'id'>) => Promise<void>;
  onEdit: (dateKey: string, updated: Expense) => Promise<void>;
  onDelete: (dateKey: string, id: string) => Promise<void>;
};

function getWeeksInMonth(year: number, month: number): string[][] {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = firstDay.getDay();

  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  // Pad first week with empty days
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push('');
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    currentWeek.push(dateKey);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek.filter(Boolean));
      currentWeek = [];
    }
  }

  if (currentWeek.filter(Boolean).length > 0) {
    weeks.push(currentWeek.filter(Boolean));
  }

  return weeks;
}

export default function WeeklyLogView({ year, month, expenses, onAdd, onEdit, onDelete }: Props) {
  const weeks = getWeeksInMonth(year, month);

  return (
    <div className="flex flex-col gap-6">
      {weeks.map((week, weekIdx) => {
        const weekTotal = week.reduce((sum, dateKey) => {
          return sum + (expenses[dateKey] ?? []).reduce((s, e) => s + e.amount, 0);
        }, 0);

        return (
          <div key={weekIdx}>
            <div className="flex items-center justify-between px-1 mb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {weekIdx + 1}주차
              </span>
              {weekTotal > 0 && (
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {weekTotal.toLocaleString('ko-KR')}원
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {week.map((dateKey) => (
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
