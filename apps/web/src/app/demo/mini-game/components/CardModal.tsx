'use client';

import { useState } from 'react';
import {
  PlayerState,
  DealCard,
  DoodadCard,
  MarketCard,
  SpaceType
} from '../types';
import {
  formatCurrency,
  calculateMonthlyCashflow,
  calculateTotalIncome,
  calculateTotalExpenses
} from '../lib/gameLogic';
import {
  TrendingUp,
  Building,
  ShoppingBag,
  Building2,
  DollarSign,
  Baby,
  HeartHandshake,
  AlertTriangle,
  X,
  AlertCircle,
  Coins
} from 'lucide-react';

interface CardModalProps {
  player: PlayerState;
  spaceType: SpaceType;
  cardData?: DealCard | DoodadCard | MarketCard | null;
  onClose: () => void;
  onBuyDeal?: (card: DealCard, shares?: number) => void;
  onPayDoodad?: (card: DoodadCard) => void;
  onSellMarket?: (card: MarketCard) => void;
  onAcceptCharity?: () => void;
  onOpenBank?: () => void;
}

export function CardModal({
  player,
  spaceType,
  cardData,
  onClose,
  onBuyDeal,
  onPayDoodad,
  onSellMarket,
  onAcceptCharity,
  onOpenBank,
}: CardModalProps) {
  const [stockShares, setStockShares] = useState<number>(100);

  const renderHeaderBadge = () => {
    switch (spaceType) {
      case 'payday':
        return { title: '월급날 (Payday!)', badge: '정기 수입 지급', gradient: 'from-emerald-500 to-teal-600', icon: <DollarSign className="w-6 h-6" /> };
      case 'small_deal':
        return { title: '소액 투자 기회 (Small Deal)', badge: '600만원 이하 투자', gradient: 'from-blue-500 to-indigo-600', icon: <TrendingUp className="w-6 h-6" /> };
      case 'big_deal':
        return { title: '대형 투자 기회 (Big Deal)', badge: '600만원 초과 투자', gradient: 'from-purple-500 to-indigo-700', icon: <Building className="w-6 h-6" /> };
      case 'doodad':
        return { title: '생활 소비/사치 (Doodad)', badge: '예기치 못한 지출', gradient: 'from-rose-500 to-pink-600', icon: <ShoppingBag className="w-6 h-6" /> };
      case 'market':
        return { title: '시장 호황/매각 기회 (Market)', badge: '시세 차익 실현', gradient: 'from-amber-500 to-orange-600', icon: <Building2 className="w-6 h-6" /> };
      case 'baby':
        return { title: '자녀 출산 (New Baby)', badge: '고정 양육비 증가', gradient: 'from-pink-500 to-rose-500', icon: <Baby className="w-6 h-6" /> };
      case 'charity':
        return { title: '자선 사업 (Charity)', badge: '10% 기부 시 주사위 2개', gradient: 'from-indigo-500 to-purple-600', icon: <HeartHandshake className="w-6 h-6" /> };
      case 'downsized':
        return { title: '실직 (Downsized)', badge: '1턴 휴식 & 1달 지출', gradient: 'from-stone-500 to-stone-700', icon: <AlertTriangle className="w-6 h-6" /> };
      default:
        return { title: '이벤트', badge: '보드게임', gradient: 'from-stone-400 to-stone-600', icon: <Coins className="w-6 h-6" /> };
    }
  };

  const headerInfo = renderHeaderBadge();
  const monthlyCashflow = calculateMonthlyCashflow(player);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 overflow-y-auto" style={{ perspective: '1200px' }}>
      <style>{`
        @keyframes card-flip-in {
          0%   { transform: rotateY(90deg) scale(0.92); opacity: 0; }
          45%  { opacity: 1; }
          100% { transform: rotateY(0deg) scale(1); opacity: 1; }
        }
        .card-flip-in { animation: card-flip-in 0.42s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
      `}</style>
      <div className="card-flip-in bg-white border border-stone-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className={`bg-gradient-to-r ${headerInfo.gradient} px-6 py-4 text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black/20 flex items-center justify-center">
              {headerInfo.icon}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-black/20 px-2 py-0.5 rounded">
                {headerInfo.badge}
              </span>
              <h3 className="text-lg font-bold mt-1">{headerInfo.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {spaceType === 'payday' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <DollarSign className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold text-stone-900">월급날에 도달했습니다!</h4>
              <p className="text-xs text-stone-500">
                은행에서 당신의 월급과 패시브 인컴에서 월 총지출을 뺀 <strong>월 잉여현금(Payday)</strong>이 지급되었습니다.
              </p>
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2 text-left text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>총 수입 (급여 + 패시브인컴)</span>
                  <span className="font-semibold">{formatCurrency(calculateTotalIncome(player))}</span>
                </div>
                <div className="flex justify-between text-rose-500">
                  <span>총 지출 (세금 + 부채 + 이자)</span>
                  <span className="font-semibold">-{formatCurrency(calculateTotalExpenses(player))}</span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-bold">
                  <span className="text-stone-800">실제 수취액</span>
                  <span className={monthlyCashflow >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                    {monthlyCashflow >= 0 ? `+${formatCurrency(monthlyCashflow)}` : formatCurrency(monthlyCashflow)}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-sm transition-all mt-4"
              >
                현금 수령 및 턴 마감
              </button>
            </div>
          )}

          {spaceType === 'baby' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto">
                <Baby className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold text-stone-900">축하합니다! 아이가 태어났습니다!</h4>
              {player.childrenCount >= 3 ? (
                <p className="text-xs text-stone-600">이미 자녀가 3명이므로 양육비가 더 이상 추가되지 않습니다.</p>
              ) : (
                <>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    새로운 가족이 생겼습니다! 자녀 1명당 매월{' '}
                    <strong>{formatCurrency(player.profession.childCostPerChild)}</strong>의 고정 양육비가 영구적으로 추가됩니다.
                  </p>
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs flex justify-between items-center">
                    <span className="text-stone-500">현재 자녀 수</span>
                    <span className="text-pink-600 font-bold text-sm">
                      {player.childrenCount}명 → {player.childrenCount + 1}명
                    </span>
                  </div>
                </>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm rounded-xl transition-all mt-4"
              >
                확인
              </button>
            </div>
          )}

          {spaceType === 'charity' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold text-stone-900">자선 기부 기회</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                총 수입의 10%(<strong>{formatCurrency(Math.round(calculateTotalIncome(player) * 0.1))}</strong>)를 기부하면
                향후 <strong>3턴 동안 주사위를 2개씩 굴려</strong> 더 빠르게 투자 기회를 잡을 수 있습니다!
              </p>
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs flex justify-between items-center">
                <span className="text-stone-500">기부 필요 금액 (총 수입의 10%)</span>
                <span className="text-indigo-600 font-bold text-sm">
                  {formatCurrency(Math.round(calculateTotalIncome(player) * 0.1))}
                </span>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold text-xs rounded-xl transition-all"
                >
                  기부 안함 (패스)
                </button>
                <button
                  onClick={() => { if (onAcceptCharity) onAcceptCharity(); }}
                  disabled={player.cash < Math.round(calculateTotalIncome(player) * 0.1)}
                  className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  기부하고 3턴 부스트 받기
                </button>
              </div>
            </div>
          )}

          {spaceType === 'downsized' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-stone-200 text-rose-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold text-stone-900">실직 (Downsized!)</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                구조조정으로 직장을 잃었습니다. 생활비 충당을 위해{' '}
                <strong>월 총지출({formatCurrency(calculateTotalExpenses(player))})</strong>만큼을
                즉시 지불하고 다음 1턴을 쉬어야 합니다.
              </p>
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs flex justify-between items-center">
                <span className="text-stone-500">지불할 실직 손실금</span>
                <span className="text-rose-500 font-bold text-sm">-{formatCurrency(calculateTotalExpenses(player))}</span>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl transition-all mt-4"
              >
                지불 및 턴 마감
              </button>
            </div>
          )}

          {spaceType === 'doodad' && cardData && (
            <div className="space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h4 className="text-lg font-bold text-stone-900 mb-1">{(cardData as DoodadCard).title}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{(cardData as DoodadCard).description}</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex justify-between items-center">
                <span className="text-xs text-stone-500 font-medium">지불해야 할 소비 금액</span>
                <span className="text-rose-500 font-bold text-lg">-{formatCurrency((cardData as DoodadCard).cost)}</span>
              </div>
              {player.cash < (cardData as DoodadCard).cost && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500" />
                  <span>보유 현금이 부족합니다. 아래 버튼으로 은행 대출을 먼저 받으세요.</span>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                {onOpenBank && (
                  <button
                    onClick={onOpenBank}
                    className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold rounded-xl transition-all"
                  >
                    은행 대출 열기
                  </button>
                )}
                <button
                  onClick={() => { if (onPayDoodad) onPayDoodad(cardData as DoodadCard); }}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  지불하고 턴 마감
                </button>
              </div>
            </div>
          )}

          {(spaceType === 'small_deal' || spaceType === 'big_deal') && cardData && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-stone-900 mb-1">{(cardData as DealCard).title}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{(cardData as DealCard).description}</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2.5 text-xs">
                {(cardData as DealCard).assetType === 'stock' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-stone-400">주식 심볼 (Symbol)</span>
                      <span className="font-bold text-stone-800">{(cardData as DealCard).symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">1주당 매수가</span>
                      <span className="font-bold text-emerald-600">{formatCurrency((cardData as DealCard).cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">1주당 월 배당금</span>
                      <span className="font-bold text-blue-600">{formatCurrency((cardData as DealCard).cashflow || 0)}/월</span>
                    </div>
                    <div className="border-t border-stone-200 pt-3 flex items-center justify-between gap-3">
                      <span className="text-stone-600 font-semibold">매수할 수량(주)</span>
                      <input
                        type="number"
                        step={10}
                        min={10}
                        max={Math.floor(player.cash / (cardData as DealCard).cost)}
                        value={stockShares}
                        onChange={(e) => setStockShares(Math.max(1, Number(e.target.value)))}
                        className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-stone-800 font-bold text-right w-28 text-xs outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="flex justify-between text-stone-600 font-semibold">
                      <span>총 필요 투자금</span>
                      <span className="text-emerald-600">{formatCurrency(stockShares * (cardData as DealCard).cost)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-stone-400">총 가격 (Total Cost)</span>
                      <span className="font-bold text-stone-800">{formatCurrency((cardData as DealCard).cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">필요 초기 투자금 (Down Payment)</span>
                      <span className="font-bold text-emerald-600">{formatCurrency((cardData as DealCard).downPayment)}</span>
                    </div>
                    {(cardData as DealCard).mortgage > 0 && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">담보 대출금 (Mortgage)</span>
                        <span className="font-semibold text-stone-600">{formatCurrency((cardData as DealCard).mortgage)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-stone-200 pt-2">
                      <span className="text-stone-700 font-bold">월 패시브 인컴 증가 (Cashflow)</span>
                      <span className="font-extrabold text-blue-600 text-sm">+{formatCurrency((cardData as DealCard).cashflow)}/월</span>
                    </div>
                    {(cardData as DealCard).roi && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">연간 투자수익률 (ROI)</span>
                        <span className="font-bold text-amber-600">{(cardData as DealCard).roi}%</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              {(cardData as DealCard).ruleHint && (
                <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                  💡 <strong>팁:</strong> {(cardData as DealCard).ruleHint}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold text-xs rounded-xl transition-all"
                >
                  패스 (안사기)
                </button>
                {(cardData as DealCard).assetType === 'stock' ? (
                  <button
                    onClick={() => { if (onBuyDeal) onBuyDeal(cardData as DealCard, stockShares); }}
                    disabled={player.cash < stockShares * (cardData as DealCard).cost || stockShares <= 0}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    {player.cash >= stockShares * (cardData as DealCard).cost ? `${stockShares}주 매수하기` : '현금 부족'}
                  </button>
                ) : (
                  <button
                    onClick={() => { if (onBuyDeal) onBuyDeal(cardData as DealCard); }}
                    disabled={player.cash < (cardData as DealCard).downPayment}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    {player.cash >= (cardData as DealCard).downPayment
                      ? `매수하기 (${formatCurrency((cardData as DealCard).downPayment)})`
                      : '초기 자금 부족'}
                  </button>
                )}
              </div>
            </div>
          )}

          {spaceType === 'market' && cardData && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-stone-900 mb-1">{(cardData as MarketCard).title}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{(cardData as MarketCard).description}</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs">
                {(cardData as MarketCard).targetType === 'stock' ? (
                  (() => {
                    const symbol = (cardData as MarketCard).targetSymbol;
                    const owned = player.stocks.find((s) => s.symbol === symbol);
                    const offerPrice = (cardData as MarketCard).offerPricePerShare || 0;
                    if (!owned || owned.shares === 0) {
                      return <div className="text-stone-400 italic">현재 보유 중인 <strong>{symbol}</strong> 주식이 없습니다.</div>;
                    }
                    const totalValue = owned.shares * offerPrice;
                    const totalProfit = totalValue - owned.shares * owned.costPerShare;
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between text-stone-600"><span>보유 수량</span><span className="font-bold text-stone-800">{owned.shares}주</span></div>
                        <div className="flex justify-between text-stone-600"><span>시장 매각가</span><span className="font-bold text-emerald-600">{formatCurrency(offerPrice)}/주 (총 {formatCurrency(totalValue)})</span></div>
                        <div className="flex justify-between border-t border-stone-200 pt-1.5 text-sm font-bold"><span className="text-stone-800">예상 차익(수익)</span><span className="text-amber-600">+{formatCurrency(totalProfit)}</span></div>
                      </div>
                    );
                  })()
                ) : (
                  (() => {
                    const targetTypes = (cardData as MarketCard).targetPropertyType || [];
                    const matchingProps = player.realEstates.filter((re) => targetTypes.includes(re.type));
                    if (matchingProps.length === 0) {
                      return <div className="text-stone-400 italic">이 시장 구매자가 찾는 부동산을 보유하고 있지 않습니다.</div>;
                    }
                    return (
                      <div className="space-y-2">
                        <div className="text-emerald-600 font-semibold mb-1">🎉 매각 가능한 부동산 {matchingProps.length}건 보유 중!</div>
                        {matchingProps.map((re) => (
                          <div key={re.id} className="flex justify-between bg-white p-2.5 rounded-lg border border-stone-200">
                            <span className="text-stone-700">{re.name}</span>
                            <span className="text-amber-600 font-bold">
                              {(cardData as MarketCard).offerFixedPrice
                                ? formatCurrency((cardData as MarketCard).offerFixedPrice!)
                                : `원가 x${(cardData as MarketCard).offerMultiplier}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold text-xs rounded-xl transition-all"
                >
                  매각 안함 / 닫기
                </button>
                <button
                  onClick={() => { if (onSellMarket) onSellMarket(cardData as MarketCard); }}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  기회 실현 (매각하기)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
