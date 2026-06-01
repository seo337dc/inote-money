import { Gamepad2 } from "lucide-react";

export default function MiniGamePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-6">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
        <Gamepad2 size={30} className="text-orange-400" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-1">미니게임</h2>
        <p className="text-sm text-gray-400">캐시 플로우 보드게임으로 재무 감각을 키워요</p>
        <p className="text-xs text-gray-300 mt-4">준비 중입니다</p>
      </div>
    </div>
  );
}
