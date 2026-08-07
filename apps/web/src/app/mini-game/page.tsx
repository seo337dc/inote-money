'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

type FloatItem = { id: string; amount: number; offsetX: number };

function FloatingMoneyItem({ item, fmt }: { item: FloatItem; fmt: (n: number) => string }) {
  const isPos = item.amount > 0;
  return (
    <div
      className={`float-money pointer-events-none select-none text-base font-black drop-shadow-md ${
        isPos ? 'text-emerald-500' : 'text-rose-500'
      }`}
      style={{ '--fx': `${item.offsetX}px` } as React.CSSProperties}
    >
      {isPos ? '+' : '-'}{fmt(Math.abs(item.amount))}
    </div>
  );
}
import { PlayerState, DealCard, DoodadCard, MarketCard, Profession } from './types';
import { PROFESSIONS } from './data/professions';
import { BOARD_SPACES } from './data/board';
import { SMALL_DEAL_CARDS, BIG_DEAL_CARDS, DOODAD_CARDS, MARKET_CARDS } from './data/cards';
import {
  createInitialPlayerState,
  calculateMonthlyCashflow,
  checkHasEscapedRatRace,
  formatCurrency,
  calculatePassiveIncome,
  calculateTotalIncome,
  calculateTotalExpenses,
} from './lib/gameLogic';
import { GameHeader } from './components/GameHeader';
import { BoardView } from './components/BoardView';
import { ProfessionSelectModal } from './components/ProfessionSelectModal';
import { BankModal } from './components/BankModal';
import { FinancialStatement } from './components/FinancialStatement';
import { CardModal } from './components/CardModal';
import { VictoryModal } from './components/VictoryModal';
import { GameHistoryModal } from './components/GameHistoryModal';
import { TrendingUp } from 'lucide-react';

export default function MiniGamePage() {
  const [player, setPlayer] = useState<PlayerState>(() =>
    createInitialPlayerState(PROFESSIONS[1])
  );
  const savedResultRef = useRef(false);

  const [showProfessionModal, setShowProfessionModal] = useState<boolean>(true);
  const [showBankModal, setShowBankModal] = useState<boolean>(false);
  const [showStatementModal, setShowStatementModal] = useState<boolean>(false);
  const [showCardModal, setShowCardModal] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  const [currentCardData, setCurrentCardData] = useState<DealCard | DoodadCard | MarketCard | null>(null);
  const [lastDiceRoll, setLastDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [tokenPosition, setTokenPosition] = useState<number>(0);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [floatingAmounts, setFloatingAmounts] = useState<FloatItem[]>([]);

  const addFloat = useCallback((amount: number) => {
    if (amount === 0) return;
    const id = `float_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const offsetX = Math.floor(Math.random() * 80 - 40);
    setFloatingAmounts((prev) => [...prev, { id, amount, offsetX }]);
    setTimeout(() => setFloatingAmounts((prev) => prev.filter((f) => f.id !== id)), 1800);
  }, []);

  const saveResult = useCallback((result: 'WON' | 'GAVE_UP', p: PlayerState) => {
    const liabilityList = Object.values(p.liabilities);
    api.post('/money/mini-game/results', {
      profession: p.profession.id,
      result,
      turnCount: p.turnCount,
      finalCash: Math.round(p.cash),
      finalPassiveIncome: Math.round(calculatePassiveIncome(p)),
      finalMonthlyExpenses: Math.round(calculateTotalExpenses(p)),
      finalMonthlyCashflow: Math.round(calculateMonthlyCashflow(p)),
      bankLoan: Math.round(p.bankLoan),
      totalLiabilities: Math.round(liabilityList.reduce((sum, l) => sum + l.totalAmount, 0)),
      stocksCount: p.stocks.length,
      realEstatesCount: p.realEstates.length,
      childrenCount: p.childrenCount,
      finalStocks: p.stocks,
      finalRealEstates: p.realEstates,
      liabilitiesSnapshot: liabilityList,
      gameLogs: p.gameLogs,
    }).catch(() => {
      // 결과 저장 실패는 게임 진행에 영향 주지 않음
    });
  }, []);

  useEffect(() => {
    if (player.hasWon && !savedResultRef.current) {
      savedResultRef.current = true;
      saveResult('WON', player);
    }
  }, [player, saveResult]);

  const handleSelectProfession = (profession: Profession) => {
    if (player.turnCount > 0 && !player.hasWon) {
      saveResult('GAVE_UP', player);
    }
    savedResultRef.current = false;
    setPlayer(createInitialPlayerState(profession));
    setShowProfessionModal(false);
    setShowVictoryModal(false);
    setShowCardModal(false);
    setLastDiceRoll(null);
    setTokenPosition(0);
    setIsMoving(false);
  };

  const handleRollDice = (diceCount: 1 | 2 = 1) => {
    if (isRolling || isMoving) return;
    setIsRolling(true);

    if (player.downsizedTurnsLeft > 0) {
      setTimeout(() => {
        setIsRolling(false);
        setPlayer((prev) => ({
          ...prev,
          downsizedTurnsLeft: prev.downsizedTurnsLeft - 1,
          turnCount: prev.turnCount + 1,
          gameLogs: [
            ...prev.gameLogs,
            {
              id: `downsized_skip_${Date.now()}`,
              turn: prev.turnCount + 1,
              message: `실직 상태로 인해 턴을 쉬었습니다. (남은 실직 턴: ${prev.downsizedTurnsLeft - 1}턴)`,
              type: 'info',
              timestamp: new Date().toLocaleTimeString()
            }
          ]
        }));
      }, 500);
      return;
    }

    const capturedOldIdx = player.currentSpaceIndex;

    setTimeout(() => {
      let roll = Math.floor(Math.random() * 6) + 1;
      if (diceCount === 2) {
        roll += Math.floor(Math.random() * 6) + 1;
      }
      setLastDiceRoll(roll);
      setIsRolling(false);

      // Animate token moving step by step (200ms per space)
      setIsMoving(true);
      let step = 0;
      const totalRoll = roll;

      const moveTimer = setInterval(() => {
        step++;
        const stepIdx = (capturedOldIdx + step) % BOARD_SPACES.length;
        setTokenPosition(stepIdx);

        if (step >= totalRoll) {
          clearInterval(moveTimer);
          const newIdx = stepIdx;

          // Pre-calculate payday for float trigger (uses player captured at roll time)
          let paydayCountForFloat = 0;
          for (let s = 1; s <= totalRoll; s++) {
            const checkIdx = (capturedOldIdx + s) % BOARD_SPACES.length;
            if (checkIdx === 0 || checkIdx === 6) paydayCountForFloat++;
          }
          if (paydayCountForFloat > 0) {
            const floatEarned = calculateMonthlyCashflow(player) * paydayCountForFloat;
            setTimeout(() => addFloat(floatEarned), 50);
          }

          setPlayer((prev) => {
            let paydayCount = 0;
            for (let s = 1; s <= totalRoll; s++) {
              const checkIdx = (capturedOldIdx + s) % BOARD_SPACES.length;
              if (checkIdx === 0 || checkIdx === 6) paydayCount++;
            }

            const monthlyCashflow = calculateMonthlyCashflow(prev);
            const paydayEarned = monthlyCashflow * paydayCount;
            const newCash = prev.cash + paydayEarned;

            const updatedLogs = [...prev.gameLogs];
            if (paydayCount > 0) {
              updatedLogs.push({
                id: `payday_pass_${Date.now()}`,
                turn: prev.turnCount + 1,
                message: `월급날(Payday) ${paydayCount}회 통과! 월 잉여현금 ${formatCurrency(paydayEarned)}가 지급되었습니다.`,
                type: 'payday',
                amount: paydayEarned,
                timestamp: new Date().toLocaleTimeString()
              });
            }

            const newCharityTurns = Math.max(0, prev.charityTurnsLeft - 1);
            const newSpace = BOARD_SPACES[newIdx];
            updatedLogs.push({
              id: `move_${Date.now()}`,
              turn: prev.turnCount + 1,
              message: `주사위 ${totalRoll}이(가) 나와 '${newSpace.name}' 칸으로 이동했습니다.`,
              type: 'info',
              timestamp: new Date().toLocaleTimeString()
            });

            return {
              ...prev,
              cash: newCash,
              currentSpaceIndex: newIdx,
              charityTurnsLeft: newCharityTurns,
              turnCount: prev.turnCount + 1,
              gameLogs: updatedLogs
            };
          });

          // Brief pause at destination, then trigger card
          setTimeout(() => {
            setIsMoving(false);
            setTimeout(() => {
              triggerSpaceEvent(BOARD_SPACES[newIdx].type);
            }, 400);
          }, 300);
        }
      }, 200);
    }, 450);
  };

  const triggerSpaceEvent = (spaceType: string) => {
    if (spaceType === 'small_deal') {
      setCurrentCardData(SMALL_DEAL_CARDS[Math.floor(Math.random() * SMALL_DEAL_CARDS.length)]);
    } else if (spaceType === 'big_deal') {
      setCurrentCardData(BIG_DEAL_CARDS[Math.floor(Math.random() * BIG_DEAL_CARDS.length)]);
    } else if (spaceType === 'doodad') {
      setCurrentCardData(DOODAD_CARDS[Math.floor(Math.random() * DOODAD_CARDS.length)]);
    } else if (spaceType === 'market') {
      setCurrentCardData(MARKET_CARDS[Math.floor(Math.random() * MARKET_CARDS.length)]);
    } else {
      setCurrentCardData(null);
    }
    setShowCardModal(true);
  };

  const handleBuyDeal = (card: DealCard, shares: number = 100) => {
    setPlayer((prev) => {
      let newCash = prev.cash;
      let updatedStocks = [...prev.stocks];
      let updatedRealEstates = [...prev.realEstates];
      let logMessage = '';

      if (card.assetType === 'stock') {
        const totalCost = shares * card.cost;
        if (newCash < totalCost) { alert('현금이 부족합니다.'); return prev; }
        newCash -= totalCost;

        const existingIdx = updatedStocks.findIndex((s) => s.symbol === card.symbol);
        if (existingIdx >= 0) {
          updatedStocks[existingIdx] = { ...updatedStocks[existingIdx], shares: updatedStocks[existingIdx].shares + shares };
        } else {
          updatedStocks.push({
            id: `stock_${card.symbol}_${Date.now()}`,
            symbol: card.symbol || 'STK',
            name: card.title,
            costPerShare: card.cost,
            shares,
            dividendPerShare: card.cashflow
          });
        }
        logMessage = `${card.symbol} 주식 ${shares}주를 총 ${formatCurrency(shares * card.cost)}에 매수했습니다.`;
      } else {
        const downPayment = card.downPayment;
        if (newCash < downPayment) { alert('초기 투자금이 부족합니다.'); return prev; }
        newCash -= downPayment;

        let reType: 'condo' | 'house' | 'duplex' | '4plex' | '8plex' | 'apartment' | 'business' = 'condo';
        if (card.title.includes('House')) reType = 'house';
        if (card.title.includes('Duplex')) reType = 'duplex';
        if (card.title.includes('4-Plex') || card.title.includes('4세대')) reType = '4plex';
        if (card.title.includes('8-Unit') || card.title.includes('8세대')) reType = '8plex';
        if (card.title.includes('24-Unit') || card.title.includes('24세대')) reType = 'apartment';
        if (card.assetType === 'business') reType = 'business';

        updatedRealEstates.push({
          id: `re_${Date.now()}`,
          name: card.title,
          type: reType,
          cost: card.cost,
          downPayment: card.downPayment,
          mortgage: card.mortgage,
          cashflow: card.cashflow,
          roi: card.roi || 30
        });

        logMessage = `'${card.title}' 자산을 매수했습니다! (월 패시브 인컴 +${formatCurrency(card.cashflow)})`;
      }

      const newState: PlayerState = {
        ...prev,
        cash: newCash,
        stocks: updatedStocks,
        realEstates: updatedRealEstates,
        gameLogs: [
          ...prev.gameLogs,
          { id: `buy_${Date.now()}`, turn: prev.turnCount, message: logMessage, type: 'deal', timestamp: new Date().toLocaleTimeString() }
        ]
      };

      if (checkHasEscapedRatRace(newState)) {
        newState.hasWon = true;
        setTimeout(() => setShowVictoryModal(true), 300);
      }

      return newState;
    });

    // Float for buy: negative (stock total cost or real-estate downpayment)
    const floatCost = card.assetType === 'stock'
      ? -(shares * card.cost)
      : -card.downPayment;
    addFloat(floatCost);
    setShowCardModal(false);
  };

  const handlePayDoodad = (card: DoodadCard) => {
    addFloat(-card.cost);
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash - card.cost,
      gameLogs: [
        ...prev.gameLogs,
        {
          id: `doodad_${Date.now()}`, turn: prev.turnCount,
          message: `'${card.title}' 사치/지출로 인해 $${card.cost.toLocaleString()}를 지불했습니다.`,
          type: 'doodad', amount: -card.cost, timestamp: new Date().toLocaleTimeString()
        }
      ]
    }));
    setShowCardModal(false);
  };

  const handleSellMarket = (card: MarketCard) => {
    setPlayer((prev) => {
      let newCash = prev.cash;
      let updatedStocks = [...prev.stocks];
      let updatedRealEstates = [...prev.realEstates];
      let profitMessage = '';

      if (card.targetType === 'stock') {
        const symbol = card.targetSymbol;
        const targetStock = prev.stocks.find((s) => s.symbol === symbol);
        if (!targetStock || targetStock.shares === 0) return prev;

        const offerPrice = card.offerPricePerShare || 0;
        const totalSellValue = targetStock.shares * offerPrice;
        const totalCost = targetStock.shares * targetStock.costPerShare;
        const profit = totalSellValue - totalCost;

        newCash += totalSellValue;
        updatedStocks = prev.stocks.filter((s) => s.symbol !== symbol);
        profitMessage = `보유 중이던 ${symbol} 주식 ${targetStock.shares}주를 총 ${formatCurrency(totalSellValue)}(차익 +${formatCurrency(profit)})에 전량 매각했습니다!`;
      } else {
        const targetTypes = card.targetPropertyType || [];
        const matchingProps = prev.realEstates.filter((re) => targetTypes.includes(re.type));
        if (matchingProps.length === 0) return prev;

        let totalReceived = 0;
        matchingProps.forEach((re) => {
          let salePrice = card.offerFixedPrice
            ? card.offerFixedPrice
            : Math.round(re.cost * (card.offerMultiplier || 1.3));
          const netProceeds = salePrice - re.mortgage;
          totalReceived += netProceeds;
        });

        newCash += totalReceived;
        updatedRealEstates = prev.realEstates.filter((re) => !targetTypes.includes(re.type));
        profitMessage = `${matchingProps.length}건의 부동산을 시장 호가에 매각하여 순 현금 ${formatCurrency(totalReceived)}를 수취했습니다!`;
      }

      return {
        ...prev,
        cash: newCash,
        stocks: updatedStocks,
        realEstates: updatedRealEstates,
        gameLogs: [
          ...prev.gameLogs,
          { id: `sell_market_${Date.now()}`, turn: prev.turnCount, message: profitMessage, type: 'market', timestamp: new Date().toLocaleTimeString() }
        ]
      };
    });
    // Float for sell market: pre-calculate from current player state
    if (card.targetType === 'stock') {
      const targetStock = player.stocks.find((s) => s.symbol === card.targetSymbol);
      if (targetStock) addFloat(targetStock.shares * (card.offerPricePerShare || 0));
    } else {
      const targetTypes = card.targetPropertyType || [];
      const matching = player.realEstates.filter((re) => targetTypes.includes(re.type));
      const totalNet = matching.reduce((sum, re) => {
        const price = card.offerFixedPrice ?? Math.round(re.cost * (card.offerMultiplier ?? 1.3));
        return sum + (price - re.mortgage);
      }, 0);
      if (totalNet > 0) addFloat(totalNet);
    }
    setShowCardModal(false);
  };

  const handleAcceptBaby = () => {
    setPlayer((prev) => {
      if (prev.childrenCount >= 3) return prev;
      const newCount = prev.childrenCount + 1;
      return {
        ...prev,
        childrenCount: newCount,
        gameLogs: [
          ...prev.gameLogs,
          {
            id: `baby_${Date.now()}`, turn: prev.turnCount,
            message: `자녀가 태어나 자녀 수가 ${newCount}명이 되었습니다. (월 양육비 +${formatCurrency(prev.profession.childCostPerChild)})`,
            type: 'info', timestamp: new Date().toLocaleTimeString()
          }
        ]
      };
    });
    setShowCardModal(false);
  };

  const handleAcceptCharity = () => {
    setPlayer((prev) => {
      const donation = Math.round(calculateTotalIncome(prev) * 0.1);
      if (prev.cash < donation) { alert('기부할 현금이 부족합니다.'); return prev; }
      return {
        ...prev,
        cash: prev.cash - donation,
        charityTurnsLeft: 3,
        gameLogs: [
          ...prev.gameLogs,
          {
            id: `charity_${Date.now()}`, turn: prev.turnCount,
            message: `총 수입의 10%($${donation.toLocaleString()})를 기부하여 3턴 동안 주사위 2개를 선택할 수 있는 축복을 받았습니다!`,
            type: 'info', timestamp: new Date().toLocaleTimeString()
          }
        ]
      };
    });
    setShowCardModal(false);
  };

  const handleBorrow = (amount: number) => {
    addFloat(amount);
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash + amount,
      bankLoan: prev.bankLoan + amount,
      gameLogs: [
        ...prev.gameLogs,
        {
          id: `borrow_${Date.now()}`, turn: prev.turnCount,
          message: `은행에서 ${formatCurrency(amount)}를 대출받았습니다. (월 이자 +${formatCurrency(amount / 10)}/월 증가)`,
          type: 'info', timestamp: new Date().toLocaleTimeString()
        }
      ]
    }));
  };

  const handleRepayBankLoan = (amount: number) => {
    addFloat(-amount);
    setPlayer((prev) => {
      const newState: PlayerState = {
        ...prev,
        cash: prev.cash - amount,
        bankLoan: prev.bankLoan - amount,
        gameLogs: [
          ...prev.gameLogs,
          {
            id: `repay_bank_${Date.now()}`, turn: prev.turnCount,
            message: `은행 대출금 ${formatCurrency(amount)}를 상환했습니다! (월 이자 -${formatCurrency(amount / 10)}/월 감소)`,
            type: 'repay', timestamp: new Date().toLocaleTimeString()
          }
        ]
      };
      if (checkHasEscapedRatRace(newState)) {
        newState.hasWon = true;
        setTimeout(() => setShowVictoryModal(true), 300);
      }
      return newState;
    });
  };

  const handleRepayLiability = (liabilityId: string) => {
    const liab = player.liabilities[liabilityId];
    if (liab && player.cash >= liab.totalAmount) addFloat(-liab.totalAmount);
    setPlayer((prev) => {
      const liab = prev.liabilities[liabilityId];
      if (!liab || prev.cash < liab.totalAmount) return prev;

      const newLiabs = {
        ...prev.liabilities,
        [liabilityId]: { ...liab, totalAmount: 0, monthlyExpense: 0 }
      };

      const newState: PlayerState = {
        ...prev,
        cash: prev.cash - liab.totalAmount,
        liabilities: newLiabs,
        gameLogs: [
          ...prev.gameLogs,
          {
            id: `repay_${liabilityId}_${Date.now()}`, turn: prev.turnCount,
            message: `[${liab.name}] 잔액 $${liab.totalAmount.toLocaleString()}를 전액 상환하여 월 지출이 $${liab.monthlyExpense.toLocaleString()} 감소했습니다!`,
            type: 'repay', timestamp: new Date().toLocaleTimeString()
          }
        ]
      };

      if (checkHasEscapedRatRace(newState)) {
        newState.hasWon = true;
        setTimeout(() => setShowVictoryModal(true), 300);
      }

      return newState;
    });
  };

  const currentSpace = BOARD_SPACES[player.currentSpaceIndex] || BOARD_SPACES[0];
  const passiveIncome = calculatePassiveIncome(player);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans">
      <style>{`
        @keyframes float-money {
          0%   { transform: translateX(var(--fx,0px)) translateY(0) scale(0.7); opacity: 0; }
          12%  { transform: translateX(var(--fx,0px)) translateY(-8px) scale(1.25); opacity: 1; }
          75%  { transform: translateX(var(--fx,0px)) translateY(-64px) scale(1.05); opacity: 1; }
          100% { transform: translateX(var(--fx,0px)) translateY(-90px) scale(0.9); opacity: 0; }
        }
        .float-money { animation: float-money 1.6s ease-out forwards; }
      `}</style>

      {/* Floating money overlay */}
      <div className="fixed top-[42%] left-[38%] z-[200] pointer-events-none flex flex-col items-center gap-1">
        {floatingAmounts.map((item) => (
          <FloatingMoneyItem key={item.id} item={item} fmt={formatCurrency} />
        ))}
      </div>

      <GameHeader
        player={player}
        onOpenBank={() => setShowBankModal(true)}
        onOpenStatement={() => setShowStatementModal(true)}
        onResetGame={() => setShowProfessionModal(true)}
        onOpenHistory={() => setShowHistoryModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <BoardView
            player={player}
            onRollDice={handleRollDice}
            isRolling={isRolling}
            isMoving={isMoving}
            tokenPosition={tokenPosition}
            lastDiceRoll={lastDiceRoll}
            onOpenCurrentSpaceCard={() => setShowCardModal(true)}
          />

          <div className="bg-white border border-stone-200 rounded-2xl p-4 text-xs text-stone-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2" />
            승리 조건: <strong className="text-stone-700">패시브 인컴 &gt; 월 총지출</strong>을 달성해 쥐경주(Rat Race)를 탈출하세요!
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* 보유 자산 요약 */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>내 보유 자산 요약</span>
                </h3>
                <button
                  onClick={() => setShowStatementModal(true)}
                  className="text-xs text-emerald-600 hover:underline font-semibold"
                >
                  재무제표 전체 보기 →
                </button>
              </div>

              {player.stocks.length === 0 && player.realEstates.length === 0 ? (
                <div className="text-center py-6 text-stone-400 text-xs">
                  아직 투자 자산이 없습니다.
                  <br />
                  소액/대형 투자 칸에 도착해 자산을 매수하세요.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 text-xs">
                  {player.stocks.map((stock) => (
                    <div key={stock.id} className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-stone-800">{stock.symbol} 주식</div>
                        <div className="text-[11px] text-stone-400">{stock.shares}주 보유</div>
                      </div>
                      <div className="text-emerald-600 font-bold">
                        +${(stock.shares * stock.dividendPerShare).toLocaleString()}/월
                      </div>
                    </div>
                  ))}
                  {player.realEstates.map((re) => (
                    <div key={re.id} className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-stone-800 truncate max-w-[150px]">{re.name}</div>
                        <div className="text-[11px] text-stone-400">ROI {re.roi}%</div>
                      </div>
                      <div className="text-emerald-600 font-bold">
                        +${re.cashflow.toLocaleString()}/월
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center text-xs">
              <span className="text-stone-400">패시브 인컴 합계:</span>
              <span className="text-blue-600 font-bold text-sm">
                ${passiveIncome.toLocaleString()}/월
              </span>
            </div>
          </div>

          {/* 활동 로그 */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm flex-1 flex flex-col">
            <h3 className="font-bold text-stone-800 text-sm border-b border-stone-100 pb-3 mb-3 flex items-center justify-between">
              <span>활동 로그 및 메시지</span>
              <span className="text-xs text-stone-400 font-normal">턴 #{player.turnCount}</span>
            </h3>

            <div className="space-y-2.5 flex-1 max-h-[340px] overflow-y-auto pr-1 text-xs">
              {player.gameLogs.slice().reverse().map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-2 ${
                    log.type === 'payday' ? 'bg-emerald-50 border-emerald-200'
                    : log.type === 'deal' ? 'bg-blue-50 border-blue-200'
                    : log.type === 'doodad' ? 'bg-rose-50 border-rose-200'
                    : 'bg-stone-50 border-stone-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-bold">#턴{log.turn}</span>
                      <span className="text-stone-400 text-[10px]">{log.timestamp}</span>
                    </div>
                    <div className="text-stone-700 leading-relaxed">{log.message}</div>
                  </div>
                  {log.amount !== undefined && (
                    <span className={`font-bold whitespace-nowrap ${log.amount >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {formatCurrency(log.amount)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showProfessionModal && (
        <ProfessionSelectModal onSelectProfession={handleSelectProfession} />
      )}

      {showBankModal && (
        <BankModal
          player={player}
          onClose={() => setShowBankModal(false)}
          onBorrow={handleBorrow}
          onRepayBankLoan={handleRepayBankLoan}
          onRepayLiability={handleRepayLiability}
        />
      )}

      {showStatementModal && (
        <FinancialStatement
          player={player}
          onClose={() => setShowStatementModal(false)}
          onOpenBankModal={() => { setShowStatementModal(false); setShowBankModal(true); }}
        />
      )}

      {showCardModal && (
        <CardModal
          player={player}
          spaceType={currentSpace.type}
          cardData={currentCardData}
          onClose={() => setShowCardModal(false)}
          onBuyDeal={handleBuyDeal}
          onPayDoodad={handlePayDoodad}
          onSellMarket={handleSellMarket}
          onAcceptCharity={handleAcceptCharity}
          onAcceptBaby={handleAcceptBaby}
          onOpenBank={() => setShowBankModal(true)}
        />
      )}

      {showVictoryModal && (
        <VictoryModal
          player={player}
          onContinue={() => setShowVictoryModal(false)}
          onRestart={() => setShowProfessionModal(true)}
        />
      )}

      {showHistoryModal && (
        <GameHistoryModal onClose={() => setShowHistoryModal(false)} />
      )}
    </div>
  );
}
