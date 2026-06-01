const fmt = (n: number) =>
  n.toLocaleString("ko-KR") + "원";

type Props = {
  salary: number;
  totalExpense: number;
  remaining: number;
  bankBalance: number;
};

export default function SummaryCards({ salary, totalExpense, remaining, bankBalance }: Props) {
  const cards = [
    {
      label: "이번달 월급",
      value: fmt(salary),
      valueColor: "text-green-600",
      bg: "bg-green-50",
      icon: "💰",
    },
    {
      label: "총 지출",
      value: fmt(totalExpense),
      valueColor: "text-gray-900",
      bg: "bg-white",
      icon: "📊",
    },
    {
      label: "남은 금액",
      value: fmt(Math.abs(remaining)),
      valueColor: remaining >= 0 ? "text-green-600" : "text-red-500",
      bg: "bg-white",
      icon: remaining >= 0 ? "💳" : "⚠️",
      prefix: remaining < 0 ? "-" : "",
    },
    {
      label: "현금통장 잔액",
      value: fmt(bankBalance),
      valueColor: "text-blue-600",
      bg: "bg-blue-50",
      icon: "🏦",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} rounded-2xl p-4 border border-gray-100 shadow-sm`}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">{card.icon}</span>
            <span className="text-xs text-gray-500 font-medium">{card.label}</span>
          </div>
          <p className={`text-base font-bold ${card.valueColor} leading-tight`}>
            {card.prefix}{card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
