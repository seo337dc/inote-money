'use client';

import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';
import { type Expense, type ExpenseMap, type Category } from './types';
import SummaryCards from './components/SummaryCards';
import LedgerCalendar from './components/LedgerCalendar';
import WeeklyLogView from './components/WeeklyLogView';
import AllLogView from './components/AllLogView';
import DayDetailModal from './components/DayDetailModal';

type View = 'calendar' | 'weekly' | 'all';

const VIEW_LABELS: { key: View; label: string }[] = [
  { key: 'calendar', label: '달력' },
  { key: 'weekly', label: '주차별' },
  { key: 'all', label: '전체' },
];

type Settings = { salary: number };

// BE 응답 타입 (date 필드 포함)
type ExpenseRecord = Expense & { date: string };

function toDateKey(isoDate: string) {
  return isoDate.slice(0, 10);
}

function toExpenseMap(records: ExpenseRecord[]): ExpenseMap {
  const map: ExpenseMap = {};
  for (const { date, ...expense } of records) {
    const key = toDateKey(date);
    if (!map[key]) map[key] = [];
    map[key].push(expense);
  }
  return map;
}

function queryKey(year: number, month: number) {
  return ['expenses', year, month] as const;
}

export default function AccountBookPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [view, setView] = useState<View>('calendar');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const qc = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get<Settings>('/money/settings').catch(() => null),
    staleTime: 5 * 60 * 1000,
  });

  const { data: expenses = {}, isLoading } = useQuery({
    queryKey: queryKey(year, month),
    queryFn: async () => {
      const records = await api.get<ExpenseRecord[]>(
        `/money/expenses?year=${year}&month=${month}`
      );
      return toExpenseMap(records);
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: queryKey(year, month) });

  const createMutation = useMutation({
    mutationFn: (body: { date: string; amount: number; description?: string; category?: Category; isWaste?: boolean }) =>
      api.post<ExpenseRecord>('/money/expenses', body),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: Partial<ExpenseRecord> & { id: string }) =>
      api.patch<ExpenseRecord>(`/money/expenses/${id}`, body),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<void>(`/money/expenses/${id}`),
    onSuccess: invalidate,
  });

  const handlePrev = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };

  const handleNext = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };

  const handleAdd = useCallback(async (dateKey: string, expense: Omit<Expense, 'id'>) => {
    await createMutation.mutateAsync({
      date: dateKey,
      amount: expense.amount,
      description: expense.description ?? undefined,
      category: expense.category,
      isWaste: expense.isWaste,
    });
  }, [createMutation]);

  const handleEdit = useCallback(async (dateKey: string, updated: Expense) => {
    await updateMutation.mutateAsync({
      id: updated.id,
      date: dateKey,
      amount: updated.amount,
      description: updated.description ?? undefined,
      category: updated.category,
      isWaste: updated.isWaste,
    });
  }, [updateMutation]);

  const handleDelete = useCallback(async (_dateKey: string, id: string) => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  if (isLoading) return <LoadingScreen messages={['가계부 정보를 불러오고 있습니다.']} />;

  const monthExpenses = Object.values(expenses).flat();
  const totalExpense = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalWaste = monthExpenses.filter((e) => e.isWaste).reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-6 pb-20 lg:pb-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">가계부</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">매일 지출을 기록하고 분석해보세요</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Sidebar: summary cards (desktop) */}
          <aside className="hidden lg:block lg:w-52 xl:w-60 shrink-0">
            <SummaryCards salary={settings?.salary ?? 0} totalExpense={totalExpense} totalWaste={totalWaste} />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile summary */}
            <div className="lg:hidden mb-4">
              <SummaryCards salary={settings?.salary ?? 0} totalExpense={totalExpense} totalWaste={totalWaste} />
            </div>

            {/* View toggle */}
            <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-4 w-fit">
              {VIEW_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    view === key
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Views */}
            {view === 'calendar' && (
              <LedgerCalendar
                year={year}
                month={month}
                expenses={expenses}
                onDayClick={setSelectedDay}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            )}

            {(view === 'weekly' || view === 'all') && (
              <div className="flex items-center justify-between px-1 mb-4">
                <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-gray-800 text-gray-400 transition-colors">
                  ‹
                </button>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {year}년 {month}월
                </span>
                <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-gray-800 text-gray-400 transition-colors">
                  ›
                </button>
              </div>
            )}

            {view === 'weekly' && (
              <WeeklyLogView
                year={year}
                month={month}
                expenses={expenses}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}

            {view === 'all' && (
              <AllLogView
                year={year}
                month={month}
                expenses={expenses}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>

      {/* Day detail modal (calendar click) */}
      <DayDetailModal
        dateKey={selectedDay}
        expenses={selectedDay ? (expenses[selectedDay] ?? []) : []}
        onClose={() => setSelectedDay(null)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
