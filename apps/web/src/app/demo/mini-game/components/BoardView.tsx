'use client';

import { useState, useEffect, useRef } from 'react';
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

const PIP_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 25], [72, 25], [28, 50], [72, 50], [28, 75], [72, 75]],
};

function DiceFace({ value, state }: { value: number; state: 'idle' | 'rolling' | 'result' }) {
  const pips = PIP_POSITIONS[Math.min(6, Math.max(1, value))] || PIP_POSITIONS[1];
  const animClass =
    state === 'rolling'
      ? 'dice-shake'
      : state === 'result'
      ? 'dice-pop'
      : '';

  return (
    <div
      className={`relative w-14 h-14 bg-white rounded-xl border-2 shadow-lg select-none ${
        state === 'rolling'
          ? 'border-amber-400 shadow-amber-200'
          : state === 'result'
          ? 'border-emerald-400 shadow-emerald-100'
          : 'border-stone-300'
      } ${animClass}`}
    >
      {pips.map(([x, y], i) => (
        <div
          key={i}
          className={`absolute rounded-full ${
            state === 'rolling' ? 'bg-amber-600' : 'bg-stone-800'
          }`}
          style={{
            width: '22%',
            height: '22%',
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

interface BoardViewProps {
  player: PlayerState;
  onRollDice: (diceCount: 1 | 2) => void;
  isRolling: boolean;
  isMoving: boolean;
  tokenPosition: number;
  lastDiceRoll: number | null;
  onOpenCurrentSpaceCard: () => void;
}

export function BoardView({
  player,
  onRollDice,
  isRolling,
  isMoving,
  tokenPosition,
  lastDiceRoll,
}: BoardViewProps) {
  const [selectedDiceCount, setSelectedDiceCount] = useState<1 | 2>(1);
  const [showRuleTip, setShowRuleTip] = useState(false);
  const [displayNumbers, setDisplayNumbers] = useState<number[]>([1]);
  const [diceState, setDiceState] = useState<'idle' | 'rolling' | 'result'>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rollingCountRef = useRef<1 | 2>(1);

  const hasCharityBoost = player.charityTurnsLeft > 0;

  useEffect(() => {
    if (isRolling) {
      const count = hasCharityBoost ? selectedDiceCount : 1;
      rollingCountRef.current = count;
      setDiceState('rolling');
      intervalRef.current = setInterval(() => {
        setDisplayNumbers(
          Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1)
        );
      }, 80);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (lastDiceRoll !== null) {
        const count = rollingCountRef.current;
        if (count === 2) {
          const d1 = Math.min(6, Math.max(1, lastDiceRoll - 1));
          const d2 = Math.min(6, Math.max(1, lastDiceRoll - d1));
          setDisplayNumbers([d1, d2]);
        } else {
          setDisplayNumbers([Math.min(6, Math.max(1, lastDiceRoll))]);
        }
        setDiceState('result');
        const t = setTimeout(() => setDiceState('idle'), 1200);
        return () => clearTimeout(t);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRolling, lastDiceRoll]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const currentSpace = BOARD_SPACES[tokenPosition] || BOARD_SPACES[0];

  const topSpaces = [0, 1, 2, 3].map((idx) => BOARD_SPACES[idx]);
  const bottomSpaces = [6, 7, 8, 9].map((idx) => BOARD_SPACES[idx]).reverse();

  const renderSpaceCard = (space: BoardSpace, orientation: 'top' | 'bottom' | 'side') => {
    const isCurrent = tokenPosition === space.index;
    const isPayday = space.type === 'payday';

    return (
      <div
        key={space.index}
        className={`relative rounded-xl border-2 p-2.5 flex flex-col justify-between select-none ${
          isCurrent && isMoving
            ? 'border-blue-400 bg-blue-50 shadow-lg ring-2 ring-blue-400 scale-[1.03] z-10 transition-all duration-150'
            : isCurrent
            ? 'border-amber-400 bg-amber-50 shadow-lg ring-2 ring-amber-400 scale-[1.03] z-10 transition-all'
            : 'border-stone-200 bg-white hover:bg-stone-50 transition-all'
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
          <div className={`absolute -top-3 -right-2 text-white px-2 py-0.5 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1 ${
            isMoving
              ? 'bg-gradient-to-r from-blue-500 to-cyan-400 token-move'
              : 'bg-gradient-to-r from-amber-500 to-yellow-400 animate-bounce'
          }`}>
            <span>{isMoving ? '→' : 'MY TOKEN'}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden">
      <style>{`
        @keyframes dice-shake {
          0%   { transform: rotate(0deg) scale(1); }
          10%  { transform: rotate(-12deg) scale(1.08); }
          20%  { transform: rotate(12deg) scale(1.08); }
          30%  { transform: rotate(-9deg) scale(1.05); }
          40%  { transform: rotate(9deg) scale(1.05); }
          50%  { transform: rotate(-6deg) scale(1.03); }
          60%  { transform: rotate(6deg) scale(1.03); }
          70%  { transform: rotate(-3deg) scale(1.01); }
          80%  { transform: rotate(3deg) scale(1.01); }
          90%  { transform: rotate(-1deg) scale(1); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes dice-pop {
          0%   { transform: scale(0.6) rotate(-8deg); opacity: 0.4; }
          50%  { transform: scale(1.2) rotate(4deg); opacity: 1; }
          75%  { transform: scale(0.92) rotate(-2deg); }
          90%  { transform: scale(1.04) rotate(1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .dice-shake {
          animation: dice-shake 0.12s ease-in-out infinite;
        }
        .dice-pop {
          animation: dice-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes token-move {
          0%   { transform: translateY(0) scale(1); }
          30%  { transform: translateY(-4px) scale(1.15); }
          60%  { transform: translateY(1px) scale(0.95); }
          100% { transform: translateY(0) scale(1); }
        }
        .token-move {
          animation: token-move 0.18s ease-out;
        }
      `}</style>
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

            <div className="my-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                {isRolling || lastDiceRoll ? (
                  displayNumbers.map((num, i) => (
                    <DiceFace key={i} value={num} state={diceState} />
                  ))
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-stone-100 border-2 border-stone-200 flex items-center justify-center text-stone-300">
                    <Dices className="w-7 h-7" />
                  </div>
                )}
              </div>
              {!isRolling && lastDiceRoll && (
                <span className="text-[11px] text-stone-400 font-medium">
                  합계 <strong className="text-amber-600">{lastDiceRoll}</strong>칸 이동!
                </span>
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
              disabled={isRolling || isMoving}
              className="w-full max-w-xs py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
              <span>
                {isRolling ? '주사위 굴리는 중...' : isMoving ? '이동 중...' : '주사위 굴려 이동'}
              </span>
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
