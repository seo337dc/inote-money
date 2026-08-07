import { DealCard, DoodadCard, MarketCard } from '../types';

export const SMALL_DEAL_CARDS: DealCard[] = [
  {
    id: 'sd_stock_myt4u_low',
    title: '전자제품 회사 주식 (MYT4U)',
    type: 'small',
    assetType: 'stock',
    symbol: 'MYT4U',
    description: 'MYT4U 주식이 역사적 최저가인 1만원에 하락했습니다! 배당은 없지만 추후 시장이 오를 때 시세차익을 노릴 수 있습니다.',
    cost: 10,
    downPayment: 10,
    mortgage: 0,
    cashflow: 0,
    ruleHint: '1주당 1만원으로 원하는 수량만큼 매수 가능 (배당 0)'
  },
  {
    id: 'sd_stock_ok4u_div',
    title: '우량 배당주 (OK4U)',
    type: 'small',
    assetType: 'stock',
    symbol: 'OK4U',
    description: '안정적인 수익을 내는 OK4U 주식이 주당 3만원에 나왔습니다. 100주 매수 시 매월 2만원의 배당금이 지급됩니다.',
    cost: 30,
    downPayment: 30,
    mortgage: 0,
    cashflow: 0.2,
    ruleHint: '1주당 월 200원 배당 지급 (예: 100주 = 월 2만원)'
  },
  {
    id: 'sd_stock_on2u_boom',
    title: '제약사 주식 (ON2U)',
    type: 'small',
    assetType: 'stock',
    symbol: 'ON2U',
    description: '신약 개발 소식으로 핫한 ON2U 주식! 주당 5천원의 헐값입니다.',
    cost: 5,
    downPayment: 5,
    mortgage: 0,
    cashflow: 0,
    ruleHint: '시장 카드에서 고가에 매각 가능'
  },
  {
    id: 'sd_condo_2br',
    title: '소형 2방 아파트 (2BR/1BA Condo)',
    type: 'small',
    assetType: 'real_estate',
    description: '교통이 편리한 지역의 2방 아파트 급매물입니다. 투자금 400만원으로 매월 14만원의 패시브 인컴을 창출합니다.',
    cost: 40000,
    downPayment: 4000,
    mortgage: 36000,
    cashflow: 140,
    roi: 42,
    ruleHint: '연 ROI 42% - 훌륭한 초기 패시브 인컴!'
  },
  {
    id: 'sd_house_3br',
    title: '교외 3방 단독주택 (3BR/2BA House)',
    type: 'small',
    assetType: 'real_estate',
    description: '재개발 호재 지역의 3방 주택입니다. 임차인이 대기 중입니다.',
    cost: 55000,
    downPayment: 5000,
    mortgage: 50000,
    cashflow: 160,
    roi: 38.4,
    ruleHint: '추후 시장에서 최대 8,500만원~1억3,500만원에 매각 가능'
  },
  {
    id: 'sd_duplex',
    title: '2세대 듀플렉스 주택 (2-Unit Duplex)',
    type: 'small',
    assetType: 'real_estate',
    description: '양쪽 두 세대에서 임대료가 나오는 소형 복합주택입니다.',
    cost: 60000,
    downPayment: 6000,
    mortgage: 54000,
    cashflow: 220,
    roi: 44,
    ruleHint: '안정적인 현금흐름과 높은 환급성'
  }
];

export const BIG_DEAL_CARDS: DealCard[] = [
  {
    id: 'bd_4plex',
    title: '4세대 아파트 (4-Plex Building)',
    type: 'big',
    assetType: 'real_estate',
    description: '도심 인근 4개 거주 유닛이 있는 소형 다가구 아파트입니다. 4가구에서 안정적인 월 임대 수익이 발생합니다.',
    cost: 140000,
    downPayment: 14000,
    mortgage: 126000,
    cashflow: 580,
    roi: 49.7,
    ruleHint: '매월 58만원 패시브 인컴 증가'
  },
  {
    id: 'bd_8plex',
    title: '8세대 다가구 아파트 (8-Unit Apartment)',
    type: 'big',
    assetType: 'real_estate',
    description: '대학가 근처의 8세대 아파트 빌딩입니다. 공실률이 낮고 수익률이 훌륭합니다.',
    cost: 280000,
    downPayment: 28000,
    mortgage: 252000,
    cashflow: 1200,
    roi: 51.4,
    ruleHint: '매월 120만원 패시브 인컴 증가!'
  },
  {
    id: 'bd_apartment_24',
    title: '24세대 아파트 단지 (24-Unit Complex)',
    type: 'big',
    assetType: 'real_estate',
    description: '대형 아파트 단지 매물입니다. 이 한 건의 투자로 의사나 변호사도 쥐경주 탈출에 크게 다가설 수 있습니다.',
    cost: 550000,
    downPayment: 50000,
    mortgage: 500000,
    cashflow: 2800,
    roi: 67.2,
    ruleHint: '매월 280만원의 거대한 패시브 인컴'
  },
  {
    id: 'bd_car_wash',
    title: '자동 세차장 사업체 (Automated Car Wash)',
    type: 'big',
    assetType: 'business',
    description: '무인화 시설이 완비된 대로변 자동 세차장입니다. 직원이 관리하여 완벽한 패시브 인컴이 됩니다.',
    cost: 320000,
    downPayment: 35000,
    mortgage: 285000,
    cashflow: 1500,
    roi: 51.4,
    ruleHint: '매월 150만원 현금흐름 증가'
  },
  {
    id: 'bd_laundromat',
    title: '코인 세탁소 사업체 (Coin Laundromat)',
    type: 'big',
    assetType: 'business',
    description: '24시간 무인 코인 세탁소 사업체 매입 기회입니다.',
    cost: 180000,
    downPayment: 20000,
    mortgage: 160000,
    cashflow: 950,
    roi: 57,
    ruleHint: '매월 95만원 현금흐름 증가'
  }
];

export const DOODAD_CARDS: DoodadCard[] = [
  {
    id: 'doodad_coffee',
    title: '최신 에스프레소 커피머신 구매',
    description: '홈 카페를 위해 이탈리아제 고급 에스프레소 머신과 원두 그라인더를 구매했습니다.',
    cost: 450
  },
  {
    id: 'doodad_tv',
    title: '85인치 4K OLED 스마트 TV',
    description: '거실 분위기를 바꾸기 위해 대형 고화질 스마트 TV를 일시불로 구매했습니다.',
    cost: 1200
  },
  {
    id: 'doodad_trip',
    title: '주말 제주도 호캉스 여행',
    description: '스트레스 해소를 위해 가족·친구들과 5성급 호텔 호캉스 여행을 다녀왔습니다.',
    cost: 800
  },
  {
    id: 'doodad_watch',
    title: '명품 손목시계 충동구매',
    description: '쇼핑몰에서 눈에 밟히던 명품 시계를 자신에 대한 선물로 구입했습니다.',
    cost: 1500
  },
  {
    id: 'doodad_dental',
    title: '예기치 않은 치과 임플란트 치료',
    description: '치통이 생겨 치과를 방문한 결과, 미용 및 보철 치료 비용이 발생했습니다.',
    cost: 1100
  },
  {
    id: 'doodad_golf',
    title: '고급 골프 클럽 세트 교체',
    description: '비거리를 늘리기 위해 프리미엄 골프 클럽 풀세트를 구매했습니다.',
    cost: 950
  }
];

export const MARKET_CARDS: MarketCard[] = [
  {
    id: 'm_boom_myt4u',
    title: '주식 붐! MYT4U 주가 급등 (4만원)',
    description: 'IT 주식 붐으로 MYT4U 주가가 주당 4만원까지 치솟았습니다! 보유 중인 MYT4U 주식을 전량 매각할 수 있습니다.',
    targetType: 'stock',
    targetSymbol: 'MYT4U',
    offerPricePerShare: 40
  },
  {
    id: 'm_boom_ok4u',
    title: '우량 배당주 OK4U 상승 (4만5천원)',
    description: '안정적인 배당 실적으로 OK4U 주식이 주당 4만5천원에 거래됩니다. 원할 경우 보유 주식을 매각해 시세차익을 실현할 수 있습니다.',
    targetType: 'stock',
    targetSymbol: 'OK4U',
    offerPricePerShare: 45
  },
  {
    id: 'm_boom_on2u',
    title: '제약사 ON2U 신약 승인 (3만5천원)',
    description: 'ON2U 신약 승인 호재로 주가가 3만5천원에 도달했습니다! 보유 중이라면 대박 수익을 낼 수 있습니다.',
    targetType: 'stock',
    targetSymbol: 'ON2U',
    offerPricePerShare: 35
  },
  {
    id: 'm_buyer_condo',
    title: '부동산 투자자 등장! (2방 아파트 고가 매입)',
    description: '타지역 투자자가 지역 2방 아파트(2BR Condo)를 매입 원합니다. 보유 중인 2방 아파트가 있다면 6,500만원에 매각할 수 있습니다!',
    targetType: 'real_estate',
    targetPropertyType: ['condo'],
    offerFixedPrice: 65000
  },
  {
    id: 'm_buyer_house',
    title: '교외 주택 수요 폭발! (3방 주택 매입)',
    description: '실거주 가족이 3방 단독주택(3BR House)을 찾고 있습니다. 보유 중인 3방 주택을 1억1,000만원에 매각하여 막대한 차익을 얻을 수 있습니다!',
    targetType: 'real_estate',
    targetPropertyType: ['house'],
    offerFixedPrice: 110000
  },
  {
    id: 'm_buyer_multiplex',
    title: '기관 투자자 다가구 매입 (4~8세대 아파트)',
    description: '대형 펀드가 수익형 다가구 아파트(4-plex, 8-plex)를 매수 중입니다. 보유 중인 해당 매물을 원가+40% 고가에 매각할 수 있습니다.',
    targetType: 'real_estate',
    targetPropertyType: ['4plex', '8plex', 'duplex'],
    offerMultiplier: 1.4
  }
];
