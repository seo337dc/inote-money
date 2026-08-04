import { Profession, PlayerState, LiabilityItem } from '../types';

export function createInitialPlayerState(profession: Profession): PlayerState {
  const liabilities: Record<string, LiabilityItem> = {
    homeMortgage: {
      id: 'homeMortgage',
      name: '주택담보대출 (Home Mortgage)',
      totalAmount: profession.homeMortgage.total,
      monthlyExpense: profession.homeMortgage.expense,
      canRepay: profession.homeMortgage.total > 0
    },
    schoolLoans: {
      id: 'schoolLoans',
      name: '학자금 대출 (School Loans)',
      totalAmount: profession.schoolLoans.total,
      monthlyExpense: profession.schoolLoans.expense,
      canRepay: profession.schoolLoans.total > 0
    },
    carLoans: {
      id: 'carLoans',
      name: '자동차 대출 (Car Loans)',
      totalAmount: profession.carLoans.total,
      monthlyExpense: profession.carLoans.expense,
      canRepay: profession.carLoans.total > 0
    },
    creditCard: {
      id: 'creditCard',
      name: '신용카드 빚 (Credit Card)',
      totalAmount: profession.creditCard.total,
      monthlyExpense: profession.creditCard.expense,
      canRepay: profession.creditCard.total > 0
    },
    retailDebt: {
      id: 'retailDebt',
      name: '소매금융/할부 빚 (Retail Debt)',
      totalAmount: profession.retailDebt.total,
      monthlyExpense: profession.retailDebt.expense,
      canRepay: profession.retailDebt.total > 0
    }
  };

  return {
    profession,
    cash: profession.savings,
    childrenCount: 0,
    bankLoan: 0,
    liabilities,
    stocks: [],
    realEstates: [],
    currentSpaceIndex: 0,
    charityTurnsLeft: 0,
    downsizedTurnsLeft: 0,
    turnCount: 0,
    hasWon: false,
    gameLogs: [
      {
        id: 'init_1',
        turn: 0,
        message: `${profession.nameKo}(${profession.name}) 직업으로 쥐경주 보드게임을 시작했습니다. (초기 저축액: ${formatCurrency(profession.savings)})`,
        type: 'info',
        timestamp: new Date().toLocaleTimeString()
      }
    ]
  };
}

export function calculatePassiveIncome(state: PlayerState): number {
  const stockDividends = state.stocks.reduce((sum, stock) => {
    return sum + stock.shares * stock.dividendPerShare;
  }, 0);

  const realEstateCashflow = state.realEstates.reduce((sum, re) => {
    return sum + re.cashflow;
  }, 0);

  return Math.round(stockDividends + realEstateCashflow);
}

export function calculateTotalIncome(state: PlayerState): number {
  return state.profession.salary + calculatePassiveIncome(state);
}

export function calculateTotalExpenses(state: PlayerState): number {
  const { profession, childrenCount, bankLoan, liabilities } = state;
  const taxes = profession.taxes;
  const otherExpenses = profession.otherExpenses;
  const childExpenses = childrenCount * profession.childCostPerChild;
  const bankLoanInterest = (bankLoan / 1000) * 100;

  const liabExpenses = Object.values(liabilities).reduce((sum, item) => {
    return sum + item.monthlyExpense;
  }, 0);

  return Math.round(taxes + otherExpenses + childExpenses + bankLoanInterest + liabExpenses);
}

export function calculateMonthlyCashflow(state: PlayerState): number {
  return calculateTotalIncome(state) - calculateTotalExpenses(state);
}

export function checkHasEscapedRatRace(state: PlayerState): boolean {
  const passiveIncome = calculatePassiveIncome(state);
  const totalExpenses = calculateTotalExpenses(state);
  return passiveIncome > 0 && passiveIncome >= totalExpenses;
}

export function formatCurrency(amount: number): string {
  const won = Math.round(Math.abs(amount) * 1000);
  const sign = amount < 0 ? '-' : '';
  if (won === 0) return '0원';

  const eok = Math.floor(won / 100_000_000);
  const rem1 = won % 100_000_000;
  const man = Math.floor(rem1 / 10_000);
  const rem2 = rem1 % 10_000;

  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok}억`);
  if (man > 0) parts.push(`${man.toLocaleString()}만`);
  if (rem2 > 0) parts.push(rem2.toLocaleString());

  return `${sign}${parts.join(' ')}원`;
}
