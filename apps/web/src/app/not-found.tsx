'use client';

import Link from 'next/link';
import { PenTool } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-800 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e5e0_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none" />

      <div className="z-10 w-full max-w-sm mx-4 text-center px-6 flex flex-col items-center gap-8">
        {/* Brand */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute w-20 h-24 bg-stone-200 border border-stone-300 rounded-lg transform rotate-6 shadow-sm" />
          <div className="absolute w-20 h-24 bg-stone-100 border border-stone-300 rounded-lg transform -rotate-3 shadow-md" />
          <div className="absolute w-20 h-24 bg-white border-2 border-stone-800 rounded-lg shadow-lg p-2.5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="w-full h-2 bg-stone-800/20 rounded" />
              <div className="w-5/6 h-2 bg-stone-800/20 rounded" />
              <div className="w-4/6 h-2 rounded bg-emerald-500/20" />
            </div>
            <div className="flex justify-between items-center mt-auto">
              <div className="w-4 h-4 rounded-full border border-stone-800/30 flex items-center justify-center text-[8px] font-bold">
                ₩
              </div>
              <PenTool className="w-3 h-3 text-stone-400" />
            </div>
          </div>
        </div>

        {/* 404 */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-7xl font-extrabold text-stone-200 tracking-tight select-none">404</p>
          <p className="text-base font-semibold text-stone-700">페이지를 찾을 수 없어요</p>
          <p className="text-sm text-stone-400">주소가 잘못됐거나 삭제된 페이지예요.</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/dashboard"
            className="w-full py-2.5 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors text-center"
          >
            대시보드로 이동
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 rounded-full border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-100 transition-colors text-center"
          >
            홈으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
