'use client';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-7">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-[26px]">
            💰
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[18px] font-medium text-gray-900 tracking-tight">iNote Money</span>
            <span className="text-[13px] text-gray-400">자산을 정리하는 중이에요</span>
          </div>
        </div>

        <div className="flex gap-1.5 items-center">
          <span className="w-[7px] h-[7px] rounded-full bg-green-600 animate-[bounce_1.2s_ease-in-out_infinite_0ms] opacity-30" />
          <span className="w-[7px] h-[7px] rounded-full bg-green-600 animate-[bounce_1.2s_ease-in-out_infinite_200ms] opacity-30" />
          <span className="w-[7px] h-[7px] rounded-full bg-green-600 animate-[bounce_1.2s_ease-in-out_infinite_400ms] opacity-30" />
        </div>
      </div>
    </div>
  );
}
