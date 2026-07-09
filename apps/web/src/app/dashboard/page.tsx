"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Pencil, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "sonner";

type ListItem = { id: string; name: string; amount: number; day?: number };

type Settings = {
  salary: number;
  salaryDate: number;
  dailyLimit: number;
  monthlySavingGoal: number;
  assetUpdateDate: number;
  savings: ListItem[];
  fixedExpenses: ListItem[];
  memo: string | null;
};

type Expense = {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  isWaste: boolean;
};

type ReviewData = { id: string; rating: number; text: string | null };
type Draft = { stars: number; text: string };

function getISOWeekYear(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

function getWeekMonday(offset: number): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekSunday(monday: Date): Date {
  const d = new Date(monday);
  d.setDate(monday.getDate() + 6);
  return d;
}

function fmtDate(d: Date): string {
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function fmt(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}

function dateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function filterByWeek(expenses: Expense[], monday: Date, sunday: Date): Expense[] {
  const start = dateStr(monday);
  const end = dateStr(sunday);
  return expenses.filter((e) => {
    const d = e.date.slice(0, 10);
    return d >= start && d <= end;
  });
}

function filterByMonth(expenses: Expense[], year: number, month: number): Expense[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return expenses.filter((e) => e.date.startsWith(prefix));
}

function sumAmount(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + e.amount, 0);
}

function sumWaste(expenses: Expense[]): number {
  return expenses.filter((e) => e.isWaste).reduce((s, e) => s + e.amount, 0);
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`text-2xl transition-colors leading-none ${
            onChange ? "cursor-pointer" : "cursor-default"
          } ${s <= (hover || value) ? "text-yellow-400" : "text-gray-200 dark:text-gray-600"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const NAV_BTN = "w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 transition-colors disabled:opacity-30";
const CARD = "bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5";
const SUBCARD_GRAY = "bg-gray-50 dark:bg-gray-700/60 rounded-xl p-3";
const SUBCARD_ORANGE = "bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3";
const LABEL = "text-[11px] text-gray-400 dark:text-gray-500";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [weekDraft, setWeekDraft] = useState<Draft>({ stars: 0, text: "" });
  const [monthDraft, setMonthDraft] = useState<Draft>({ stars: 0, text: "" });

  const { data: settings, isLoading } = useQuery<Settings | null>({
    queryKey: ["settings"],
    queryFn: async () => {
      try {
        return await api.get<Settings>("/money/settings");
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
  });

  // Week dates
  const monday = getWeekMonday(weekOffset);
  const sunday = getWeekSunday(monday);
  const prevMonday = getWeekMonday(weekOffset - 1);
  const prevSunday = getWeekSunday(prevMonday);
  const { year: weekYear, week: weekPeriod } = getISOWeekYear(monday);
  const weekLabel = `${fmtDate(monday)} ~ ${fmtDate(sunday)}`;

  // Month dates
  const now = new Date();
  const rawMonth = now.getMonth() + 1 + monthOffset;
  const normalizedDate = new Date(now.getFullYear(), rawMonth - 1, 1);
  const mYear = normalizedDate.getFullYear();
  const mMonth = normalizedDate.getMonth() + 1;
  const monthLabel = `${mYear}년 ${mMonth}월`;
  const prevMonthDate = new Date(mYear, mMonth - 2, 1);
  const prevMYear = prevMonthDate.getFullYear();
  const prevMMonth = prevMonthDate.getMonth() + 1;

  // Deduplicated list of year/month combos needed
  const neededMonths = useMemo(() => {
    const map = new Map<string, { year: number; month: number }>();
    const add = (y: number, m: number) => {
      const key = `${y}-${m}`;
      if (!map.has(key)) map.set(key, { year: y, month: m });
    };
    const mon = getWeekMonday(weekOffset);
    const sun = getWeekSunday(mon);
    const pMon = getWeekMonday(weekOffset - 1);
    const pSun = getWeekSunday(pMon);
    add(mon.getFullYear(), mon.getMonth() + 1);
    add(sun.getFullYear(), sun.getMonth() + 1);
    add(pMon.getFullYear(), pMon.getMonth() + 1);
    add(pSun.getFullYear(), pSun.getMonth() + 1);

    const norm = new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset, 1);
    const cy = norm.getFullYear();
    const cm = norm.getMonth() + 1;
    const prev = new Date(cy, cm - 2, 1);
    add(cy, cm);
    add(prev.getFullYear(), prev.getMonth() + 1);

    return [...map.values()];
  }, [weekOffset, monthOffset]);

  const expenseQueries = useQueries({
    queries: neededMonths.map(({ year, month }) => ({
      queryKey: ["expenses", year, month],
      queryFn: () => api.get<Expense[]>(`/money/expenses?year=${year}&month=${month}`),
    })),
  });

  const allExpenses = useMemo(
    () => expenseQueries.flatMap((q) => q.data ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expenseQueries.map((q) => q.dataUpdatedAt).join(",")]
  );

  // Weekly stats
  const thisWeekItems = filterByWeek(allExpenses, monday, sunday);
  const prevWeekItems = filterByWeek(allExpenses, prevMonday, prevSunday);
  const thisWeekTotal = sumAmount(thisWeekItems);
  const prevWeekTotal = sumAmount(prevWeekItems);
  const thisWeekWaste = sumWaste(thisWeekItems);
  const weekBarMax = Math.max(thisWeekTotal, prevWeekTotal, 1);

  // Monthly stats
  const thisMonthItems = filterByMonth(allExpenses, mYear, mMonth);
  const prevMonthItems = filterByMonth(allExpenses, prevMYear, prevMMonth);
  const thisMonthTotal = sumAmount(thisMonthItems);
  const prevMonthTotal = sumAmount(prevMonthItems);
  const thisMonthWaste = sumWaste(thisMonthItems);
  const monthBarMax = Math.max(thisMonthTotal, prevMonthTotal, 1);

  // Review 조회
  const { data: weekReviewData } = useQuery<ReviewData | null>({
    queryKey: ["review", "WEEKLY", weekYear, weekPeriod],
    queryFn: async () => {
      try {
        return await api.get<ReviewData>(`/money/reviews?type=WEEKLY&year=${weekYear}&period=${weekPeriod}`);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
  });

  const { data: monthReviewData } = useQuery<ReviewData | null>({
    queryKey: ["review", "MONTHLY", mYear, mMonth],
    queryFn: async () => {
      try {
        return await api.get<ReviewData>(`/money/reviews?type=MONTHLY&year=${mYear}&period=${mMonth}`);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
  });

  // 주/월 변경 시 draft 초기화
  useEffect(() => {
    setWeekDraft({ stars: weekReviewData?.rating ?? 0, text: weekReviewData?.text ?? "" });
  }, [weekReviewData]);

  useEffect(() => {
    setMonthDraft({ stars: monthReviewData?.rating ?? 0, text: monthReviewData?.text ?? "" });
  }, [monthReviewData]);

  // Review 저장 mutation
  const weekMutation = useMutation({
    mutationFn: (draft: Draft) =>
      api.put("/money/reviews", { type: "WEEKLY", year: weekYear, period: weekPeriod, rating: draft.stars, text: draft.text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review", "WEEKLY", weekYear, weekPeriod] });
      toast.success("주간 리뷰가 저장됐어요");
    },
    onError: () => toast.error("저장에 실패했어요. 다시 시도해주세요."),
  });

  const monthMutation = useMutation({
    mutationFn: (draft: Draft) =>
      api.put("/money/reviews", { type: "MONTHLY", year: mYear, period: mMonth, rating: draft.stars, text: draft.text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review", "MONTHLY", mYear, mMonth] });
      toast.success("월간 리뷰가 저장됐어요");
    },
    onError: () => toast.error("저장에 실패했어요. 다시 시도해주세요."),
  });

  const saveWeekReview = () => weekMutation.mutate(weekDraft);
  const saveMonthReview = () => monthMutation.mutate(monthDraft);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-6 pb-8">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-5">자산 관리</h1>

      {/* 내 정보 카드 */}
      {settings ? (
        <div className={`${CARD} mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <p className={`text-xs font-semibold ${LABEL}`}>내 정보</p>
            <Link
              href="/dashboard/setup"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 dark:text-gray-500 dark:hover:text-green-400 transition-colors"
            >
              <Pencil size={11} />
              수정
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className={`text-[11px] mb-0.5 ${LABEL}`}>월급</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(settings.salary)}</p>
              {settings.salaryDate ? <p className={`text-[10px] mt-0.5 ${LABEL}`}>매달 {settings.salaryDate}일 입금</p> : null}
            </div>
            <div>
              <p className={`text-[11px] mb-0.5 ${LABEL}`}>적금 ({settings.savings.length}개)</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(settings.savings.reduce((s, i) => s + i.amount, 0))}</p>
            </div>
            <div>
              <p className={`text-[11px] mb-0.5 ${LABEL}`}>고정 지출 ({settings.fixedExpenses.length}개)</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(settings.fixedExpenses.reduce((s, i) => s + i.amount, 0))}</p>
            </div>
            <div>
              <p className={`text-[11px] mb-0.5 ${LABEL}`}>일일 한도</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(settings.dailyLimit)}</p>
            </div>
          </div>

          {infoExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-4">
              {settings.assetUpdateDate ? (
                <p className={`text-[11px] ${LABEL}`}>
                  자산 정보 업데이트{" "}
                  <span className="font-semibold text-gray-600 dark:text-gray-300">매달 {settings.assetUpdateDate}일</span>
                </p>
              ) : null}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {settings.savings.length > 0 && (
                  <div>
                    <p className={`text-[11px] font-semibold mb-2 ${LABEL}`}>적금 목록</p>
                    <ul className="flex flex-col gap-1.5">
                      {settings.savings.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{item.name || "이름 없음"}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {item.day ? <span className={`text-[10px] ${LABEL}`}>{item.day}일</span> : null}
                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{fmt(item.amount)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {settings.fixedExpenses.length > 0 && (
                  <div>
                    <p className={`text-[11px] font-semibold mb-2 ${LABEL}`}>고정 지출 목록</p>
                    <ul className="flex flex-col gap-1.5">
                      {settings.fixedExpenses.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{item.name || "이름 없음"}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {item.day ? <span className={`text-[10px] ${LABEL}`}>{item.day}일</span> : null}
                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{fmt(item.amount)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => setInfoExpanded((v) => !v)}
            className="mt-3 flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors mx-auto"
          >
            {infoExpanded ? <>접기 <ChevronUp size={12} /></> : <>상세보기 <ChevronDown size={12} /></>}
          </button>
        </div>
      ) : (
        <div className={`${CARD} mb-6 flex flex-col items-center gap-4 py-10`}>
          <p className="text-sm text-gray-400 dark:text-gray-500">아직 설정된 정보가 없어요</p>
          <Link
            href="/dashboard/setup"
            className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <span className="text-base leading-none">+</span>
            설정 추가하기
          </Link>
        </div>
      )}

      {/* 주간 + 월간 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* 주간 리뷰 */}
        <div className={`${CARD} flex flex-col gap-4`}>
          <div className="flex items-center justify-between">
            <button onClick={() => setWeekOffset((o) => o - 1)} className={NAV_BTN}>
              <ChevronLeft size={16} />
            </button>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-900 dark:text-white">주간 리뷰</p>
              <p className={`text-[11px] mt-0.5 ${LABEL}`}>{weekLabel}</p>
            </div>
            <button onClick={() => setWeekOffset((o) => Math.min(o + 1, 0))} disabled={weekOffset === 0} className={NAV_BTN}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={SUBCARD_GRAY}>
              <p className={`text-[11px] mb-1 ${LABEL}`}>이번 주 지출</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{fmt(thisWeekTotal)}</p>
            </div>
            <div className={SUBCARD_ORANGE}>
              <p className={`text-[11px] mb-1 ${LABEL}`}>낭비 금액</p>
              <p className="text-base font-bold text-orange-500 dark:text-orange-400">{fmt(thisWeekWaste)}</p>
              {settings && <p className={`text-[10px] mt-1 ${LABEL}`}>일 한도 {fmt(settings.dailyLimit)}</p>}
            </div>
          </div>

          <div>
            <p className={`text-[11px] mb-2 ${LABEL}`}>지난주 비교</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "이번 주", color: "bg-green-400", value: thisWeekTotal, width: (thisWeekTotal / weekBarMax) * 100 },
                { label: "지난 주", color: "bg-gray-200 dark:bg-gray-600", value: prevWeekTotal, width: (prevWeekTotal / weekBarMax) * 100 },
              ].map(({ label, color, value, width }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`text-[11px] w-14 shrink-0 ${LABEL}`}>{label}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${width}%` }} />
                  </div>
                  <span className={`text-[11px] w-14 text-right shrink-0 ${LABEL}`}>{fmt(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className={`text-[11px] mb-2 ${LABEL}`}>이번 주 평가</p>
            <StarRating value={weekDraft.stars} onChange={(v) => setWeekDraft((d) => ({ ...d, stars: v }))} />
          </div>

          <div>
            <p className={`text-[11px] mb-1.5 ${LABEL}`}>리뷰</p>
            <Textarea
              value={weekDraft.text}
              onChange={(e) => setWeekDraft((d) => ({ ...d, text: e.target.value }))}
              placeholder="이번 주 소비를 되돌아보세요..."
              rows={5}
            />
          </div>

          <button onClick={saveWeekReview} disabled={weekMutation.isPending} className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors mt-auto">
            {weekMutation.isPending ? "저장 중..." : "저장"}
          </button>
        </div>

        {/* 월간 요약 */}
        <div className={`${CARD} flex flex-col gap-4`}>
          <div className="flex items-center justify-between">
            <button onClick={() => setMonthOffset((o) => o - 1)} className={NAV_BTN}>
              <ChevronLeft size={16} />
            </button>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-900 dark:text-white">월간 요약</p>
              <p className={`text-[11px] mt-0.5 ${LABEL}`}>{monthLabel}</p>
            </div>
            <button onClick={() => setMonthOffset((o) => Math.min(o + 1, 0))} disabled={monthOffset === 0} className={NAV_BTN}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={SUBCARD_GRAY}>
              <p className={`text-[11px] mb-1 ${LABEL}`}>총 지출</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{fmt(thisMonthTotal)}</p>
            </div>
            <div className={SUBCARD_ORANGE}>
              <p className={`text-[11px] mb-1 ${LABEL}`}>낭비 금액</p>
              <p className="text-base font-bold text-orange-500 dark:text-orange-400">{fmt(thisMonthWaste)}</p>
              {settings && <p className={`text-[10px] mt-1 ${LABEL}`}>저축 목표 {fmt(settings.monthlySavingGoal)}</p>}
            </div>
          </div>

          <div>
            <p className={`text-[11px] mb-2 ${LABEL}`}>지난달 비교</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "이번 달", color: "bg-green-400", value: thisMonthTotal, width: (thisMonthTotal / monthBarMax) * 100 },
                { label: "지난 달", color: "bg-gray-200 dark:bg-gray-600", value: prevMonthTotal, width: (prevMonthTotal / monthBarMax) * 100 },
              ].map(({ label, color, value, width }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`text-[11px] w-14 shrink-0 ${LABEL}`}>{label}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${width}%` }} />
                  </div>
                  <span className={`text-[11px] w-14 text-right shrink-0 ${LABEL}`}>{fmt(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className={`text-[11px] mb-2 ${LABEL}`}>이번 달 평가</p>
            <StarRating value={monthDraft.stars} onChange={(v) => setMonthDraft((d) => ({ ...d, stars: v }))} />
          </div>

          <div>
            <p className={`text-[11px] mb-1.5 ${LABEL}`}>리뷰</p>
            <Textarea
              value={monthDraft.text}
              onChange={(e) => setMonthDraft((d) => ({ ...d, text: e.target.value }))}
              placeholder="이번 달 소비를 되돌아보세요..."
              rows={5}
            />
          </div>

          <button onClick={saveMonthReview} disabled={monthMutation.isPending} className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors">
            {monthMutation.isPending ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
