'use client';

import { useState } from 'react';
import { BOARD_SPACES } from '../data/board';
import { PlayerState, BoardSpace } from '../types';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Building2,
  Building,
  Baby,
  HeartHandshake,
  AlertTriangle,
  Dices,
  Sparkles,
  HelpCircle,
  BookOpen
} from 'lucide-react';

interface BoardViewProps {
  player: PlayerState;
  onRollDice: (diceCount: 1 | 2) => void;
  isRolling: boolean;
  lastDiceRoll: number | null;
  onOpenCurrentSpaceCard: () => void;
}

export function BoardView({
  player,
  onRollDice,
  isRolling,
  lastDiceRoll,
}: BoardViewProps) {
  const [selectedDiceCount, setSelectedDiceCount] = useState<1 | 2>(1);
  const [showRuleTip, setShowRuleTip] = useState(false);

  const getSpaceIcon = (iconName: string) => {
    switch (iconName) {
      case 'DollarSign': return <DollarSign className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5" />;
      case 'Building2': return <Building2 className="w-5 h-5" />;
      case 'Building': return <Building className="w-5 h-5" />;
      case 'Baby': return <Baby className="w-5 h-5" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5" />;
      case 'AlertTriangle': return <AlertTriangle className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  const currentSpace = BOARD_SPACES[player.currentSpaceIndex] || BOARD_SPACES[0];
  const hasCharityBoost = player.charityTurnsLeft > 0;

  const topSpaces = [0, 1, 2, 3].map((idx) => BOARD_SPACES[idx]);
  const bottomSpaces = [6, 7, 8, 9].map((idx) => BOARD_SPACES[idx]).reverse();

  const renderSpaceCard = (space: BoardSpace, orientation: 'top' | 'bottom' | 'side') => {
    const isCurrent = player.currentSpaceIndex === space.index;
    const isPayday = space.type === 'payday';

    return (
      <div
        key={space.index}
        className={`relative rounded-xl border-2 transition-all p-2.5 flex flex-col justify-between select-none ${
          isCurrent
            ? 'border-amber-400 bg-amber-50 shadow-lg ring-2 ring-amber-400 scale-[1.03] z-10'
            : 'border-stone-200 bg-white hover:bg-stone-50'
        } ${orientation === 'side' ? 'min-h-[96px]' : 'min-h-[105px]'}`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold text-stone-400">#{space.index + 1}</span>
          {isPayday && (
            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-extrabold uppercase">
              PAYDAY
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 my-1">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isPayday ? 'bg-emerald-100 text-emerald-700'
            : space.type === 'small_deal' ? 'bg-blue-100 text-blue-700'
            : space.type === 'big_deal' ? 'bg-purple-100 text-purple-700'
            : space.type === 'doodad' ? 'bg-rose-100 text-rose-700'
            : space.type === 'market' ? 'bg-amber-100 text-amber-700'
            : space.type === 'baby' ? 'bg-pink-100 text-pink-700'
            : space.type === 'charity' ? 'bg-indigo-100 text-indigo-700'
            : 'bg-stone-200 text-stone-600'
          }`}>
            {getSpaceIcon(space.icon)}
          </div>
          <div>
            <div className="text-xs font-bold text-stone-800 leading-tight">
              {space.name.split(' ')[0]}
            </div>
            <div className="text-[10px] text-stone-400 truncate">
              {space.name.split(' ')[1] || ''}
            </div>
          </div>
        </div>

        {isCurrent && (
          <div className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-2 py-0.5 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1 animate-bounce">
            <span>MY TOKEN</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider">
            쥐경주(Rat Race) 보드 트랙 (총 12칸)
          </h2>
        </div>
        {hasCharityBoost && (
          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
            <span>자선 효과: 남은 {player.charityTurnsLeft}턴 주사위 2개</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {topSpaces.map((sp) => renderSpaceCard(sp, 'top'))}

        <div className="col-span-4 grid grid-cols-4 gap-2.5 my-1">
          <div className="col-span-1">{renderSpaceCard(BOARD_SPACES[11], 'side')}</div>

          <div className="col-span-2 bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-6 flex flex-col justify-between items-center text-center">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded-full">
                현재 위치
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1.5">
                {currentSpace.name}
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                {currentSpace.description}
              </p>
            </div>

            <div className="my-4 flex flex-col items-center">
              {lastDiceRoll ? (
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-300 text-stone-900 font-black text-2xl flex items-center justify-center shadow-md">
                    {lastDiceRoll}
                  </div>
                  <span className="text-xs text-stone-400">칸 이동 완료!</span>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                  <Dices className="w-6 h-6" />
                </div>
              )}
            </div>

            {hasCharityBoost && (
              <div className="flex items-center gap-2 bg-white border border-stone-200 p-1 rounded-lg mb-3">
                <button
                  onClick={() => setSelectedDiceCount(1)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    selectedDiceCount === 1
                      ? 'bg-indigo-500 text-white'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  주사위 1개
                </button>
                <button
                  onClick={() => setSelectedDiceCount(2)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    selectedDiceCount === 2
                      ? 'bg-indigo-500 text-white'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  주사위 2개
                </button>
              </div>
            )}

            <button
              onClick={() => onRollDice(selectedDiceCount)}
              disabled={isRolling}
              className="w-full max-w-xs py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
              <span>{isRolling ? '주사위 굴리는 중...' : '주사위 굴려 이동'}</span>
            </button>
          </div>

          <div className="col-span-1">{renderSpaceCard(BOARD_SPACES[4], 'side')}</div>
        </div>

        <div className="col-span-4 grid grid-cols-4 gap-2.5">
          <div className="col-span-1">{renderSpaceCard(BOARD_SPACES[10], 'side')}</div>
          <div className="col-span-2 flex items-center justify-center text-center px-4">
            <button
              onClick={() => setShowRuleTip(!showRuleTip)}
              className="flex items-center gap-1 text-stone-400 hover:text-stone-700 text-xs transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>게임 규칙 및 팁</span>
            </button>
          </div>
          <div className="col-span-1">{renderSpaceCard(BOARD_SPACES[5], 'side')}</div>
        </div>

        {bottomSpaces.map((sp) => renderSpaceCard(sp, 'bottom'))}
      </div>

      {showRuleTip && (
        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-xs text-stone-700 leading-relaxed space-y-2">
          <h4 className="font-bold text-stone-800 text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>로버트 기요사키의 캐시플로우 핵심 전략</span>
          </h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>소액 투자(Small Deal)로 종자돈 만들기:</strong> 초반에는 $10~30 저가 주식이나 소형 2방 아파트(ROI 40%+)를 공략하세요.</li>
            <li><strong>시장(Market) 카드로 큰 시세차익 챙기기:</strong> 주가가 폭등하거나 부동산 고가 매수자가 나타날 때 팔아 목돈을 마련하세요.</li>
            <li><strong>대형 투자(Big Deal)로 패시브 인컴 완성하기:</strong> 다세대 아파트나 자동 세차장은 매월 막대한 패시브 인컴을 창출합니다.</li>
            <li><strong>부채 조기 상환:</strong> 학자금, 신용카드 빚을 갚으면 월 총지출이 줄어들어 쥐경주 탈출이 쉬워집니다.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
