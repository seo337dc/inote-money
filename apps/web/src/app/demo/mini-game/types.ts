export type ProfessionId = 'doctor' | 'engineer' | 'teacher' | 'truck_driver' | 'secretary' | 'lawyer';

export interface LiabilityItem {
  id: string;
  name: string;
  totalAmount: number;
  monthlyExpense: number;
  canRepay: boolean;
}

export interface Profession {
  id: ProfessionId;
  name: string;
  nameKo: string;
  icon: string;
  salary: number;
  savings: number;
  taxes: number;
  homeMortgage: { total: number; expense: number };
  schoolLoans: { total: number; expense: number };
  carLoans: { total: number; expense: number };
  creditCard: { total: number; expense: number };
  retailDebt: { total: number; expense: number };
  otherExpenses: number;
  childCostPerChild: number;
  description: string;
}

export type SpaceType =
  | 'payday'
  | 'small_deal'
  | 'big_deal'
  | 'doodad'
  | 'market'
  | 'baby'
  | 'charity'
  | 'downsized';

export interface BoardSpace {
  index: number;
  type: SpaceType;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface AssetStock {
  id: string;
  symbol: string;
  name: string;
  costPerShare: number;
  shares: number;
  dividendPerShare: number;
}

export interface AssetRealEstate {
  id: string;
  name: string;
  type: 'condo' | 'house' | 'duplex' | '4plex' | '8plex' | 'apartment' | 'business';
  cost: number;
  downPayment: number;
  mortgage: number;
  cashflow: number;
  roi: number;
}

export type AssetType = 'stock' | 'real_estate' | 'coin' | 'business';

export interface DealCard {
  id: string;
  title: string;
  type: 'small' | 'big';
  assetType: AssetType;
  symbol?: string;
  description: string;
  cost: number;
  downPayment: number;
  mortgage: number;
  cashflow: number;
  roi?: number;
  ruleHint?: string;
}

export interface DoodadCard {
  id: string;
  title: string;
  description: string;
  cost: number;
}

export interface MarketCard {
  id: string;
  title: string;
  description: string;
  targetType: 'stock' | 'real_estate' | 'all_real_estate';
  targetSymbol?: string;
  targetPropertyType?: AssetRealEstate['type'][];
  offerPricePerShare?: number;
  offerMultiplier?: number;
  offerFixedPrice?: number;
}

export interface GameLog {
  id: string;
  turn: number;
  message: string;
  type: 'payday' | 'deal' | 'doodad' | 'market' | 'repay' | 'info' | 'victory';
  amount?: number;
  timestamp: string;
}

export interface PlayerState {
  profession: Profession;
  cash: number;
  childrenCount: number;
  bankLoan: number;
  liabilities: Record<string, LiabilityItem>;
  stocks: AssetStock[];
  realEstates: AssetRealEstate[];
  currentSpaceIndex: number;
  charityTurnsLeft: number;
  downsizedTurnsLeft: number;
  turnCount: number;
  hasWon: boolean;
  gameLogs: GameLog[];
}
