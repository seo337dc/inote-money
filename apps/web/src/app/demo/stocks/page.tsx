import { TrendingUp } from "lucide-react";

export default function StocksPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
        <TrendingUp size={30} className="text-emerald-400" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-1">주식</h2>
        <p className="text-sm text-gray-400">보유 종목과 수익률을 관리해요</p>
        <p className="text-xs text-gray-300 mt-4">준비 중입니다</p>
      </div>
    </div>
  );
}
