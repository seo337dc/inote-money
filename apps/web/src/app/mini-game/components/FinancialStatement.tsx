'use client';

import { useState } from 'react';
import { PlayerState, LiabilityItem } from '../types';
import {
  calculatePassiveIncome,
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateMonthlyCashflow,
  formatCurrency
} from '../lib/gameLogic';
import { FileText, X, TrendingUp, TrendingDown, DollarSign, Building2, Clock } from 'lucide-react';

interface FinancialStatementProps {
  player: PlayerState;
  onClose: () => void;
  onOpenBankModal: () => void;
}

export function FinancialStatement({ player, onClose, onOpenBankModal }: FinancialStatementProps) {
  const [activeTab, setActiveTab] = useState<'income_expense' | 'assets_liabilities' | 'logs'>('income_expense');

  const passiveIncome = calculatePassiveIncome(player);
  const totalIncome = calculateTotalIncome(player);
  const totalExpenses = calculateTotalExpenses(player);
  const monthlyCashflow = calculateMonthlyCashflow(player);

  const bankLoanInterest = Math.round((player.bankLoan / 1000) * 100);
  const childExpenses = player.childrenCount * player.profession.childCostPerChild;

  const tabClass = (tab: string) =>
    `flex-1 py-3 text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
      activeTab === tab
        ? 'border-emerald-500 text-emerald-600 bg-emerald-50/60'
        : 'border-transparent text-stone-400 hover:text-stone-700'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden">
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                재무제표 (Financial Statement) —{' '}
                <span className="text-emerald-600">{player.profession.nameKo}</span>
              </h3>
              <p className="text-xs text-stone-400">
                수입, 지출, 자산 및 부채를 한눈에 파악하고 패시브 인컴 목표를 관리하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-stone-200 bg-white">
          <button onClick={() => setActiveTab('income_expense')} className={tabClass('income_expense')}>
            <TrendingUp className="w-4 h-4" /><span>수입 및 지출 계산서</span>
          </button>
          <button onClick={() => setActiveTab('assets_liabilities')} className={tabClass('assets_liabilities')}>
            <Building2 className="w-4 h-4" /><span>자산 및 부채 현황</span>
          </button>
          <button onClick={() => setActiveTab('logs')} className={tabClass('logs')}>
            <Clock className="w-4 h-4" /><span>활동 기록 ({player.gameLogs.length})</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'income_expense' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-3">
                    <h4 className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /><span>수입 (Income Statement)</span>
                    </h4>
                    <span className="text-xs font-bold text-stone-700 bg-emerald-100 px-2 py-0.5 rounded">
                      총 수입: {formatCurrency(totalIncome)}/월
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-stone-100">
                      <span className="text-stone-600 font-medium">월급 (Salary)</span>
                      <span className="text-stone-900 font-bold">${player.profession.salary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-blue-600 font-semibold">패시브 인컴 (Passive Income)</span>
                      <span className="text-blue-600 font-bold">${passiveIncome.toLocaleString()}</span>
                    </div>
                    <div className="pl-3 space-y-1 text-stone-400 border-l-2 border-stone-200">
                      <div className="text-[11px] font-semibold text-stone-400">주식 배당금</div>
                      {player.stocks.filter((s) => s.dividendPerShare > 0).length === 0 ? (
                        <div className="text-stone-300 italic">배당 주식 없음</div>
                      ) : (
                        player.stocks.filter((s) => s.dividendPerShare > 0).map((stock) => (
                          <div key={stock.id} className="flex justify-between">
                            <span>{stock.name} ({stock.symbol} {stock.shares}주)</span>
                            <span className="text-stone-600">+${(stock.shares * stock.dividendPerShare).toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="pl-3 space-y-1 text-stone-400 border-l-2 border-stone-200">
                      <div className="text-[11px] font-semibold text-stone-400">부동산 및 사업체 수익</div>
                      {player.realEstates.length === 0 ? (
                        <div className="text-stone-300 italic">부동산 / 사업체 없음</div>
                      ) : (
                        player.realEstates.map((re) => (
                          <div key={re.id} className="flex justify-between">
                            <span className="truncate max-w-[180px]">{re.name}</span>
                            <span className="text-stone-600">+${re.cashflow.toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-200 bg-white p-3 rounded-lg flex justify-between items-center">
                  <span className="text-xs text-stone-500">쥐경주 탈출 기준:</span>
                  <span className="text-xs font-bold text-emerald-600">
                    패시브 인컴 &gt; 총 지출 ({formatCurrency(passiveIncome)} / {formatCurrency(totalExpenses)})
                  </span>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-3">
                  <h4 className="text-sm font-bold text-rose-500 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" /><span>지출 (Expense Statement)</span>
                  </h4>
                  <span className="text-xs font-bold text-stone-700 bg-rose-100 px-2 py-0.5 rounded">
                    총 지출: {formatCurrency(totalExpenses)}/월
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-stone-100 text-stone-600">
                    <span>세금 (Taxes)</span>
                    <span className="font-semibold">${player.profession.taxes.toLocaleString()}</span>
                  </div>
                  {Object.values(player.liabilities).map((liab: LiabilityItem) => (
                    <div key={liab.id} className={`flex justify-between py-1 border-b border-stone-100 ${liab.monthlyExpense === 0 ? 'text-stone-300 line-through' : 'text-stone-600'}`}>
                      <span>{liab.name}</span>
                      <span className="font-semibold">${liab.monthlyExpense.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1 border-b border-stone-100 text-stone-600">
                    <span>자녀 양육비 (아이 {player.childrenCount}명)</span>
                    <span className="font-semibold">${childExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100 text-stone-600">
                    <span>은행 대출 이자 (월 10% 이자율)</span>
                    <span className="font-semibold">${bankLoanInterest.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-stone-600">
                    <span>기타 생활비 (Other Expenses)</span>
                    <span className="font-semibold">${player.profession.otherExpenses.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-6 p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-stone-400">월 잉여현금 (Payday)</div>
                    <div className="text-xs text-stone-400">총 수입 - 총 지출</div>
                  </div>
                  <div className={`text-lg font-bold ${monthlyCashflow >= 0 ? 'text-amber-600' : 'text-rose-500'}`}>
                    {monthlyCashflow >= 0 ? `+${formatCurrency(monthlyCashflow)}` : formatCurrency(monthlyCashflow)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets_liabilities' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <h4 className="text-sm font-bold text-emerald-600 mb-3 border-b border-stone-200 pb-2 flex items-center justify-between">
                  <span>보유 자산 (Assets)</span>
                  <span className="text-xs text-stone-400 font-normal">주식 {player.stocks.length}종목 | 부동산/사업체 {player.realEstates.length}건</span>
                </h4>
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {player.stocks.length === 0 && player.realEstates.length === 0 ? (
                    <div className="text-center py-8 text-stone-400 text-xs">
                      아직 보유한 자산이 없습니다. 소액/대형 투자 칸에서 자산을 매수하세요!
                    </div>
                  ) : (
                    <>
                      {player.stocks.map((stock) => (
                        <div key={stock.id} className="bg-white p-3 rounded-lg border border-stone-200 text-xs flex justify-between items-center">
                          <div>
                            <div className="font-bold text-stone-900 text-sm">{stock.symbol} — {stock.name}</div>
                            <div className="text-stone-400 mt-0.5">보유: <strong className="text-stone-600">{stock.shares}주</strong> (매수가: ${stock.costPerShare})</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] text-stone-400">월 배당금</div>
                            <div className="text-emerald-600 font-bold">+${(stock.shares * stock.dividendPerShare).toLocaleString()}/월</div>
                          </div>
                        </div>
                      ))}
                      {player.realEstates.map((re) => (
                        <div key={re.id} className="bg-white p-3 rounded-lg border border-stone-200 text-xs flex justify-between items-center">
                          <div>
                            <div className="font-bold text-stone-900 text-sm">{re.name}</div>
                            <div className="text-stone-400 mt-0.5">총 가격: ${re.cost.toLocaleString()} (대출금: ${re.mortgage.toLocaleString()})</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] text-stone-400">월 현금흐름</div>
                            <div className="text-emerald-600 font-bold">+${re.cashflow.toLocaleString()}/월</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
                  <h4 className="text-sm font-bold text-rose-500">부채 (Liabilities)</h4>
                  <button onClick={onOpenBankModal} className="text-xs text-blue-500 hover:text-blue-600 font-semibold underline">
                    부채 상환 / 대출 관리
                  </button>
                </div>
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-stone-200 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-stone-900">은행 대출 (Bank Loan)</div>
                      <div className="text-stone-400 mt-0.5">10% 월 이자 발생</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-600 font-bold">${player.bankLoan.toLocaleString()}</div>
                      <div className="text-rose-500">이자: ${bankLoanInterest.toLocaleString()}/월</div>
                    </div>
                  </div>
                  {Object.values(player.liabilities).map((liab: LiabilityItem) => {
                    const isPaid = liab.totalAmount <= 0;
                    return (
                      <div key={liab.id} className={`p-3 rounded-lg border flex justify-between items-center ${isPaid ? 'bg-emerald-50 border-emerald-200 opacity-70' : 'bg-white border-stone-200'}`}>
                        <div>
                          <div className="font-bold text-stone-900 flex items-center gap-1.5">
                            <span>{liab.name}</span>
                            {isPaid && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">상환완료</span>}
                          </div>
                          <div className="text-stone-400 mt-0.5">원금: ${liab.totalAmount.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-stone-700 font-semibold">${liab.totalAmount.toLocaleString()}</div>
                          <div className="text-rose-500">월 지출: ${liab.monthlyExpense.toLocaleString()}/월</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {player.gameLogs.slice().reverse().map((log) => (
                <div key={log.id} className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                  log.type === 'payday' ? 'bg-emerald-50 border-emerald-200'
                  : log.type === 'deal' ? 'bg-blue-50 border-blue-200'
                  : log.type === 'doodad' ? 'bg-rose-50 border-rose-200'
                  : 'bg-stone-50 border-stone-200'
                }`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 bg-stone-200 text-stone-600 rounded font-semibold text-[10px]">턴 #{log.turn}</span>
                      <span className="text-stone-400 text-[11px]">{log.timestamp}</span>
                    </div>
                    <div className="text-stone-700 leading-relaxed">{log.message}</div>
                  </div>
                  {log.amount !== undefined && (
                    <div className={`font-bold whitespace-nowrap text-sm ${log.amount >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {formatCurrency(log.amount)}
                    </div>
                  )}
                </div>
              ))}
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
