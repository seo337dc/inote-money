'use client';

import { PlayerState } from '../types';
import { calculatePassiveIncome, calculateTotalExpenses, formatCurrency } from '../lib/gameLogic';
import { Award, Trophy, TrendingUp, DollarSign, RotateCcw } from 'lucide-react';

interface VictoryModalProps {
  player: PlayerState;
  onContinue: () => void;
  onRestart: () => void;
}

export function VictoryModal({ player, onContinue, onRestart }: VictoryModalProps) {
  const passiveIncome = calculatePassiveIncome(player);
  const totalExpenses = calculateTotalExpenses(player);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white border-2 border-amber-300 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-300/40 animate-bounce">
          <Trophy className="w-10 h-10 text-white" />
        </div>

        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
          축하합니다! (CONGRATULATIONS!)
        </div>

        <h2 className="text-3xl font-extrabold text-stone-900 mb-3">
          쥐경주(Rat Race) 탈출 성공!
        </h2>

        <p className="text-sm text-stone-500 leading-relaxed mb-6">
          <strong>{player.profession.nameKo}({player.profession.name})</strong> 직업으로
          단 <strong>{player.turnCount}턴</strong> 만에 패시브 인컴이 월 총지출을 초과했습니다!
          이제 경제적 자유를 달성하고 Fast Track 진입 자격을 획득했습니다.
        </p>

        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 mb-6 grid grid-cols-2 gap-4 text-left">
          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <div className="text-xs text-stone-400 mb-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              <span>최종 패시브 인컴</span>
            </div>
            <div className="text-xl font-bold text-blue-600">{formatCurrency(passiveIncome)}/월</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <div className="text-xs text-stone-400 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span>최종 보유 현금</span>
            </div>
            <div className="text-xl font-bold text-emerald-600">{formatCurrency(player.cash)}</div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-6 text-xs text-emerald-700">
          탈출 기준: 패시브 인컴 {formatCurrency(passiveIncome)} &gt; 총 지출 {formatCurrency(totalExpenses)}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onContinue}
            className="flex-1 px-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Award className="w-5 h-5" />
            <span>Fast Track 계속 즐기기</span>
          </button>
          <button
            onClick={onRestart}
            className="px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다른 직업으로 재도전</span>
          </button>
        </div>
      </div>
    </div>
  );
}
