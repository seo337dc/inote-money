"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, X, History } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import LoadingScreen from "@/components/LoadingScreen";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ── 타입 ────────────────────────────────────────────────────────
type ListItem = { id: string; name: string; amount: string; day: string };

type FormState = {
  monthlyIncome: string;
  incomeDay: string;
  dailyLimit: string;
  monthlyGoal: string;
  assetUpdateDay: string;
  savings: ListItem[];
  fixedExpenses: ListItem[];
  memo: string;
};

type SettingsResponse = {
  salary: number;
  salaryDate: number;
  dailyLimit: number;
  monthlySavingGoal: number;
  assetUpdateDate: number;
  savings: { id: string; name: string; amount: number; day?: number }[];
  fixedExpenses: { id: string; name: string; amount: number; day?: number }[];
  memo: string | null;
};

// ── 유틸 ────────────────────────────────────────────────────────
function newItem(): ListItem {
  return { id: `${Date.now()}-${Math.random()}`, name: "", amount: "", day: "" };
}

function toFormState(s: SettingsResponse): FormState {
  return {
    monthlyIncome: s.salary ? String(s.salary) : "",
    incomeDay: s.salaryDate ? String(s.salaryDate) : "",
    dailyLimit: s.dailyLimit ? String(s.dailyLimit) : "",
    monthlyGoal: s.monthlySavingGoal ? String(s.monthlySavingGoal) : "",
    assetUpdateDay: s.assetUpdateDate ? String(s.assetUpdateDate) : "",
    savings: (s.savings ?? []).map((item) => ({
      ...item,
      amount: String(item.amount),
      day: item.day ? String(item.day) : "",
    })),
    fixedExpenses: (s.fixedExpenses ?? []).map((item) => ({
      ...item,
      amount: String(item.amount),
      day: item.day ? String(item.day) : "",
    })),
    memo: s.memo ?? "",
  };
}

function toApiPayload(form: FormState) {
  return {
    salary: Number(form.monthlyIncome) || 0,
    salaryDate: Number(form.incomeDay) || undefined,
    dailyLimit: Number(form.dailyLimit) || 0,
    monthlySavingGoal: Number(form.monthlyGoal) || 0,
    assetUpdateDate: Number(form.assetUpdateDay) || undefined,
    savings: form.savings.map((item) => ({
      id: item.id,
      name: item.name,
      amount: Number(item.amount) || 0,
      day: Number(item.day) || undefined,
    })),
    fixedExpenses: form.fixedExpenses.map((item) => ({
      id: item.id,
      name: item.name,
      amount: Number(item.amount) || 0,
      day: Number(item.day) || undefined,
    })),
    memo: form.memo.trim() || undefined,
  };
}

// ── 공통 스타일 ──────────────────────────────────────────────────
const INPUT_BASE = "flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 min-w-0";
const INPUT_WRAP = "flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-green-200 dark:focus-within:ring-green-800 focus-within:border-transparent transition-all";
const DAY_SELECT = "h-[42px] bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 focus:border-transparent transition-all shrink-0 w-[72px]";

// ── 컴포넌트 ────────────────────────────────────────────────────
function DaySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={DAY_SELECT}>
      <option value="">날짜</option>
      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
        <option key={d} value={String(d)}>{d}일</option>
      ))}
    </select>
  );
}

function NumberField({
  label, hint, value, onChange, day, onDayChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  day?: string;
  onDayChange?: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1">{label}</label>
      {hint && <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5">{hint}</p>}
      <div className="flex gap-2">
        <div className={`${INPUT_WRAP} flex-1`}>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
            className={INPUT_BASE}
          />
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1 shrink-0">원</span>
        </div>
        {onDayChange !== undefined && (
          <DaySelect value={day ?? ""} onChange={onDayChange} />
        )}
      </div>
    </div>
  );
}

function DynamicList({
  title, items, onChange, addLabel, namePlaceholder,
}: {
  title: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  addLabel: string;
  namePlaceholder: string;
}) {
  const update = (id: string, field: keyof Omit<ListItem, "id">, value: string) =>
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
            <Input
              type="text"
              value={item.name}
              onChange={(e) => update(item.id, "name", e.target.value)}
              placeholder={namePlaceholder}
              className="flex-1"
            />
            <div className={`${INPUT_WRAP} w-28 shrink-0`}>
              <input
                type="number"
                value={item.amount}
                onChange={(e) => update(item.id, "amount", e.target.value)}
                placeholder="0"
                className={INPUT_BASE}
              />
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-1 shrink-0">원</span>
            </div>
            <DaySelect value={item.day} onChange={(v) => update(item.id, "day", v)} />
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

// ── 페이지 ───────────────────────────────────────────────────────
export default function SetupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>({
    monthlyIncome: "",
    incomeDay: "",
    dailyLimit: "",
    monthlyGoal: "",
    assetUpdateDay: "",
    savings: [],
    fixedExpenses: [],
    memo: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTitle, setHistoryTitle] = useState("");

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<SettingsResponse>("/money/settings"),
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 1,
  });

  useEffect(() => {
    if (settingsData) setForm(toFormState(settingsData));
  }, [settingsData]);

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: (payload: ReturnType<typeof toApiPayload>) =>
      api.put("/money/settings", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setHistoryTitle("");
      setShowHistoryModal(true);
    },
    onError: () => setError("저장에 실패했어요. 다시 시도해주세요."),
  });

  const { mutate: saveHistory, isPending: savingHistory } = useMutation({
    mutationFn: () => {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      return api.post("/money/settings/history", {
        month,
        title: historyTitle.trim() || undefined,
      });
    },
    onSettled: () => {
      setShowHistoryModal(false);
      router.back();
    },
  });

  const set = (key: keyof Pick<FormState, "monthlyIncome" | "incomeDay" | "dailyLimit" | "monthlyGoal" | "assetUpdateDay" | "memo">) =>
    (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleSave = () => {
    setError(null);
    save(toApiPayload(form));
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="max-w-lg mx-auto px-4 lg:px-8 pt-6 pb-10">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white flex-1">내 자산 설정</h1>
        <button
          onClick={() => router.push("/dashboard/setup/history")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <History size={14} />
          히스토리
        </button>
      </div>

      {/* 기록 확인 모달 */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">저장 완료</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              현재 자산 설정을 히스토리로 기록할까요?
            </p>
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1.5">
                기록 제목 <span className="font-normal text-gray-400">(선택)</span>
              </label>
              <Input
                type="text"
                value={historyTitle}
                onChange={(e) => setHistoryTitle(e.target.value)}
                placeholder="7월 자산 현황, 연봉 인상 후 첫 기록..."
                onKeyDown={(e) => e.key === "Enter" && saveHistory()}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowHistoryModal(false); router.back(); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                건너뛰기
              </button>
              <button
                onClick={() => saveHistory()}
                disabled={savingHistory}
                className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                {savingHistory ? "기록 중..." : "기록하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">기본 정보</p>
          <NumberField
            label="월급 (매달 수입)"
            hint="세후 실수령액 기준"
            value={form.monthlyIncome}
            onChange={set("monthlyIncome")}
            day={form.incomeDay}
            onDayChange={set("incomeDay")}
          />
          <NumberField label="일일 지출 한도" hint="하루에 최대 얼마까지 쓸지 설정" value={form.dailyLimit} onChange={set("dailyLimit")} />
          <NumberField label="월 저축 목표" hint="이번 달 얼마를 모을 것인지" value={form.monthlyGoal} onChange={set("monthlyGoal")} />
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1">자산 정보 업데이트</label>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5">매달 자산 현황을 점검하는 날짜</p>
            <DaySelect value={form.assetUpdateDay} onChange={set("assetUpdateDay")} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <DynamicList
            title="적금"
            items={form.savings}
            onChange={(savings) => setForm((f) => ({ ...f, savings }))}
            addLabel="적금 추가"
            namePlaceholder="청년도약계좌, 주택청약..."
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <DynamicList
            title="고정 지출"
            items={form.fixedExpenses}
            onChange={(fixedExpenses) => setForm((f) => ({ ...f, fixedExpenses }))}
            addLabel="고정 지출 추가"
            namePlaceholder="넷플릭스, 통신비, 보험..."
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1.5">메모</label>
          <Textarea
            value={form.memo}
            onChange={(e) => set("memo")(e.target.value)}
            placeholder="이번 설정의 배경이나 변경 이유를 기록해두세요..."
            rows={3}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
        >
          {saving ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </div>
  );
}
