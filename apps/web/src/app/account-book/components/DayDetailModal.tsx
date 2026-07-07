'use client';

import { Dialog, DialogOverlay, DialogPortal, DialogPopup, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
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
      <DialogPortal>
        <DialogOverlay />
        <DialogPopup
          className={[
            // 공통
            'fixed z-50 bg-white dark:bg-gray-800 outline-none flex flex-col',
            'duration-200',
            // 모바일: 바텀시트
            'bottom-0 left-0 right-0 rounded-t-2xl max-h-[85dvh]',
            'data-open:animate-in data-open:slide-in-from-bottom',
            'data-closed:animate-out data-closed:slide-out-to-bottom',
            // 데스크탑: 센터 모달
            'sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
            'sm:w-full sm:max-w-sm sm:rounded-2xl sm:max-h-[80vh]',
            'sm:data-open:zoom-in-95 sm:data-closed:zoom-out-95',
            'sm:ring-1 sm:ring-foreground/10',
          ].join(' ')}
        >
          {/* 모바일 핸들 바 */}
          <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-600" />
          </div>

          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
            <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">
              {dateKey ? formatTitle(dateKey) : ''}
            </DialogTitle>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* 내용 */}
          {dateKey && (
            <div className="overflow-y-auto px-5 py-4">
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
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
