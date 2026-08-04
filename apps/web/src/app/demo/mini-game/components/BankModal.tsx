'use client';

import { useState } from 'react';
import { PlayerState, LiabilityItem } from '../types';
import { calculateTotalExpenses, formatCurrency } from '../lib/gameLogic';
import { Building2, X, PlusCircle, MinusCircle, CheckCircle2, DollarSign, TrendingDown } from 'lucide-react';

interface BankModalProps {
  player: PlayerState;
  onClose: () => void;
  onBorrow: (amount: number) => void;
  onRepayBankLoan: (amount: number) => void;
  onRepayLiability: (liabilityId: string) => void;
}

export function BankModal({ player, onClose, onBorrow, onRepayBankLoan, onRepayLiability }: BankModalProps) {
  const [borrowAmount, setBorrowAmount] = useState<number>(1000);
  const [repayBankAmount, setRepayBankAmount] = useState<number>(1000);
  const [activeTab, setActiveTab] = useState<'loan' | 'liabilities'>('loan');

  const handleBorrow = () => {
    if (borrowAmount <= 0 || borrowAmount % 1000 !== 0) return;
    onBorrow(borrowAmount);
  };

  const handleRepayBank = () => {
    if (repayBankAmount <= 0 || repayBankAmount % 1000 !== 0) return;
    if (repayBankAmount > player.cash) { alert('보유 현금이 부족합니다.'); return; }
    if (repayBankAmount > player.bankLoan) { alert('대출 잔액보다 많이 상환할 수 없습니다.'); return; }
    onRepayBankLoan(repayBankAmount);
  };

  const totalExpenses = calculateTotalExpenses(player);

  const tabClass = (tab: string) =>
    `flex-1 py-3 text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
      activeTab === tab
        ? 'border-emerald-500 text-emerald-600 bg-emerald-50/60'
        : 'border-transparent text-stone-400 hover:text-stone-700'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">은행 대출 및 부채 상환</h3>
              <p className="text-xs text-stone-400">대출을 통해 초기 투자금을 마련하거나, 부채를 갚아 월 지출을 줄이세요.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-stone-200 bg-white">
          <button onClick={() => setActiveTab('loan')} className={tabClass('loan')}>
            <DollarSign className="w-4 h-4" /><span>은행 대출 및 상환 (10% 월 이자)</span>
          </button>
          <button onClick={() => setActiveTab('liabilities')} className={tabClass('liabilities')}>
            <TrendingDown className="w-4 h-4" /><span>기존 부채 조기 상환 (월 지출 감소)</span>
          </button>
        </div>

        <div className="p-6">
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400">보유 현금</div>
              <div className="text-lg font-bold text-emerald-600">{formatCurrency(player.cash)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-stone-400">현재 은행 대출액</div>
              <div className="text-lg font-bold text-amber-600">{formatCurrency(player.bankLoan)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-stone-400">월 총 지출</div>
              <div className="text-lg font-bold text-rose-500">{formatCurrency(totalExpenses)}</div>
            </div>
          </div>

          {activeTab === 'loan' && (
            <div className="space-y-6">
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-emerald-500" />
                    <span>새로 대출받기 (100만원 단위)</span>
                  </h4>
                  <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-medium">
                    월 이자: 대출금의 10%
                  </span>
                </div>
                <p className="text-xs text-stone-400 mb-4">
                  대출 시 현금이 늘어나지만, 매월 지급해야 하는 이자(월 지출)가 증가하여 쥐경주 탈출 목표액이 높아집니다.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2">
                    <input
                      type="number"
                      step={1000}
                      min={1000}
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(Number(e.target.value))}
                      className="bg-transparent text-stone-800 font-bold text-sm w-full outline-none"
                    />
                    <span className="text-stone-500 text-xs whitespace-nowrap">{formatCurrency(borrowAmount)}</span>
                  </div>
                  <button
                    onClick={handleBorrow}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
                  >
                    대출 실행
                  </button>
                </div>
                <div className="mt-2 text-right text-xs text-stone-400">
                  예상 월 이자 추가: <span className="text-rose-500 font-semibold">+{formatCurrency(borrowAmount / 10)} /월</span>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                    <MinusCircle className="w-4 h-4 text-blue-500" />
                    <span>은행 대출금 상환</span>
                  </h4>
                  <span className="text-xs text-stone-400">현재 대출: {formatCurrency(player.bankLoan)}</span>
                </div>
                <p className="text-xs text-stone-400 mb-4">대출금을 100만원 단위로 상환하면 월 이자 지출이 즉시 감소합니다.</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2">
                    <input
                      type="number"
                      step={1000}
                      min={1000}
                      max={player.bankLoan}
                      value={repayBankAmount}
                      onChange={(e) => setRepayBankAmount(Number(e.target.value))}
                      className="bg-transparent text-stone-800 font-bold text-sm w-full outline-none"
                    />
                    <span className="text-stone-500 text-xs whitespace-nowrap">{formatCurrency(repayBankAmount)}</span>
                  </div>
                  <button
                    onClick={handleRepayBank}
                    disabled={player.bankLoan <= 0 || player.cash < repayBankAmount}
                    className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
                  >
                    상환하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'liabilities' && (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              <p className="text-xs text-stone-400 mb-3">
                부채 전액을 상환하면 해당 부채의 <strong>월 지출이 0원</strong>이 되어 월급날 수취액이 늘어납니다.
              </p>
              {Object.values(player.liabilities).map((item: LiabilityItem) => {
                const isPaid = item.totalAmount <= 0;
                const canAfford = player.cash >= item.totalAmount;
                return (
                  <div key={item.id} className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 ${isPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200'}`}>
                    <div>
                      <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                        <span>{item.name}</span>
                        {isPaid && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-semibold">상환 완료</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                        <span>원금: <strong className="text-stone-600">{formatCurrency(item.totalAmount)}</strong></span>
                        <span>•</span>
                        <span>월 지출: <strong className="text-rose-500">{formatCurrency(item.monthlyExpense)}</strong></span>
                      </div>
                    </div>
                    {!isPaid ? (
                      <button
                        onClick={() => onRepayLiability(item.id)}
                        disabled={!canAfford}
                        className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-colors whitespace-nowrap ${
                          canAfford ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? '전액 상환' : '현금 부족'}
                      </button>
                    ) : (
                      <div className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /><span>완납</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-white hover:bg-stone-100 text-stone-600 text-xs font-semibold rounded-lg border border-stone-200 transition-colors">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
