"use client";

import { useState, useMemo } from "react";
import { TriangleAlert, ChevronLeft, ChevronRight, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { type ExpenseMap, type Expense, CATEGORIES, CATEGORY_BADGE } from "../data";

type Props = {
  monthExpenses: ExpenseMap;
  month: number;
  onAddExpense: (date: string, expense: Omit<Expense, "id">) => void;
  onDeleteExpense: (date: string, id: string) => void;
  onEditExpense: (date: string, id: string, expense: Omit<Expense, "id">) => void;
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const fmt = (n: number) => n.toLocaleString("ko-KR") + "원";

function getTodayKey() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

function parseDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const day = DAYS[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${day})`;
}

function getWeekLabel(dateStr: string, month: number) {
  const day = parseInt(dateStr.split("-")[2]);
  return `${month}월 ${Math.ceil(day / 7)}주차`;
}

// ── 인라인 수정 폼 (저장된 항목 & 미저장 항목 공용) ────────────
function InlineEditForm({
  expense,
  onSave,
  onCancel,
}: {
  expense: Omit<Expense, "id">;
  onSave: (updated: Omit<Expense, "id">) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(String(expense.amount));
  const [place, setPlace] = useState(expense.place === "-" ? "" : expense.place);
  const [category, setCategory] = useState(expense.category);
  const [isWaste, setIsWaste] = useState(expense.isWaste);

  const isValid = Number(amount) > 0;

  const handleSave = () => {
    if (!isValid) return;
    onSave({ place: place.trim() || "-", amount: Number(amount), category, isWaste });
  };

  return (
    <li className="px-4 py-3 flex flex-col gap-2.5 bg-blue-50/40 border-l-2 border-blue-400">
      {/* 카테고리 */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
              category === cat ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      {/* 금액 + 사용처 + 취소/저장 */}
      <div className="flex gap-2 items-center">
        <div className="relative w-32 shrink-0">
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel(); }}
            autoFocus
            className="w-full border border-blue-200 rounded-xl px-3 py-2 pr-7 text-right text-sm font-bold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">원</span>
        </div>
        <input
          type="text"
          placeholder="사용처 (선택)"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel(); }}
          className="flex-1 border border-blue-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
        />
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <X size={14} />
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
              isValid ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            <Check size={14} />
          </button>
        </div>
      </div>
      {/* 낭비 체크박스 */}
      <button
        type="button"
        onClick={() => setIsWaste((v) => !v)}
        className="flex items-center gap-1.5 w-fit"
      >
        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
          isWaste ? "border-orange-400 bg-orange-400" : "border-gray-300 bg-white"
        }`}>
          {isWaste && <Check size={9} className="text-white" strokeWidth={3} />}
        </span>
        <span className={`text-xs transition-colors ${isWaste ? "text-orange-500 font-semibold" : "text-gray-400"}`}>
          낭비
        </span>
      </button>
    </li>
  );
}

// ── 통합 날짜 카드 ──────────────────────────────────────────────
function DayCard({
  date,
  items,
  isToday = false,
  onAdd,
  onDelete,
  onEdit,
}: {
  date: string;
  items: Expense[];
  isToday?: boolean;
  onAdd: (expense: Omit<Expense, "id">) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, expense: Omit<Expense, "id">) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPendingIndex, setEditingPendingIndex] = useState<number | null>(null);
  const [pendingItems, setPendingItems] = useState<Omit<Expense, "id">[]>([]);
  const [place, setPlace] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [isWaste, setIsWaste] = useState(false);

  const isValid = Number(amount) > 0;
  const savedTotal = items.reduce((sum, e) => sum + e.amount, 0);
  const savedWaste = items.filter((e) => e.isWaste).reduce((sum, e) => sum + e.amount, 0);
  const pendingTotal = pendingItems.reduce((sum, e) => sum + e.amount, 0);
  const pendingWaste = pendingItems.filter((e) => e.isWaste).reduce((sum, e) => sum + e.amount, 0);
  const total = savedTotal + pendingTotal;
  const waste = savedWaste + pendingWaste;
  const totalCount = items.length + pendingItems.length;

  const resetForm = () => {
    setAmount("");
    setPlace("");
    setCategory(CATEGORIES[0]);
    setIsWaste(false);
    setEditingPendingIndex(null);
  };

  const handleAddPending = () => {
    if (!isValid) return;
    if (editingPendingIndex !== null) {
      setPendingItems((prev) =>
        prev.map((item, i) =>
          i === editingPendingIndex
            ? { place: place.trim() || "-", amount: Number(amount), category, isWaste }
            : item
        )
      );
    } else {
      setPendingItems((prev) => [
        ...prev,
        { place: place.trim() || "-", amount: Number(amount), category, isWaste },
      ]);
    }
    resetForm();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    pendingItems.forEach((item) => onAdd(item));
    setPendingItems([]);
    setExpanded(false);
    resetForm();
  };

  const handleOpen = () => {
    setEditingId(null);
    setExpanded(true);
  };
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingItems([]);
    setEditingId(null);
    setExpanded(false);
    resetForm();
  };

  const handleStartEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setEditingId(id);
    if (!expanded) setExpanded(true);
  };

  const handleRemovePending = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setPendingItems((prev) => prev.filter((_, i) => i !== index));
    if (editingPendingIndex === index) resetForm();
  };

  const handleEditPending = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setEditingPendingIndex(index);
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-colors ${
        isToday ? "border-2 border-dashed border-gray-200" : "border border-gray-100"
      } ${!expanded ? "cursor-pointer hover:bg-gray-50/50" : ""}`}
      onClick={!expanded ? handleOpen : undefined}
    >
      {/* 날짜 헤더 */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-700">{parseDateLabel(date)}</h3>
          {isToday && (
            <span className="text-[10px] bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-full">
              오늘
            </span>
          )}
        </div>
        {expanded && (
          <button onClick={handleClose} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ✕
          </button>
        )}
      </div>

      {/* 아이템 리스트 */}
      {items.length > 0 && (
        <ul className="divide-y divide-gray-50">
          {items.map((expense) =>
            editingId === expense.id ? (
              <InlineEditForm
                key={expense.id}
                expense={expense}
                onSave={(updated) => { onEdit(expense.id, updated); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <li key={expense.id} className="flex items-center gap-2 px-4 py-3 group">
                <span className={`text-sm font-semibold shrink-0 ${expense.isWaste ? "text-orange-500" : "text-gray-900"}`}>
                  {fmt(expense.amount)}
                </span>
                {expense.isWaste && <TriangleAlert size={13} className="text-orange-400 shrink-0" />}
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className={`text-sm truncate ${expense.isWaste ? "text-orange-500" : "text-gray-600"}`}>
                    {expense.place !== "-" ? expense.place : ""}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${CATEGORY_BADGE[expense.category] ?? "bg-gray-100 text-gray-600"}`}>
                    {expense.category}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => handleStartEdit(e, expense.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-blue-50 text-gray-300 hover:text-blue-400"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(expense.id); }}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}

      {/* 저장 대기 아이템 */}
      {pendingItems.length > 0 && (
        <ul className="divide-y divide-green-50 bg-green-50/40">
          {pendingItems.map((expense, i) =>
            editingPendingIndex === i ? (
              <InlineEditForm
                key={`pending-edit-${i}`}
                expense={expense}
                onSave={(updated) => {
                  setPendingItems((prev) => prev.map((item, idx) => idx === i ? updated : item));
                  setEditingPendingIndex(null);
                }}
                onCancel={() => setEditingPendingIndex(null)}
              />
            ) : (
              <li key={`pending-${i}`} className="flex items-center gap-2 px-4 py-3 group">
                <span className={`text-sm font-semibold shrink-0 ${expense.isWaste ? "text-orange-500" : "text-gray-900"}`}>
                  {fmt(expense.amount)}
                </span>
                {expense.isWaste && <TriangleAlert size={13} className="text-orange-400 shrink-0" />}
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className={`text-sm truncate ${expense.isWaste ? "text-orange-500" : "text-gray-600"}`}>
                    {expense.place !== "-" ? expense.place : ""}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${CATEGORY_BADGE[expense.category] ?? "bg-gray-100 text-gray-600"}`}>
                    {expense.category}
                  </span>
                </div>
                <div className="relative shrink-0 flex items-center justify-end w-[48px]">
                  <span className="text-[10px] text-green-500 font-medium transition-opacity group-hover:opacity-0">미저장</span>
                  <div className="absolute right-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditPending(e, i)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-blue-50 text-gray-300 hover:text-blue-400"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={(e) => handleRemovePending(e, i)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </li>
            )
          )}
        </ul>
      )}

      {/* 빈 상태 */}
      {!expanded && items.length === 0 && pendingItems.length === 0 && (
        <div className="px-4 py-8 flex flex-col items-center gap-2">
          <Plus size={22} className="text-gray-300" />
          <span className="text-sm text-gray-400">
            {isToday ? "오늘 지출 내역이 없습니다. 탭하여 추가하세요" : "탭하여 추가하세요"}
          </span>
        </div>
      )}

      {/* 추가 입력 폼 */}
      {expanded && (
        <div className="px-4 pt-4 pb-3 flex flex-col gap-3 border-t border-gray-100 bg-gray-50/50" onClick={(e) => e.stopPropagation()}>
          {/* 카테고리 */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  category === cat ? "bg-green-500 text-white" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* 금액 + 사용처 */}
          <div className="flex gap-2 items-center">
            <div className="relative w-36 shrink-0">
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPending()}
                autoFocus={editingId === null}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-8 text-right text-base font-bold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">원</span>
            </div>
            <input
              type="text"
              placeholder="사용처 (선택)"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPending()}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-colors"
            />
          </div>
          {/* 낭비 체크박스 */}
          <button
            type="button"
            onClick={() => setIsWaste((v) => !v)}
            className="flex items-center gap-1.5 w-fit"
          >
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
              isWaste ? "border-orange-400 bg-orange-400" : "border-gray-300 bg-white"
            }`}>
              {isWaste && <Check size={9} className="text-white" strokeWidth={3} />}
            </span>
            <span className={`text-xs transition-colors ${isWaste ? "text-orange-500 font-semibold" : "text-gray-400"}`}>
              낭비
            </span>
          </button>
          {/* 추가하기 버튼 */}
          <button
            onClick={handleAddPending}
            disabled={!isValid}
            className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
              isValid ? "bg-green-500 text-white hover:bg-green-600 active:bg-green-700" : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            <Plus size={15} />
            추가하기
          </button>
        </div>
      )}

      {/* 푸터 */}
      {(items.length > 0 || pendingItems.length > 0) && (
        <div className="px-4 py-2.5 bg-gray-50 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">{fmt(total)}</span>
            {waste > 0 && <span className="text-xs text-orange-500 font-medium">낭비 {fmt(waste)}</span>}
            <span className="text-xs text-gray-400">{totalCount}건</span>
          </div>
          {expanded && pendingItems.length > 0 && (
            <button onClick={handleSave} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition-colors">
              저장 ({pendingItems.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────
export default function WeeklyLogView({ monthExpenses, month, onAddExpense, onDeleteExpense, onEditExpense }: Props) {
  const todayKey = getTodayKey();
  const todayMonth = new Date().getMonth() + 1;
  const todayWeekNum = Math.ceil(new Date().getDate() / 7);
  const todayWeekLabel = `${todayMonth}월 ${todayWeekNum}주차`;

  const weeklyGroups = useMemo(() => {
    const dates = Object.keys(monthExpenses).sort((a, b) => b.localeCompare(a));
    const grouped = new Map<string, string[]>();
    for (const date of dates) {
      const label = getWeekLabel(date, month);
      if (!grouped.has(label)) grouped.set(label, []);
      grouped.get(label)!.push(date);
    }
    if (month === todayMonth && !grouped.has(todayWeekLabel)) {
      grouped.set(todayWeekLabel, []);
    }
    return Array.from(grouped.entries()).sort(([a], [b]) => {
      const wA = parseInt(a.match(/(\d+)주차/)?.[1] ?? "0");
      const wB = parseInt(b.match(/(\d+)주차/)?.[1] ?? "0");
      return wA - wB;
    });
  }, [monthExpenses, month, todayWeekLabel, todayMonth]);

  const defaultIndex = useMemo(() => {
    const idx = weeklyGroups.findIndex(([label]) => label === todayWeekLabel);
    return idx >= 0 ? idx : weeklyGroups.length - 1;
  }, [weeklyGroups, todayWeekLabel]);

  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const safeIndex = Math.min(Math.max(activeIndex, 0), weeklyGroups.length - 1);
  const [weekLabel, dates] = weeklyGroups[safeIndex] ?? ["", []];

  const isCurrentWeek = weekLabel === todayWeekLabel && month === todayMonth;

  if (weeklyGroups.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        이번달 지출 내역이 없습니다
      </div>
    );
  }

  return (
    <div>
      {/* 주차 네비게이션 */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          onClick={() => setActiveIndex((i) => i - 1)}
          disabled={safeIndex === 0}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-bold text-gray-700">{weekLabel}</span>
        <button
          onClick={() => setActiveIndex((i) => i + 1)}
          disabled={safeIndex === weeklyGroups.length - 1}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 카드 목록 */}
      <div className="flex flex-col gap-3">
        {isCurrentWeek && (
          <DayCard
            date={todayKey}
            items={monthExpenses[todayKey] ?? []}
            isToday
            onAdd={(expense) => onAddExpense(todayKey, expense)}
            onDelete={(id) => onDeleteExpense(todayKey, id)}
            onEdit={(id, expense) => onEditExpense(todayKey, id, expense)}
          />
        )}
        {dates
          .filter((d) => d !== todayKey)
          .sort((a, b) => b.localeCompare(a))
          .map((date) => (
            <DayCard
              key={date}
              date={date}
              items={monthExpenses[date] ?? []}
              onAdd={(expense) => onAddExpense(date, expense)}
              onDelete={(id) => onDeleteExpense(date, id)}
              onEdit={(id, expense) => onEditExpense(date, id, expense)}
            />
          ))}
      </div>
    </div>
  );
}
