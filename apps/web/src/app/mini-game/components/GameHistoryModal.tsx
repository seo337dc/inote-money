'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PROFESSIONS } from '../data/professions';
import { formatCurrency } from '../lib/gameLogic';
import { History, X, Trophy, Flag } from 'lucide-react';

type MiniGameResult = {
  id: string;
  profession: string;
  result: 'WON' | 'GAVE_UP';
  turnCount: number;
  finalCash: number;
  finalPassiveIncome: number;
  finalMonthlyExpenses: number;
  finalMonthlyCashflow: number;
  playedAt: string;
};

interface GameHistoryModalProps {
  onClose: () => void;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function GameHistoryModal({ onClose }: GameHistoryModalProps) {
  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['mini-game-results'],
    queryFn: () => api.get<MiniGameResult[]>('/money/mini-game/results'),
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">내 플레이 기록</h3>
              <p className="text-xs text-stone-400">지금까지 플레이한 쥐경주 탈출 게임 결과예요.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="text-center py-10 text-sm text-stone-400">기록을 불러오는 중...</div>
          )}

          {isError && (
            <div className="text-center py-10 text-sm text-rose-500">기록을 불러오지 못했어요. 다시 시도해주세요.</div>
          )}

          {results && results.length === 0 && (
            <div className="text-center py-10 text-sm text-stone-400">
              아직 플레이 기록이 없어요.
              <br />
              게임을 승리하거나 새 게임을 시작하면 기록이 쌓여요.
            </div>
          )}

          {results && results.length > 0 && (
            <div className="flex flex-col gap-2.5">
              {results.map((r) => {
                const profession = PROFESSIONS.find((p) => p.id === r.profession);
                const won = r.result === 'WON';
                return (
                  <div
                    key={r.id}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                      won ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        won ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-200 text-stone-500'
                      }`}>
                        {won ? <Trophy className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-stone-800">
                          {profession?.nameKo ?? r.profession}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                            won ? 'bg-emerald-500 text-white' : 'bg-stone-300 text-stone-700'
                          }`}>
                            {won ? '탈출 성공' : '중도 포기'}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400">{fmtDate(r.playedAt)} · {r.turnCount}턴</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-stone-800">{formatCurrency(r.finalCash)}</div>
                      <div className="text-[11px] text-blue-500">패시브 {formatCurrency(r.finalPassiveIncome)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
