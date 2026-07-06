"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Wallet, TrendingDown, PiggyBank } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import LoadingScreen from "@/components/LoadingScreen";

type HistoryItem = {
  id: string;
  month: string;
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
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} 기록`;
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
        <div className="flex flex-col gap-4">
          {history.map((item) => {
            const savingsTotal = item.savings.reduce((s, v) => s + v.amount, 0);
            const fixedTotal = item.fixedExpenses.reduce((s, v) => s + v.amount, 0);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5"
              >
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{monthLabel(item.month)}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{recordedAtLabel(item.recordedAt)}</p>
                  </div>
                </div>

                {/* 주요 수치 */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-3">
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">월 수입</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(item.salary)}</p>
                    {item.salaryDate && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.salaryDate}일 입금</p>
                    )}
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                    <p className="text-[11px] text-green-500 mb-1">월 저축 목표</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(item.monthlySavingGoal)}</p>
                  </div>
                </div>

                {/* 적금 */}
                {item.savings.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <PiggyBank size={12} className="text-gray-400" />
                      <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                        적금 · 합계 {fmt(savingsTotal)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {item.savings.map((s) => (
                        <div key={s.id} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                          <span>{s.name}</span>
                          <span className="font-medium">{fmt(s.amount)}{s.day ? ` · ${s.day}일` : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 고정 지출 */}
                {item.fixedExpenses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingDown size={12} className="text-gray-400" />
                      <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                        고정 지출 · 합계 {fmt(fixedTotal)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {item.fixedExpenses.map((e) => (
                        <div key={e.id} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                          <span>{e.name}</span>
                          <span className="font-medium">{fmt(e.amount)}{e.day ? ` · ${e.day}일` : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
