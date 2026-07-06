"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, PiggyBank, TrendingDown, Check, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import LoadingScreen from "@/components/LoadingScreen";
import { Input } from "@/components/ui/input";

type HistoryItem = {
  id: string;
  month: string;
  title: string | null;
  salary: number;
  salaryDate: number | null;
  dailyLimit: number;
  monthlySavingGoal: number;
  assetUpdateDate: number | null;
  savings: { id: string; name: string; amount: number; day?: number }[];
  fixedExpenses: { id: string; name: string; amount: number; day?: number }[];
  recordedAt: string;
};

const fmt = (n: number) => n.toLocaleString("ko-KR") + "원";

function monthLabel(month: string) {
  const [y, m] = month.split("-");
  return `${y}년 ${Number(m)}월`;
}

function recordedAtLabel(iso: string) {
  const d = new Date(iso);
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  return `${date} ${time} 기록`;
}

export default function SettingHistoryDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const { data: item, isLoading } = useQuery({
    queryKey: ["settings-history", id],
    queryFn: () => api.get<HistoryItem>(`/money/settings/history/${id}`),
  });

  useEffect(() => {
    if (item) setTitleInput(item.title ?? "");
  }, [item]);

  const { mutate: updateTitle, isPending: savingTitle } = useMutation({
    mutationFn: (title: string) =>
      api.patch(`/money/settings/history/${id}`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings-history", id] });
      queryClient.invalidateQueries({ queryKey: ["settings-history"] });
      setEditingTitle(false);
    },
  });

  const handleTitleSave = () => {
    updateTitle(titleInput.trim());
  };

  if (isLoading) return <LoadingScreen />;
  if (!item) return null;

  const savingsTotal = item.savings.reduce((s, v) => s + v.amount, 0);
  const fixedTotal = item.fixedExpenses.reduce((s, v) => s + v.amount, 0);

  return (
    <div className="max-w-lg mx-auto px-4 lg:px-8 pt-6 pb-10">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors shrink-0"
        >
          <ChevronLeft size={18} />
        </button>

        {editingTitle ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSave();
                if (e.key === "Escape") setEditingTitle(false);
              }}
              autoFocus
              className="flex-1"
              placeholder={monthLabel(item.month)}
            />
            <button
              onClick={handleTitleSave}
              disabled={savingTitle}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white shrink-0 transition-colors"
            >
              <Check size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate flex-1">
              {item.title || monthLabel(item.month)}
            </h1>
            <button
              onClick={() => setEditingTitle(true)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 transition-colors shrink-0"
            >
              <Pencil size={13} />
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-6 pl-10">
        {item.title && <span className="mr-2">{monthLabel(item.month)}</span>}
        {recordedAtLabel(item.recordedAt)}
      </p>

      <div className="flex flex-col gap-4">
        {/* 기본 정보 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-4">기본 정보</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-3">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">월 수입</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(item.salary)}</p>
              {item.salaryDate && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{item.salaryDate}일 입금</p>
              )}
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
              <p className="text-[11px] text-green-500 mb-1">월 저축 목표</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(item.monthlySavingGoal)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-3">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">일일 지출 한도</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(item.dailyLimit)}</p>
            </div>
            {item.assetUpdateDate && (
              <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-3">
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">자산 업데이트일</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">매월 {item.assetUpdateDate}일</p>
              </div>
            )}
          </div>
        </div>

        {/* 적금 */}
        {item.savings.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <PiggyBank size={14} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">적금</p>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                합계 <span className="font-semibold text-gray-600 dark:text-gray-200">{fmt(savingsTotal)}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {item.savings.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-700 dark:text-gray-200">{s.name}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {fmt(s.amount)}{s.day ? <span className="text-xs font-normal text-gray-400 ml-1">· {s.day}일</span> : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 고정 지출 */}
        {item.fixedExpenses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <TrendingDown size={14} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">고정 지출</p>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                합계 <span className="font-semibold text-gray-600 dark:text-gray-200">{fmt(fixedTotal)}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {item.fixedExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-700 dark:text-gray-200">{e.name}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {fmt(e.amount)}{e.day ? <span className="text-xs font-normal text-gray-400 ml-1">· {e.day}일</span> : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
