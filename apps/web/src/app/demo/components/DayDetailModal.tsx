"use client";

import { TriangleAlert, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Expense } from "../data";

type Props = {
  date: string;
  expenses: Expense[];
  onClose: () => void;
  onAddClick: () => void;
};

const fmt = (n: number) => n.toLocaleString("ko-KR") + "원";

function parseDate(dateStr: string) {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${m}월 ${d}일`;
}

const CATEGORY_BADGE: Record<string, string> = {
  식비: "bg-green-100 text-green-700",
  카페: "bg-amber-100 text-amber-700",
  교통: "bg-blue-100 text-blue-700",
  쇼핑: "bg-purple-100 text-purple-700",
  의료: "bg-red-100 text-red-700",
  문화: "bg-pink-100 text-pink-700",
  구독: "bg-indigo-100 text-indigo-700",
  기타: "bg-gray-100 text-gray-600",
};

export default function DayDetailModal({ date, expenses, onClose, onAddClick }: Props) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const waste = expenses.filter((e) => e.isWaste).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <span className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{parseDate(date)}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 px-5 pt-4 pb-3">
          <div className="bg-gray-50 rounded-xl p-3.5">
            <p className="text-xs text-gray-400 font-medium mb-1">총 지출</p>
            <p className="text-lg font-bold text-gray-900">{fmt(total)}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3.5">
            <p className="text-xs text-orange-400 font-medium mb-1">낭비 금액</p>
            <p className="text-lg font-bold text-orange-500">{fmt(waste)}</p>
          </div>
        </div>

        {/* Expense list */}
        <div className="flex-1 overflow-y-auto px-5">
          {expenses.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">지출 내역이 없습니다</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {expenses.map((expense) => (
                <li key={expense.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    {expense.isWaste ? (
                      <TriangleAlert
                        size={14}
                        className="text-orange-400 shrink-0 mt-0.5"
                      />
                    ) : (
                      <span className="w-3.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {expense.place}
                      </p>
                      <span
                        className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-0.5 ${CATEGORY_BADGE[expense.category] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {expense.category}
                      </span>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-bold shrink-0 ml-3 ${
                      expense.isWaste ? "text-orange-500" : "text-gray-900"
                    }`}
                  >
                    {fmt(expense.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add button */}
        <div className="px-5 py-4 border-t border-gray-100">
          <Button onClick={onAddClick} size="lg" className="w-full gap-2">
            <Plus size={16} />
            지출 추가
          </Button>
        </div>
      </div>
    </div>
  );
}
