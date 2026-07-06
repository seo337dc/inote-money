"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import LoadingScreen from "@/components/LoadingScreen";

type HistoryItem = {
  id: string;
  month: string;
  title: string | null;
  salary: number;
  monthlySavingGoal: number;
  savings: { id: string; name: string; amount: number }[];
  fixedExpenses: { id: string; name: string; amount: number }[];
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
  return `${date} ${time}`;
}

export default function SettingHistoryPage() {
  const router = useRouter();

  const { data: history, isLoading } = useQuery({
    queryKey: ["settings-history"],
    queryFn: () => api.get<HistoryItem[]>("/money/settings/history"),
  });

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
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">자산 설정 히스토리</h1>
      </div>

      {!history || history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Wallet size={36} className="text-gray-200 dark:text-gray-600 mb-3" />
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">기록된 히스토리가 없어요</p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">자산 설정 저장 후 기록하기를 눌러보세요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((item) => {
            const savingsTotal = item.savings.reduce((s, v) => s + v.amount, 0);
            const fixedTotal = item.fixedExpenses.reduce((s, v) => s + v.amount, 0);

            return (
              <button
                key={item.id}
                onClick={() => router.push(`/dashboard/setup/history/${item.id}`)}
                className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 hover:border-green-200 dark:hover:border-green-800 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {item.title || monthLabel(item.month)}
                    </p>
                    {item.title && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{monthLabel(item.month)}</p>
                    )}
                    <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-0.5">{recordedAtLabel(item.recordedAt)}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-green-500 transition-colors shrink-0 mt-0.5" />
                </div>

                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">월 수입</p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{fmt(item.salary)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">저축 목표</p>
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">{fmt(item.monthlySavingGoal)}</p>
                  </div>
                  {savingsTotal > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">적금 합계</p>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{fmt(savingsTotal)}</p>
                    </div>
                  )}
                  {fixedTotal > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">고정 지출</p>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{fmt(fixedTotal)}</p>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
