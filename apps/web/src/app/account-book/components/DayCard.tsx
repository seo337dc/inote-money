'use client';

import { useState } from 'react';
import { X, Check, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Expense, type Category, CATEGORIES, CATEGORY_KO, CATEGORY_BADGE } from '../types';

function fmtNum(v: string | number) {
  if (v === '' || v === 0) return '';
  return Number(v).toLocaleString('ko-KR');
}

function CategorySelect({ value, onChange }: { value: Category; onChange: (v: Category) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Category)}>
      <SelectTrigger className="w-[80px] h-8 text-xs shrink-0">
        <span>{CATEGORY_KO[value]}</span>
      </SelectTrigger>
      <SelectContent>
        {CATEGORIES.map((c) => (
          <SelectItem key={c} value={c} className="text-xs py-2.5">
            {CATEGORY_KO[c]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─────────────────── AddExpenseForm ───────────────────

type AddFormProps = {
  onAdd: (expense: Omit<Expense, 'id'>) => Promise<void>;
};

export function AddExpenseForm({ onAdd }: AddFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('FOOD');
  const [isWaste, setIsWaste] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const parsed = parseInt(amount.replace(/,/g, ''), 10);
    if (!parsed || parsed <= 0) return;
    setLoading(true);
    try {
      await onAdd({ description: description.trim() || null, amount: parsed, category, isWaste });
      setDescription('');
      setAmount('');
      setCategory('FOOD');
      setIsWaste(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 border-b border-gray-100 dark:border-gray-700/50 py-3.5">
      <div className="flex items-center gap-2">
        <CategorySelect value={category} onChange={setCategory} />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="내용 (선택)"
          className="flex-1 min-w-0 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 text-gray-900 dark:text-white placeholder:text-gray-400"
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-green-200 dark:focus-within:ring-green-800">
          <input
            type="text"
            inputMode="numeric"
            value={fmtNum(amount)}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="금액"
            className="flex-1 bg-transparent text-xs outline-none text-gray-900 dark:text-white min-w-0"
          />
          <span className="text-xs text-gray-400 ml-1 shrink-0">원</span>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
          <div
            onClick={() => setIsWaste((p) => !p)}
            className={cn(
              'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
              isWaste ? 'bg-orange-400 border-orange-400' : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700'
            )}
          >
            {isWaste && <Check className="w-2.5 h-2.5 text-white" />}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">낭비</span>
        </label>
      </div>
      <button
        onClick={handleAdd}
        disabled={loading}
        className="w-full py-1.5 rounded-lg text-xs bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-medium transition-colors flex items-center justify-center gap-1.5"
      >
        {loading && (
          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        {loading ? '추가 중...' : '+ 추가'}
      </button>
    </div>
  );
}

// ─────────────────── EditModeRow ───────────────────

type EditableExpense = Expense & { _deleted?: boolean; _new?: boolean };

function EditModeRow({
  expense,
  onChange,
  onMarkDelete,
}: {
  expense: EditableExpense;
  onChange: (updated: EditableExpense) => void;
  onMarkDelete: () => void;
}) {
  if (expense._deleted) return null;

  return (
    <div className="py-3.5 flex flex-col gap-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <div className="flex items-center gap-2">
        <CategorySelect
          value={expense.category}
          onChange={(v) => onChange({ ...expense, category: v })}
        />
        <input
          type="text"
          value={expense.description ?? ''}
          onChange={(e) => onChange({ ...expense, description: e.target.value || null })}
          placeholder="내용 (선택)"
          className="flex-1 min-w-0 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 text-gray-900 dark:text-white placeholder:text-gray-400"
        />
        <button
          onClick={onMarkDelete}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-400 transition-colors shrink-0"
        >
          <X size={13} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-green-200 dark:focus-within:ring-green-800">
          <input
            type="text"
            inputMode="numeric"
            value={fmtNum(expense.amount)}
            onChange={(e) => onChange({ ...expense, amount: parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0 })}
            className="flex-1 bg-transparent text-xs outline-none text-gray-900 dark:text-white min-w-0"
          />
          <span className="text-xs text-gray-400 ml-1 shrink-0">원</span>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
          <div
            onClick={() => onChange({ ...expense, isWaste: !expense.isWaste })}
            className={cn(
              'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
              expense.isWaste ? 'bg-orange-400 border-orange-400' : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700'
            )}
          >
            {expense.isWaste && <Check className="w-2.5 h-2.5 text-white" />}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">낭비</span>
        </label>
      </div>
    </div>
  );
}

// ─────────────────── ReadModeRow ───────────────────

function ReadModeRow({ expense }: { expense: Expense }) {
  return (
    <div className="flex items-center gap-2 py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
      <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0', CATEGORY_BADGE[expense.category])}>
        {CATEGORY_KO[expense.category]}
      </span>
      <span className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate min-w-0">
        {expense.description ?? '—'}
        {expense.isWaste && (
          <span className="ml-1 text-[10px] text-orange-400 font-medium">낭비</span>
        )}
      </span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
        {expense.amount.toLocaleString('ko-KR')}원
      </span>
    </div>
  );
}

// ─────────────────── DayCard ───────────────────

type DayCardProps = {
  dateKey: string;
  expenses: Expense[];
  onAdd: (dateKey: string, expense: Omit<Expense, 'id'>) => Promise<void>;
  onEdit: (dateKey: string, updated: Expense) => Promise<void>;
  onDelete: (dateKey: string, id: string) => Promise<void>;
  showDate?: boolean;
};

function formatDateLabel(dateKey: string) {
  const [, m, d] = dateKey.split('-').map(Number);
  const date = new Date(dateKey);
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${m}월 ${d}일 (${dayOfWeek})`;
}

export default function DayCard({ dateKey, expenses, onAdd, onEdit, onDelete, showDate = true }: DayCardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [localExpenses, setLocalExpenses] = useState<EditableExpense[]>([]);
  const [saving, setSaving] = useState(false);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const enterEditMode = () => {
    setLocalExpenses(expenses.map((e) => ({ ...e })));
    setEditMode(true);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setLocalExpenses([]);
  };

  const addBlankExpense = () => {
    setLocalExpenses((prev) => [
      ...prev,
      {
        id: `_new_${Date.now()}`,
        description: null,
        amount: 0,
        category: 'ETC' as Category,
        isWaste: false,
        _new: true,
      },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const toDelete = localExpenses.filter((e) => e._deleted && !e._new);
      const toAdd = localExpenses.filter((e) => e._new && !e._deleted && e.amount > 0);
      const toUpdate = localExpenses.filter((e) => !e._new && !e._deleted).filter((e) => {
        const orig = expenses.find((o) => o.id === e.id);
        if (!orig) return false;
        return (
          orig.description !== e.description ||
          orig.amount !== e.amount ||
          orig.category !== e.category ||
          orig.isWaste !== e.isWaste
        );
      });

      await Promise.all([
        ...toDelete.map((e) => onDelete(dateKey, e.id)),
        ...toUpdate.map(({ _deleted, _new, ...e }) => onEdit(dateKey, e)),
        ...toAdd.map(({ _deleted, _new, id, ...e }) => onAdd(dateKey, e)),
      ]);
      setEditMode(false);
      setLocalExpenses([]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {saving && (
        <div className="absolute inset-0 z-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
          <svg className="w-5 h-5 animate-spin text-green-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      )}
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showDate && (
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {formatDateLabel(dateKey)}
            </span>
          )}
        </div>
        {total > 0 && !editMode && (
          <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
            {total.toLocaleString('ko-KR')}원
          </span>
        )}

        {editMode && (
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={cancelEdit}
              disabled={saving}
              className="px-3 py-1 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={() => setLocalExpenses((prev) => prev.map((e) => ({ ...e, _deleted: true })))}
              disabled={saving}
              className="px-3 py-1 rounded-lg text-xs bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-60"
            >
              초기화
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 rounded-lg text-xs bg-green-500 hover:bg-green-600 text-white font-medium transition-colors disabled:opacity-60"
            >
              저장
            </button>
          </div>
        )}
      </div>

      {/* Expense list */}
      <div className="px-4">
        {editMode ? (
          <>
            {localExpenses.every((e) => e._deleted) && (
              <p className="py-4 text-center text-xs text-gray-300 dark:text-gray-600">
                저장하면 모든 항목이 삭제됩니다
              </p>
            )}
            {localExpenses.map((expense) => (
              <EditModeRow
                key={expense.id}
                expense={expense}
                onChange={(updated) =>
                  setLocalExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
                }
                onMarkDelete={() =>
                  setLocalExpenses((prev) =>
                    prev.map((e) => (e.id === expense.id ? { ...e, _deleted: true } : e))
                  )
                }
              />
            ))}
          </>
        ) : (
          <>
            {expenses.map((e) => (
              <ReadModeRow key={e.id} expense={e} />
            ))}
            {expenses.length === 0 && !showAddForm && (
              <p className="py-4 text-center text-xs text-gray-300 dark:text-gray-600">
                지출 내역이 없습니다
              </p>
            )}
          </>
        )}
      </div>

      {/* Add form */}
      {showAddForm && !editMode && (
        <div className="px-4 pb-3">
          <AddExpenseForm
            onAdd={async (expense) => {
              await onAdd(dateKey, expense);
              setShowAddForm(false);
            }}
          />
        </div>
      )}

      {/* 하단 버튼 */}
      {!showAddForm && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          {editMode ? (
            <button
              onClick={addBlankExpense}
              className="w-full py-3 text-xs text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center justify-center gap-1"
            >
              + 지출 추가하기
            </button>
          ) : expenses.length > 0 ? (
            <button
              onClick={enterEditMode}
              className="w-full py-3 text-xs text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center justify-center gap-1.5"
            >
              <Pencil size={11} />
              수정하기
            </button>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 text-xs text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center justify-center gap-1"
            >
              + 지출 추가하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
