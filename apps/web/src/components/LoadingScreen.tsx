'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool } from 'lucide-react';

const MESSAGES_NORMAL = [
  '자산 데이터를 불러오는 중...',
  '금융 정보를 정리하는 중...',
  '잠시만 기다려주세요...',
];

const MESSAGES_WAKING = [
  '서버를 깨우는 중이에요...',
  '잠든 서버에 신호를 보내는 중...',
  '곧 연결될 거예요, 조금만 기다려주세요...',
];

export default function LoadingScreen({ waking = false }: { waking?: boolean }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = waking ? MESSAGES_WAKING : MESSAGES_NORMAL;

  useEffect(() => {
    setMsgIdx(0);
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 2200);
    return () => clearInterval(t);
  }, [waking, messages.length]);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-800 font-sans">
      {/* Grid paper background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e5e0_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-sm mx-4 text-center px-6"
      >
        {/* Flipping memo animation */}
        <div className="relative w-24 h-24 mx-auto mb-10 flex items-center justify-center">
          <div className="absolute w-20 h-24 bg-stone-200 border border-stone-300 rounded-lg transform rotate-6 shadow-sm" />
          <div className="absolute w-20 h-24 bg-stone-100 border border-stone-300 rounded-lg transform -rotate-3 shadow-md" />
          <motion.div
            className="absolute w-20 h-24 bg-white border-2 border-stone-800 rounded-lg shadow-lg p-2.5 flex flex-col justify-between"
            animate={{ rotateY: [0, 180, 0], transformOrigin: 'left center' }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
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
          </motion.div>
        </div>

        {/* Brand title */}
        <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-stone-900 font-serif italic flex items-center justify-center gap-1">
          <span className="text-stone-400 font-light not-italic font-sans text-xl mr-1">i</span>
          <span>Note Money</span>
        </h1>

        {/* Rotating messages */}
        <div className="h-6 overflow-hidden mb-6 relative w-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${waking}-${msgIdx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
              className="text-xs text-stone-500 font-mono tracking-wide"
            >
              ✏️ {messages[msgIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Shimmer progress bar */}
        <div className="relative w-full h-1 bg-stone-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 h-full w-2/5 rounded-full bg-emerald-500"
            animate={{ x: ['-100%', '250%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
