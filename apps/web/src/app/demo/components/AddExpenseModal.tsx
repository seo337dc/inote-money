"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type Expense } from "../data";

type Props = {
  date: string;
  onClose: () => void;
  onSave: (expense: Omit<Expense, "id">) => void;
};

function parseDate(dateStr: string) {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${m}월 ${d}일`;
}

export default function AddExpenseModal({ date, onClose, onSave }: Props) {
  const [place, setPlace] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [isWaste, setIsWaste] = useState(false);

  const parsedAmount = Number(amount.replace(/,/g, "").replace(/[^0-9]/g, ""));
  const isValid = place.trim().length > 0 && parsedAmount > 0;

  const handleSave = () => {
    if (!isValid) return;
    onSave({ place: place.trim(), amount: parsedAmount, category, isWaste });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <span className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">지출 추가</h2>
            <p className="text-xs text-gray-400">{parseDate(date)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-5 flex flex-col gap-5">
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">금액</label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-10 text-right text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent focus:bg-white transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                원
              </span>
            </div>
          </div>

          {/* Place */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">사용처</label>
            <input
              type="text"
              placeholder="어디서 사용했나요?"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent focus:bg-white transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    category === cat
                      ? "bg-green-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Waste toggle */}
          <div className="flex items-center justify-between py-0.5">
            <div>
              <p className="text-sm font-semibold text-gray-700">낭비 여부</p>
              <p className="text-xs text-gray-400 mt-0.5">충동적이거나 불필요한 지출인가요?</p>
            </div>
            <button
              type="button"
              onClick={() => setIsWaste((v) => !v)}
              role="switch"
              aria-checked={isWaste}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                isWaste
                  ? "bg-orange-400 focus:ring-orange-300"
                  : "bg-gray-200 focus:ring-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  isWaste ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="px-5 pb-6 pt-1">
          <Button
            onClick={handleSave}
            disabled={!isValid}
            size="lg"
            className="w-full"
          >
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
