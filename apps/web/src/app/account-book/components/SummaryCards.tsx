const fmt = (n: number) => n.toLocaleString('ko-KR') + '원';

type Props = {
  salary: number;
  totalExpense: number;
  totalWaste: number;
};

export default function SummaryCards({ salary, totalExpense, totalWaste }: Props) {
  const remaining = salary - totalExpense;

  const cards = [
    {
      label: '이번달 월급',
      value: fmt(salary),
      valueColor: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: '총 지출',
      value: fmt(totalExpense),
      valueColor: 'text-gray-900 dark:text-white',
      bg: 'bg-white dark:bg-gray-800',
    },
    {
      label: salary > 0 ? (remaining >= 0 ? '남은 금액' : '초과 금액') : '낭비 금액',
      value: salary > 0 ? fmt(Math.abs(remaining)) : fmt(totalWaste),
      valueColor:
        salary > 0
          ? remaining >= 0
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-500 dark:text-red-400'
          : 'text-orange-500 dark:text-orange-400',
      bg:
        salary > 0
          ? remaining >= 0
            ? 'bg-white dark:bg-gray-800'
            : 'bg-red-50 dark:bg-red-900/20'
          : 'bg-orange-50 dark:bg-orange-900/20',
      prefix: salary > 0 && remaining < 0 ? '-' : '',
    },
    {
      label: '낭비 금액',
      value: fmt(totalWaste),
      valueColor: 'text-orange-500 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ].filter((_, i) => !(salary === 0 && i === 3));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm`}
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">{card.label}</p>
          <p className={`text-base font-bold ${card.valueColor} leading-tight`}>
            {'prefix' in card ? card.prefix : ''}{card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
