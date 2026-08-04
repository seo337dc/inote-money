import { BoardSpace } from '../types';

export const BOARD_SPACES: BoardSpace[] = [
  {
    index: 0,
    type: 'payday',
    name: '월급날 (Payday)',
    description: '월 잉여현금(월급+패시브 인컴 - 총지출)이 은행에서 지급됩니다!',
    color: 'bg-emerald-100 border-emerald-500 text-emerald-800',
    icon: 'DollarSign'
  },
  {
    index: 1,
    type: 'small_deal',
    name: '소액 투자 (Small Deal)',
    description: '$6,000 이하 투자 기회 (주식, 소형 부동산 등)',
    color: 'bg-blue-100 border-blue-500 text-blue-800',
    icon: 'TrendingUp'
  },
  {
    index: 2,
    type: 'doodad',
    name: '지출/사치 (Doodad)',
    description: '쇼핑, 여행, 외식 등 예기치 않은 생활 소비 지출 발생',
    color: 'bg-rose-100 border-rose-500 text-rose-800',
    icon: 'ShoppingBag'
  },
  {
    index: 3,
    type: 'market',
    name: '시장/기회 (Market)',
    description: '부동산 호황, 주식 급등락, 구매자 출현 등 시장 이벤트',
    color: 'bg-amber-100 border-amber-500 text-amber-800',
    icon: 'Building2'
  },
  {
    index: 4,
    type: 'big_deal',
    name: '대형 투자 (Big Deal)',
    description: '$6,000 초과 대형 기회 (다세대 아파트, 사업체)',
    color: 'bg-purple-100 border-purple-500 text-purple-800',
    icon: 'Building'
  },
  {
    index: 5,
    type: 'baby',
    name: '자녀 출산 (Baby)',
    description: '자녀 양육비가 추가되어 월 고정 지출이 영구적으로 증가합니다 (최대 3명)',
    color: 'bg-pink-100 border-pink-500 text-pink-800',
    icon: 'Baby'
  },
  {
    index: 6,
    type: 'payday',
    name: '월급날 (Payday)',
    description: '월급날을 지나거나 도착하면 월 잉여현금을 수령합니다.',
    color: 'bg-emerald-100 border-emerald-500 text-emerald-800',
    icon: 'DollarSign'
  },
  {
    index: 7,
    type: 'small_deal',
    name: '소액 투자 (Small Deal)',
    description: '적은 초기 자본으로 현금흐름을 만드는 기회',
    color: 'bg-blue-100 border-blue-500 text-blue-800',
    icon: 'TrendingUp'
  },
  {
    index: 8,
    type: 'charity',
    name: '자선 사업 (Charity)',
    description: '총 수입의 10%를 기부하면 3턴 동안 주사위를 2개씩 굴릴 수 있습니다!',
    color: 'bg-indigo-100 border-indigo-500 text-indigo-800',
    icon: 'HeartHandshake'
  },
  {
    index: 9,
    type: 'big_deal',
    name: '대형 투자 (Big Deal)',
    description: '막대한 패시브 인컴을 창출하는 대규모 투자 건',
    color: 'bg-purple-100 border-purple-500 text-purple-800',
    icon: 'Building'
  },
  {
    index: 10,
    type: 'downsized',
    name: '실직 (Downsized)',
    description: '직장을 잃어 월 총 지출만큼 지불하고 다음 1턴을 쉽니다.',
    color: 'bg-stone-200 border-stone-500 text-stone-800',
    icon: 'AlertTriangle'
  },
  {
    index: 11,
    type: 'small_deal',
    name: '소액 투자 (Small Deal)',
    description: '주식 할인이나 2방 아파트 등 알짜 투자 기회',
    color: 'bg-blue-100 border-blue-500 text-blue-800',
    icon: 'TrendingUp'
  }
];
