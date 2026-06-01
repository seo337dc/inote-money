"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, X } from "lucide-react";

type ListItem = { id: string; name: string; amount: string };

type FormState = {
  monthlyIncome: string;
  dailyLimit: string;
  monthlyGoal: string;
  savings: ListItem[];
  fixedExpenses: ListItem[];
};

function newItem(): ListItem {
  return { id: `${Date.now()}-${Math.random()}`, name: "", amount: "" };
}

const INPUT_BASE = "flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 min-w-0";
const INPUT_WRAP = "flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-green-200 dark:focus-within:ring-green-800 focus-within:border-transparent transition-all";

function NumberField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1">{label}</label>
      {hint && <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5">{hint}</p>}
      <div className={INPUT_WRAP}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className={INPUT_BASE}
        />
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1 shrink-0">원</span>
      </div>
    </div>
  );
}

function DynamicList({
  title,
  items,
  onChange,
  addLabel,
  namePlaceholder,
}: {
  title: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  addLabel: string;
  namePlaceholder: string;
}) {
  const update = (id: string, field: "name" | "amount", value: string) =>
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

  const remove = (id: string) => onChange(items.filter((item) => item.id !== id));

  const add = () => onChange([...items, newItem()]);

  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{title}</p>
        {items.length > 0 && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            합계{" "}
            <span className="font-semibold text-gray-600 dark:text-gray-200">
              {total.toLocaleString("ko-KR")}원
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              type="text"
              value={item.name}
              onChange={(e) => update(item.id, "name", e.target.value)}
              placeholder={namePlaceholder}
              className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 focus:border-transparent transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 min-w-0"
            />
            <div className={`${INPUT_WRAP} w-36 shrink-0`}>
              <input
                type="number"
                value={item.amount}
                onChange={(e) => update(item.id, "amount", e.target.value)}
                placeholder="0"
                className={INPUT_BASE}
              />
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-1 shrink-0">원</span>
            </div>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 text-xs font-medium transition-colors w-fit"
        >
          <Plus size={13} />
          {addLabel}
        </button>
      </div>
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    monthlyIncome: "",
    dailyLimit: "",
    monthlyGoal: "",
    savings: [],
    fixedExpenses: [],
  });

  useEffect(() => {
    const saved = localStorage.getItem("inote-settings");
    if (saved) {
      const s = JSON.parse(saved);
      setForm({
        monthlyIncome: s.monthlyIncome ? String(s.monthlyIncome) : "",
        dailyLimit: s.dailyLimit ? String(s.dailyLimit) : "",
        monthlyGoal: s.monthlyGoal ? String(s.monthlyGoal) : "",
        savings: s.savings ?? [],
        fixedExpenses: s.fixedExpenses ?? [],
      });
    }
  }, []);

  const set = (key: keyof Pick<FormState, "monthlyIncome" | "dailyLimit" | "monthlyGoal">) =>
    (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleSave = () => {
    const settings = {
      monthlyIncome: Number(form.monthlyIncome) || 0,
      dailyLimit: Number(form.dailyLimit) || 0,
      monthlyGoal: Number(form.monthlyGoal) || 0,
      savings: form.savings.map((item) => ({ ...item, amount: Number(item.amount) || 0 })),
      fixedExpenses: form.fixedExpenses.map((item) => ({ ...item, amount: Number(item.amount) || 0 })),
    };
    localStorage.setItem("inote-settings", JSON.stringify(settings));
    router.back();
  };

  return (
    <div className="max-w-lg mx-auto px-4 lg:px-8 pt-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">내 정보 설정</h1>
      </div>

      <div className="flex flex-col gap-4">
        {/* 기본 정보 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">기본 정보</p>
          <NumberField label="월급 (매달 수입)" hint="세후 실수령액 기준" value={form.monthlyIncome} onChange={set("monthlyIncome")} />
          <NumberField label="일일 지출 한도" hint="하루에 최대 얼마까지 쓸지 설정" value={form.dailyLimit} onChange={set("dailyLimit")} />
          <NumberField label="월 저축 목표" hint="이번 달 얼마를 모을 것인지" value={form.monthlyGoal} onChange={set("monthlyGoal")} />
        </div>

        {/* 적금 목록 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <DynamicList
            title="적금"
            items={form.savings}
            onChange={(savings) => setForm((f) => ({ ...f, savings }))}
            addLabel="적금 추가"
            namePlaceholder="청년도약계좌, 주택청약..."
          />
        </div>

        {/* 고정 지출 목록 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <DynamicList
            title="고정 지출"
            items={form.fixedExpenses}
            onChange={(fixedExpenses) => setForm((f) => ({ ...f, fixedExpenses }))}
            addLabel="고정 지출 추가"
            namePlaceholder="넷플릭스, 통신비, 보험..."
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
