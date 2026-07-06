export type Category =
  | 'FOOD' | 'CAFE' | 'TRANSPORT' | 'SHOPPING'
  | 'MEDICAL' | 'CULTURE' | 'SUBSCRIPTION' | 'ETC';

export const CATEGORIES: Category[] = [
  'FOOD', 'CAFE', 'TRANSPORT', 'SHOPPING',
  'MEDICAL', 'CULTURE', 'SUBSCRIPTION', 'ETC',
];

export const CATEGORY_KO: Record<Category, string> = {
  FOOD: '식비', CAFE: '카페', TRANSPORT: '교통', SHOPPING: '쇼핑',
  MEDICAL: '의료', CULTURE: '문화', SUBSCRIPTION: '구독', ETC: '기타',
};

export const CATEGORY_BADGE: Record<Category, string> = {
  FOOD: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CAFE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  TRANSPORT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHOPPING: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  MEDICAL: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  CULTURE: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  SUBSCRIPTION: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  ETC: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  FOOD: 'bg-green-400', CAFE: 'bg-amber-400', TRANSPORT: 'bg-blue-400',
  SHOPPING: 'bg-purple-400', MEDICAL: 'bg-red-400', CULTURE: 'bg-pink-400',
  SUBSCRIPTION: 'bg-indigo-400', ETC: 'bg-gray-400',
};

export type Expense = {
  id: string;
  description: string | null;
  amount: number;
  category: Category;
  isWaste: boolean;
};

// key: "YYYY-MM-DD"
export type ExpenseMap = Record<string, Expense[]>;
