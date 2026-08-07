'use client';

import { PlayerState } from '../types';
import {
  calculatePassiveIncome,
  calculateTotalExpenses,
  calculateMonthlyCashflow,
  formatCurrency,
  checkHasEscapedRatRace
} from '../lib/gameLogic';
import { DollarSign, TrendingUp, Award, Wallet, Building2, RotateCcw, History } from 'lucide-react';

interface GameHeaderProps {
  player: PlayerState;
  onOpenBank: () => void;
  onOpenStatement: () => void;
  onResetGame: () => void;
  onOpenHistory?: () => void;
}

export function GameHeader({ player, onOpenBank, onOpenStatement, onResetGame, onOpenHistory }: GameHeaderProps) {
  const passiveIncome = calculatePassiveIncome(player);
  const totalExpenses = calculateTotalExpenses(player);
  const monthlyCashflow = calculateMonthlyCashflow(player);
  const progressPercent = Math.min(100, Math.round((passiveIncome / totalExpenses) * 100));
  const isEscaped = checkHasEscapedRatRace(player);

  return (
    <header className="bg-white text-stone-800 border-b border-stone-200 shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm font-black text-xl text-white">
            CF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-stone-900 flex items-center gap-1.5">
                CASHFLOW{' '}
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                  쥐경주 탈출
                </span>
              </h1>
              {isEscaped && (
                <span className="bg-amber-400 text-stone-900 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                  <Award className="w-3.5 h-3.5" /> Fast Track 달성
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 flex items-center gap-2">
              <span>직업: <strong className="text-stone-700">{player.profession.nameKo} ({player.profession.name})</strong></span>
              <span>•</span>
              <span>진행 턴: <strong className="text-stone-700">{player.turnCount}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 bg-stone-50 rounded-xl px-4 py-2 border border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider font-medium">보유 현금</div>
              <div className="font-bold text-emerald-600 text-base sm:text-lg">
                {formatCurrency(player.cash)}
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-stone-200 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider font-medium">패시브 인컴 / 총지출</div>
              <div className="font-semibold text-sm flex items-center gap-1">
                <span className="text-blue-600 font-bold">{formatCurrency(passiveIncome)}</span>
                <span className="text-stone-300">/</span>
                <span className="text-stone-600">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-stone-200 hidden md:block" />

          <div className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider font-medium">월 잉여현금 (Payday)</div>
              <div className={`font-bold text-base ${monthlyCashflow >= 0 ? 'text-amber-600' : 'text-rose-500'}`}>
                {monthlyCashflow >= 0 ? `+${formatCurrency(monthlyCashflow)}` : formatCurrency(monthlyCashflow)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="hidden lg:flex flex-col w-36">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-stone-500">쥐경주 탈출률</span>
            <span className="text-emerald-600">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={onOpenBank}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 rounded-lg border border-stone-200 transition-colors text-xs font-medium"
          >
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span>은행 대출/상환</span>
          </button>

          <button
            onClick={onOpenStatement}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-xs shadow-sm transition-all"
          >
            <span>재무제표</span>
          </button>

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="p-2 bg-white hover:bg-stone-50 text-stone-400 hover:text-stone-700 rounded-lg border border-stone-200 transition-colors"
              title="내 플레이 기록"
            >
              <History className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onResetGame}
            className="p-2 bg-white hover:bg-stone-50 text-stone-400 hover:text-stone-700 rounded-lg border border-stone-200 transition-colors"
            title="직업 변경 / 새 게임"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>
    </header>
  );
}
