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

type Review = {
  stars: number;
  text: string;
};

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
          } ${s <= (hover || value) ? "text-yellow-400" : "text-gray-200"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

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
      <h1 className="text-lg font-bold text-gray-900 mb-5">자산 관리</h1>

      {/* Settings card */}
      {settings ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-400">내 정보</p>
            <Link
              href="/demo/dashboard/setup"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors"
            >
              <Pencil size={11} />
              수정
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "월급", value: settings.monthlyIncome },
              {
                label: `적금 (${settings.savings.length}개)`,
                value: settings.savings.reduce((s, i) => s + i.amount, 0),
              },
              {
                label: `고정 지출 (${settings.fixedExpenses.length}개)`,
                value: settings.fixedExpenses.reduce((s, i) => s + i.amount, 0),
              },
              { label: "일일 한도", value: settings.dailyLimit },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-bold text-gray-900">{fmt(value)}</p>
              </div>
            ))}
          </div>

          {/* 상세 내용 */}
          {infoExpanded && (settings.savings.length > 0 || settings.fixedExpenses.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {settings.savings.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-2">적금 목록</p>
                  <ul className="flex flex-col gap-1.5">
                    {settings.savings.map((item) => (
                      <li key={item.id} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{item.name || "이름 없음"}</span>
                        <span className="text-xs font-semibold text-gray-800">{fmt(item.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {settings.fixedExpenses.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-2">고정 지출 목록</p>
                  <ul className="flex flex-col gap-1.5">
                    {settings.fixedExpenses.map((item) => (
                      <li key={item.id} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{item.name || "이름 없음"}</span>
                        <span className="text-xs font-semibold text-gray-800">{fmt(item.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 상세보기 / 접기 토글 */}
          <button
            onClick={() => setInfoExpanded((v) => !v)}
            className="mt-3 flex items-center gap-1 text-[11px] text-gray-400 hover:text-green-600 transition-colors mx-auto"
          >
            {infoExpanded ? (
              <>접기 <ChevronUp size={12} /></>
            ) : (
              <>상세보기 <ChevronDown size={12} /></>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 mb-6 flex flex-col items-center gap-4">
          <p className="text-sm text-gray-400">아직 설정된 정보가 없어요</p>
          <Link
            href="/demo/dashboard/setup"
            className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <span className="text-base leading-none">+</span>
            설정 추가하기
          </Link>
        </div>
      )}

      {/* Weekly + Monthly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Weekly review */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setWeekOffset((o) => o - 1)}
              className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-900">주간 리뷰</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{weekLabel}</p>
            </div>
            <button
              onClick={() => setWeekOffset((o) => Math.min(o + 1, 0))}
              disabled={weekOffset === 0}
              className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[11px] text-gray-400 mb-1">이번 주 지출</p>
              <p className="text-base font-bold text-gray-900">0원</p>
              <p className="text-[10px] text-gray-300 mt-1">가계부 연결 예정</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-[11px] text-gray-400 mb-1">낭비 금액</p>
              <p className="text-base font-bold text-orange-500">0원</p>
              {settings && (
                <p className="text-[10px] text-gray-400 mt-1">
                  일 한도 {fmt(settings.dailyLimit)}
                </p>
              )}
            </div>
          </div>

          {/* Last week comparison */}
          <div>
            <p className="text-[11px] text-gray-400 mb-2">지난주 비교</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "이번 주", value: 0, color: "bg-green-400" },
                { label: "지난 주", value: 0, color: "bg-gray-200" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 w-14 shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: "0%" }} />
                  </div>
                  <span className="text-[11px] text-gray-400 w-14 text-right shrink-0">{fmt(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] text-gray-400 mb-2">이번 주 평가</p>
            <StarRating
              value={weekDraft.stars}
              onChange={(v) => setWeekDraft((d) => ({ ...d, stars: v }))}
            />
          </div>

          <div>
            <p className="text-[11px] text-gray-400 mb-1.5">리뷰</p>
            <textarea
              value={weekDraft.text}
              onChange={(e) => setWeekDraft((d) => ({ ...d, text: e.target.value }))}
              placeholder="이번 주 소비를 되돌아보세요..."
              rows={5}
              className="w-full text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2.5 resize-none outline-none focus:ring-2 focus:ring-green-200 placeholder:text-gray-300"
            />
          </div>

          <button
            onClick={saveWeekReview}
            className="w-full py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors mt-auto"
          >
            저장
          </button>
        </div>

        {/* Monthly summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMonthOffset((o) => o - 1)}
              className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-900">월간 요약</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{monthLabel}</p>
            </div>
            <button
              onClick={() => setMonthOffset((o) => Math.min(o + 1, 0))}
              disabled={monthOffset === 0}
              className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[11px] text-gray-400 mb-1">총 지출</p>
              <p className="text-base font-bold text-gray-900">0원</p>
              <p className="text-[10px] text-gray-300 mt-1">가계부 연결 예정</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-[11px] text-gray-400 mb-1">낭비 금액</p>
              <p className="text-base font-bold text-orange-500">0원</p>
              {settings && (
                <p className="text-[10px] text-gray-400 mt-1">
                  저축 목표 {fmt(settings.monthlyGoal)}
                </p>
              )}
            </div>
          </div>

          {/* Last month comparison */}
          <div>
            <p className="text-[11px] text-gray-400 mb-2">지난달 비교</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "이번 달", value: 0, color: "bg-green-400" },
                { label: "지난 달", value: 0, color: "bg-gray-200" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 w-14 shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: "0%" }} />
                  </div>
                  <span className="text-[11px] text-gray-400 w-14 text-right shrink-0">{fmt(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] text-gray-400 mb-2">이번 달 평가</p>
            <StarRating
              value={monthDraft.stars}
              onChange={(v) => setMonthDraft((d) => ({ ...d, stars: v }))}
            />
          </div>

          <div>
            <p className="text-[11px] text-gray-400 mb-1.5">리뷰</p>
            <textarea
              value={monthDraft.text}
              onChange={(e) => setMonthDraft((d) => ({ ...d, text: e.target.value }))}
              placeholder="이번 달 소비를 되돌아보세요..."
              rows={5}
              className="w-full text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2.5 resize-none outline-none focus:ring-2 focus:ring-green-200 placeholder:text-gray-300"
            />
          </div>

          <button
            onClick={saveMonthReview}
            className="w-full py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
