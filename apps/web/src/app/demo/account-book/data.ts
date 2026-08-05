export type Expense = {
  id: string;
  place: string;
  amount: number;
  category: string;
  isWaste: boolean;
};

export type ExpenseMap = Record<string, Expense[]>;

export const CATEGORIES = [
  "식비",
  "카페",
  "교통",
  "쇼핑",
  "의료",
  "문화",
  "구독",
  "기타",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_BADGE: Record<string, string> = {
  식비: "bg-green-100 text-green-700",
  카페: "bg-amber-100 text-amber-700",
  교통: "bg-blue-100 text-blue-700",
  쇼핑: "bg-purple-100 text-purple-700",
  의료: "bg-red-100 text-red-700",
  문화: "bg-pink-100 text-pink-700",
  구독: "bg-indigo-100 text-indigo-700",
  기타: "bg-gray-100 text-gray-600",
};

export const MONTHLY_INFO = {
  year: 2026,
  month: 5,
  salary: 4_500_000,
  bankBalance: 2_340_000,
};

export const INITIAL_EXPENSES: ExpenseMap = {
  "2026-05-01": [
    { id: "e01a", place: "이마트", amount: 45_000, category: "식비", isWaste: false },
    { id: "e01b", place: "스타벅스", amount: 6_500, category: "카페", isWaste: true },
  ],
  "2026-05-02": [
    { id: "e02a", place: "지하철", amount: 2_800, category: "교통", isWaste: false },
    { id: "e02b", place: "올리브영", amount: 38_000, category: "쇼핑", isWaste: true },
    { id: "e02c", place: "점심식사", amount: 12_000, category: "식비", isWaste: false },
  ],
  "2026-05-03": [
    { id: "e03a", place: "넷플릭스", amount: 17_000, category: "구독", isWaste: false },
    { id: "e03b", place: "편의점", amount: 3_200, category: "식비", isWaste: true },
  ],
  "2026-05-04": [
    { id: "e04a", place: "점심식사", amount: 9_500, category: "식비", isWaste: false },
    { id: "e04b", place: "카카오택시", amount: 8_200, category: "교통", isWaste: false },
  ],
  "2026-05-05": [
    { id: "e05a", place: "롯데월드", amount: 65_000, category: "문화", isWaste: false },
    { id: "e05b", place: "외식 (가족)", amount: 52_000, category: "식비", isWaste: false },
    { id: "e05c", place: "심야 택시", amount: 15_000, category: "교통", isWaste: true },
  ],
  "2026-05-06": [
    { id: "e06a", place: "점심식사", amount: 11_000, category: "식비", isWaste: false },
    { id: "e06b", place: "아메리카노", amount: 4_500, category: "카페", isWaste: false },
  ],
  "2026-05-07": [
    { id: "e07a", place: "약국", amount: 12_500, category: "의료", isWaste: false },
    { id: "e07b", place: "점심식사", amount: 10_000, category: "식비", isWaste: false },
    { id: "e07c", place: "편의점 간식", amount: 4_800, category: "식비", isWaste: true },
  ],
  "2026-05-08": [
    { id: "e08a", place: "아메리카노", amount: 5_500, category: "카페", isWaste: false },
    { id: "e08b", place: "점심식사", amount: 13_000, category: "식비", isWaste: false },
  ],

  // 7월 (대시보드 "지난달 비교" 목데이터)
  "2026-07-01": [
    { id: "j0701a", place: "점심식사", amount: 11_000, category: "식비", isWaste: false },
    { id: "j0701b", place: "아메리카노", amount: 4_500, category: "카페", isWaste: false },
  ],
  "2026-07-02": [
    { id: "j0702a", place: "지하철", amount: 2_800, category: "교통", isWaste: false },
    { id: "j0702b", place: "편의점", amount: 6_200, category: "식비", isWaste: true },
  ],
  "2026-07-03": [
    { id: "j0703a", place: "넷플릭스", amount: 17_000, category: "구독", isWaste: false },
  ],
  "2026-07-04": [
    { id: "j0704a", place: "이마트", amount: 42_000, category: "식비", isWaste: false },
    { id: "j0704b", place: "약국", amount: 8_500, category: "의료", isWaste: false },
  ],
  "2026-07-05": [
    { id: "j0705a", place: "주말 외식", amount: 48_000, category: "식비", isWaste: false },
    { id: "j0705b", place: "영화관", amount: 26_000, category: "문화", isWaste: false },
    { id: "j0705c", place: "심야 택시", amount: 12_000, category: "교통", isWaste: true },
  ],
  "2026-07-08": [
    { id: "j0708a", place: "점심식사", amount: 10_500, category: "식비", isWaste: false },
    { id: "j0708b", place: "카페", amount: 4_800, category: "카페", isWaste: false },
  ],
  "2026-07-10": [
    { id: "j0710a", place: "쇼핑몰", amount: 65_000, category: "쇼핑", isWaste: true },
  ],
  "2026-07-12": [
    { id: "j0712a", place: "헬스장 등록", amount: 55_000, category: "구독", isWaste: false },
  ],
  "2026-07-15": [
    { id: "j0715a", place: "저녁 모임", amount: 38_000, category: "식비", isWaste: false },
    { id: "j0715b", place: "택시", amount: 9_000, category: "교통", isWaste: false },
  ],
  "2026-07-17": [
    { id: "j0717a", place: "편의점", amount: 5_200, category: "식비", isWaste: true },
  ],
  "2026-07-19": [
    { id: "j0719a", place: "주말 나들이", amount: 32_000, category: "문화", isWaste: false },
    { id: "j0719b", place: "외식", amount: 41_000, category: "식비", isWaste: false },
  ],
  "2026-07-22": [
    { id: "j0722a", place: "점심식사", amount: 9_800, category: "식비", isWaste: false },
  ],
  "2026-07-24": [
    { id: "j0724a", place: "병원", amount: 15_000, category: "의료", isWaste: false },
  ],
  "2026-07-27": [
    { id: "j0727a", place: "지하철", amount: 2_800, category: "교통", isWaste: false },
    { id: "j0727b", place: "점심식사", amount: 11_500, category: "식비", isWaste: false },
  ],
  "2026-07-28": [
    { id: "j0728a", place: "카페", amount: 5_000, category: "카페", isWaste: false },
    { id: "j0728b", place: "저녁식사", amount: 22_000, category: "식비", isWaste: false },
  ],
  "2026-07-29": [
    { id: "j0729a", place: "편의점", amount: 4_300, category: "식비", isWaste: true },
  ],
  "2026-07-30": [
    { id: "j0730a", place: "온라인 쇼핑", amount: 29_000, category: "쇼핑", isWaste: true },
  ],
  "2026-07-31": [
    { id: "j0731a", place: "월말 외식", amount: 35_000, category: "식비", isWaste: false },
    { id: "j0731b", place: "택시", amount: 8_500, category: "교통", isWaste: false },
  ],

  // 8월 (대시보드 "이번 달/이번 주" 목데이터)
  "2026-08-01": [
    { id: "a0801a", place: "점심식사", amount: 10_200, category: "식비", isWaste: false },
    { id: "a0801b", place: "아메리카노", amount: 4_700, category: "카페", isWaste: false },
  ],
  "2026-08-02": [
    { id: "a0802a", place: "브런치", amount: 26_000, category: "식비", isWaste: false },
    { id: "a0802b", place: "장보기", amount: 33_000, category: "식비", isWaste: false },
  ],
  "2026-08-03": [
    { id: "a0803a", place: "지하철", amount: 2_800, category: "교통", isWaste: false },
    { id: "a0803b", place: "점심식사", amount: 11_000, category: "식비", isWaste: false },
  ],
  "2026-08-04": [
    { id: "a0804a", place: "편의점", amount: 5_300, category: "식비", isWaste: true },
    { id: "a0804b", place: "넷플릭스", amount: 17_000, category: "구독", isWaste: false },
  ],
  "2026-08-05": [
    { id: "a0805a", place: "아메리카노", amount: 4_900, category: "카페", isWaste: false },
    { id: "a0805b", place: "점심식사", amount: 12_500, category: "식비", isWaste: false },
    { id: "a0805c", place: "심야 택시", amount: 13_500, category: "교통", isWaste: true },
  ],
};
