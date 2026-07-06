'use client';

import { PenTool } from 'lucide-react';

export default function AppBrand() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Stacked memo illustration */}
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

      {/* Brand title */}
      <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 font-serif italic flex items-center gap-1">
        <span className="text-stone-400 font-light not-italic font-sans text-lg">i</span>
        <span>Note Money</span>
      </h1>
    </div>
  );
}
