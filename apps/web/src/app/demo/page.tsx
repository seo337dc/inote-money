"use client";

import { useState, useMemo, useRef } from "react";
import { INITIAL_EXPENSES, MONTHLY_INFO, type Expense, type ExpenseMap } from "./data";
import SummaryCards from "./components/SummaryCards";
import LedgerCalendar from "./components/LedgerCalendar";
import WeeklyLogView from "./components/WeeklyLogView";
import AllLogView from "./components/AllLogView";
import DayDetailModal from "./components/DayDetailModal";

const CATEGORY_COLORS: Record<string, string> = {
  식비: "bg-green-400",
  카페: "bg-amber-400",
  교통: "bg-blue-400",
  쇼핑: "bg-purple-400",
  의료: "bg-red-400",
  문화: "bg-pink-400",
  구독: "bg-indigo-400",
  기타: "bg-gray-400",
};

export default function DemoPage() {
  const [expenses, setExpenses] = useState<ExpenseMap>(INITIAL_EXPENSES);
  const [currentYear, setCurrentYear] = useState(MONTHLY_INFO.year);
  const [currentMonth, setCurrentMonth] = useState(MONTHLY_INFO.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<"calendar" | "weekly" | "all">("calendar");

  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;

  const monthExpenses = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(expenses).filter(([key]) => key.startsWith(monthPrefix))
      ),
    [expenses, monthPrefix]
  );

  const allMonthItems = Object.values(monthExpenses).flat();
  const totalExpense = allMonthItems.reduce((sum, e) => sum + e.amount, 0);
  const totalWaste = allMonthItems.filter((e) => e.isWaste).reduce((sum, e) => sum + e.amount, 0);
  const remaining = MONTHLY_INFO.salary - totalExpense;

  // 카테고리별 지출 집계
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const item of allMonthItems) {
      totals[item.category] = (totals[item.category] ?? 0) + item.amount;
    }
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [allMonthItems]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) { setCurrentYear((y) => y - 1); setCurrentMonth(12); }
    else setCurrentMonth((m) => m - 1);
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) { setCurrentYear((y) => y + 1); setCurrentMonth(1); }
    else setCurrentMonth((m) => m + 1);
    setSelectedDate(null);
  };

  const expenseCounter = useRef(0);
  const handleAddExpense = (date: string, expense: Omit<Expense, "id">) => {
    expenseCounter.current += 1;
    const id = `${Date.now()}-${expenseCounter.current}`;
    setExpenses((prev) => ({
      ...prev,
      [date]: [...(prev[date] ?? []), { ...expense, id }],
    }));
  };

  const handleDeleteExpense = (date: string, id: string) => {
    setExpenses((prev) => ({
      ...prev,
      [date]: (prev[date] ?? []).filter((e) => e.id !== id),
    }));
  };

  const handleEditExpense = (date: string, id: string, expense: Omit<Expense, "id">) => {
    setExpenses((prev) => ({
      ...prev,
      [date]: (prev[date] ?? []).map((e) => e.id === id ? { ...expense, id } : e),
    }));
  };

  const fmt = (n: number) => n.toLocaleString("ko-KR") + "원";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto lg:px-8 2xl:px-12 pt-6 pb-16">

        {/* Header */}
        <header className="flex items-center gap-2 mb-6 px-4 lg:px-0">
          <span className="text-xl font-bold text-green-600">💰</span>
          <h1 className="text-xl font-bold text-gray-900">가계부</h1>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            데모
          </span>
        </header>

        {/* Desktop: sidebar + calendar / Mobile: stacked */}
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4 px-4 lg:px-0">

            {/* 요약 카드: mobile 2x2, desktop 1열 */}
            <SummaryCards
              salary={MONTHLY_INFO.salary}
              totalExpense={totalExpense}
              remaining={remaining}
              bankBalance={MONTHLY_INFO.bankBalance}
            />

            {/* 낭비 요약 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 mb-3">이번달 낭비</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-orange-500">{fmt(totalWaste)}</p>
                <p className="text-xs text-gray-400 mb-0.5">
                  지출의{" "}
                  <span className="font-semibold text-orange-400">
                    {totalExpense > 0 ? Math.round((totalWaste / totalExpense) * 100) : 0}%
                  </span>
                </p>
              </div>
            </div>

            {/* 카테고리별 지출 */}
            {categoryTotals.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs font-semibold text-gray-400 mb-3">카테고리별 지출</p>
                <ul className="flex flex-col gap-3">
                  {categoryTotals.map(([cat, amount]) => {
                    const pct = Math.round((amount / totalExpense) * 100);
                    return (
                      <li key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">{cat}</span>
                          <span className="text-xs text-gray-500">{fmt(amount)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${CATEGORY_COLORS[cat] ?? "bg-gray-400"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* View toggle + 오늘 추가 */}
            <div className="flex items-center justify-between mb-4 mx-4 lg:mx-0">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                {(["calendar", "weekly", "all"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      view === v
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {v === "calendar" ? "달력" : v === "weekly" ? "주차별" : "전체 로그"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  const today = new Date();
                  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                  setSelectedDate(key);
                }}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <span className="text-base leading-none">+</span>
                오늘 추가
              </button>
            </div>

            {view === "calendar" && (
              <div className="px-3 lg:px-0">
              <LedgerCalendar
                year={currentYear}
                month={currentMonth}
                expenses={monthExpenses}
                onDayClick={setSelectedDate}
                onPrev={handlePrevMonth}
                onNext={handleNextMonth}
              />
              </div>
            )}
            {view === "weekly" && (
              <div className="px-4 lg:px-0">
                <WeeklyLogView
                  monthExpenses={monthExpenses}
                  month={currentMonth}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                  onEditExpense={handleEditExpense}
                />
              </div>
            )}
            {view === "all" && (
              <div className="px-4 lg:px-0">
                <AllLogView
                  allExpenses={expenses}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                  onEditExpense={handleEditExpense}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => {
          const today = new Date();
          const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          setSelectedDate(key);
        }}
        className="lg:hidden fixed bottom-6 right-5 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl leading-none transition-colors active:scale-95"
        aria-label="오늘 지출 추가"
      >
        +
      </button>

      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          expenses={expenses[selectedDate] ?? []}
          onClose={() => setSelectedDate(null)}
          onAdd={(expense) => handleAddExpense(selectedDate, expense)}
          onDelete={(id) => handleDeleteExpense(selectedDate, id)}
          onEdit={(id, expense) => handleEditExpense(selectedDate, id, expense)}
        />
      )}
    </div>
  );
}
