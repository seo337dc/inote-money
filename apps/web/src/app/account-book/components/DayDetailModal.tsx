'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Expense } from '../types';
import DayCard from './DayCard';

type Props = {
  dateKey: string | null;
  expenses: Expense[];
  onClose: () => void;
  onAdd: (dateKey: string, expense: Omit<Expense, 'id'>) => Promise<void>;
  onEdit: (dateKey: string, updated: Expense) => Promise<void>;
  onDelete: (dateKey: string, id: string) => Promise<void>;
};

function formatTitle(dateKey: string) {
  const [, m, d] = dateKey.split('-').map(Number);
  const date = new Date(dateKey);
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${m}월 ${d}일 (${dayOfWeek})`;
}

export default function DayDetailModal({ dateKey, expenses, onClose, onAdd, onEdit, onDelete }: Props) {
  return (
    <Dialog open={!!dateKey} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-sm mx-auto p-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">
            {dateKey ? formatTitle(dateKey) : ''}
          </DialogTitle>
        </DialogHeader>
        {dateKey && (
          <div className="px-5 py-4">
            <DayCard
              dateKey={dateKey}
              expenses={expenses}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              showDate={false}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
