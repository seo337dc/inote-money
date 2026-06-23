import { GraduationCap } from "lucide-react";

export default function FinancialKnowledgePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-6">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
        <GraduationCap size={30} className="text-violet-400" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-1">금융 지식</h2>
        <p className="text-sm text-gray-400">경제 용어와 추천 책을 정리해요</p>
        <p className="text-xs text-gray-300 mt-4">준비 중입니다</p>
      </div>
    </div>
  );
}
