"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Pencil, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

type ListItem = { id: string; name: string; amount: number };

type Settings = {
  monthlyIncome: number;
  dailyLimit: number;
  monthlyGoal: number;
  savings: ListItem[];
  fixedExpenses: ListItem[];
};

type Review = { stars: number; text: string };

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
const TEXTAREA = "w-full text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2.5 resize-none outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 placeholder:text-gray-300 dark:placeholder:text-gray-600";

export default function DashboardPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [weekReviews, setWeekReviews] = useState<Record<string, Review>>({});
  const [monthReviews, setMonthReviews] = useState<Record<string, Review>>({});
  const [weekDraft, setWeekDraft] = useState<Review>({ stars: 0, text: "" });
  const [monthDraft, setMonthDraft] = useState<Review>({ stars: 0, text: "" });

  useEffect(() => {
    const s = localStorage.getItem("inote-settings");
    if (s) setSettings(JSON.parse(s));
    const wr = localStorage.getItem("inote-week-reviews");
    if (wr) setWeekReviews(JSON.parse(wr));
    const mr = localStorage.getItem("inote-month-reviews");
    if (mr) setMonthReviews(JSON.parse(mr));
  }, []);

  const monday = getWeekMonday(weekOffset);
  const sunday = getWeekSunday(monday);
  const wKey = monday.toISOString().slice(0, 10);
  const weekLabel = `${fmtDate(monday)} ~ ${fmtDate(sunday)}`;

  const now = new Date();
  const rawMonth = now.getMonth() + 1 + monthOffset;
  const normalizedDate = new Date(now.getFullYear(), rawMonth - 1, 1);
  const mYear = normalizedDate.getFullYear();
  const mMonth = normalizedDate.getMonth() + 1;
  const mKey = `${mYear}-${String(mMonth).padStart(2, "0")}`;
  const monthLabel = `${mYear}년 ${mMonth}월`;

  useEffect(() => {
    setWeekDraft(weekReviews[wKey] ?? { stars: 0, text: "" });
  }, [wKey, weekReviews]);

  useEffect(() => {
    setMonthDraft(monthReviews[mKey] ?? { stars: 0, text: "" });
  }, [mKey, monthReviews]);

  const saveWeekReview = () => {
    const updated = { ...weekReviews, [wKey]: weekDraft };
    setWeekReviews(updated);
    localStorage.setItem("inote-week-reviews", JSON.stringify(updated));
  };

  const saveMonthReview = () => {
    const updated = { ...monthReviews, [mKey]: monthDraft };
    setMonthReviews(updated);
    localStorage.setItem("inote-month-reviews", JSON.stringify(updated));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-6 pb-8">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-5">자산 관리</h1>

      {/* 내 정보 카드 */}
      {settings ? (
        <div className={`${CARD} mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <p className={`text-xs font-semibold ${LABEL}`}>내 정보</p>
            <Link
              href="/demo/dashboard/setup"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 dark:text-gray-500 dark:hover:text-green-400 transition-colors"
            >
              <Pencil size={11} />
              수정
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "월급", value: settings.monthlyIncome },
              { label: `적금 (${settings.savings.length}개)`, value: settings.savings.reduce((s, i) => s + i.amount, 0) },
              { label: `고정 지출 (${settings.fixedExpenses.length}개)`, value: settings.fixedExpenses.reduce((s, i) => s + i.amount, 0) },
              { label: "일일 한도", value: settings.dailyLimit },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className={`text-[11px] mb-0.5 ${LABEL}`}>{label}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(value)}</p>
              </div>
            ))}
          </div>

          {infoExpanded && (settings.savings.length > 0 || settings.fixedExpenses.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {settings.savings.length > 0 && (
                <div>
                  <p className={`text-[11px] font-semibold mb-2 ${LABEL}`}>적금 목록</p>
                  <ul className="flex flex-col gap-1.5">
                    {settings.savings.map((item) => (
                      <li key={item.id} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-300">{item.name || "이름 없음"}</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{fmt(item.amount)}</span>
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
                      <li key={item.id} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-300">{item.name || "이름 없음"}</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{fmt(item.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
            href="/demo/dashboard/setup"
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
              <p className="text-base font-bold text-gray-900 dark:text-white">0원</p>
              <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">가계부 연결 예정</p>
            </div>
            <div className={SUBCARD_ORANGE}>
              <p className={`text-[11px] mb-1 ${LABEL}`}>낭비 금액</p>
              <p className="text-base font-bold text-orange-500 dark:text-orange-400">0원</p>
              {settings && <p className={`text-[10px] mt-1 ${LABEL}`}>일 한도 {fmt(settings.dailyLimit)}</p>}
            </div>
          </div>

          <div>
            <p className={`text-[11px] mb-2 ${LABEL}`}>지난주 비교</p>
            <div className="flex flex-col gap-2">
              {[{ label: "이번 주", color: "bg-green-400" }, { label: "지난 주", color: "bg-gray-200 dark:bg-gray-600" }].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`text-[11px] w-14 shrink-0 ${LABEL}`}>{label}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: "0%" }} />
                  </div>
                  <span className={`text-[11px] w-14 text-right shrink-0 ${LABEL}`}>0원</span>
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
            <textarea
              value={weekDraft.text}
              onChange={(e) => setWeekDraft((d) => ({ ...d, text: e.target.value }))}
              placeholder="이번 주 소비를 되돌아보세요..."
              rows={5}
              className={TEXTAREA}
            />
          </div>

          <button onClick={saveWeekReview} className="w-full py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors mt-auto">
            저장
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
              <p className="text-base font-bold text-gray-900 dark:text-white">0원</p>
              <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">가계부 연결 예정</p>
            </div>
            <div className={SUBCARD_ORANGE}>
              <p className={`text-[11px] mb-1 ${LABEL}`}>낭비 금액</p>
              <p className="text-base font-bold text-orange-500 dark:text-orange-400">0원</p>
              {settings && <p className={`text-[10px] mt-1 ${LABEL}`}>저축 목표 {fmt(settings.monthlyGoal)}</p>}
            </div>
          </div>

          <div>
            <p className={`text-[11px] mb-2 ${LABEL}`}>지난달 비교</p>
            <div className="flex flex-col gap-2">
              {[{ label: "이번 달", color: "bg-green-400" }, { label: "지난 달", color: "bg-gray-200 dark:bg-gray-600" }].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`text-[11px] w-14 shrink-0 ${LABEL}`}>{label}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: "0%" }} />
                  </div>
                  <span className={`text-[11px] w-14 text-right shrink-0 ${LABEL}`}>0원</span>
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
            <textarea
              value={monthDraft.text}
              onChange={(e) => setMonthDraft((d) => ({ ...d, text: e.target.value }))}
              placeholder="이번 달 소비를 되돌아보세요..."
              rows={5}
              className={TEXTAREA}
            />
          </div>

          <button onClick={saveMonthReview} className="w-full py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
