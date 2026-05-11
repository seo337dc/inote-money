"use client";

import { useState, useMemo } from "react";
import { INITIAL_EXPENSES, MONTHLY_INFO, CATEGORIES, type Expense, type ExpenseMap } from "./data";
import SummaryCards from "./components/SummaryCards";
import LedgerCalendar from "./components/LedgerCalendar";
import WeeklyLogView from "./components/WeeklyLogView";
import AllLogView from "./components/AllLogView";
import DayDetailModal from "./components/DayDetailModal";
import AddExpenseModal from "./components/AddExpenseModal";

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
  const [addModalDate, setAddModalDate] = useState<string | null>(null);
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

  const handleAddExpense = (date: string, expense: Omit<Expense, "id">) => {
    const id = `${Date.now()}`;
    setExpenses((prev) => ({
      ...prev,
      [date]: [...(prev[date] ?? []), { ...expense, id }],
    }));
    setAddModalDate(null);
  };

  const fmt = (n: number) => n.toLocaleString("ko-KR") + "원";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 pb-16">

        {/* Header */}
        <header className="flex items-center gap-2 mb-6">
          <span className="text-xl font-bold text-green-600">💰</span>
          <h1 className="text-xl font-bold text-gray-900">가계부</h1>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            데모
          </span>
        </header>

        {/* Desktop: sidebar + calendar / Mobile: stacked */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4">

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
            {/* View toggle */}
            <div className="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
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

            {view === "calendar" && (
              <LedgerCalendar
                year={currentYear}
                month={currentMonth}
                expenses={monthExpenses}
                onDayClick={setSelectedDate}
                onPrev={handlePrevMonth}
                onNext={handleNextMonth}
              />
            )}
            {view === "weekly" && (
              <WeeklyLogView
                monthExpenses={monthExpenses}
                month={currentMonth}
                onDayClick={setSelectedDate}
                onAddExpense={handleAddExpense}
              />
            )}
            {view === "all" && (
              <AllLogView
                allExpenses={expenses}
                onDayClick={setSelectedDate}
              />
            )}
          </div>

        </div>
      </div>

      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          expenses={expenses[selectedDate] ?? []}
          onClose={() => setSelectedDate(null)}
          onAddClick={() => setAddModalDate(selectedDate)}
        />
      )}

      {addModalDate && (
        <AddExpenseModal
          date={addModalDate}
          onClose={() => setAddModalDate(null)}
          onSave={(expense) => handleAddExpense(addModalDate, expense)}
        />
      )}
    </div>
  );
}
