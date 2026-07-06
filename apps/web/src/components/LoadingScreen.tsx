'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AppBrand from '@/components/AppBrand';

const MESSAGES_DEFAULT = [
  '오늘의 기록이 내일의 자산이 됩니다.',
  '작은 절약이 쌓여 큰 부를 만듭니다.',
  '부자는 습관에서 시작됩니다.',
];

const MESSAGES_WAKING = [
  '서버를 깨우는 중이에요...',
  '잠든 서버에 신호를 보내는 중...',
  '곧 연결될 거예요, 조금만 기다려주세요...',
];

export default function LoadingScreen({
  waking = false,
  messages,
}: {
  waking?: boolean;
  messages?: string[];
}) {
  const [msgIdx, setMsgIdx] = useState(0);
  const resolvedMessages = waking ? MESSAGES_WAKING : (messages ?? MESSAGES_DEFAULT);

  useEffect(() => {
    setMsgIdx(0);
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % resolvedMessages.length), 2200);
    return () => clearInterval(t);
  }, [waking, resolvedMessages.length]);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-800 font-sans">
      {/* Grid paper background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e5e0_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-sm mx-4 text-center px-6"
      >
        <div className="mb-10">
          <AppBrand />
        </div>

        {/* Rotating messages */}
        <div className="h-6 overflow-hidden mb-6 relative w-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIdx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
              className="text-xs text-stone-500 font-mono tracking-wide"
            >
              ✏️ {resolvedMessages[msgIdx]}
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
