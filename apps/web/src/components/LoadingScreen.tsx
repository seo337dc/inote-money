'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AppBrand from '@/components/AppBrand';

const MESSAGES_DEFAULT = [
  '오늘의 기록이 내일의 자산이 됩니다.',
  '작은 절약이 쌓여 큰 부를 만듭니다.',
  '부자는 습관에서 시작됩니다.',
];

type Props = {
  messages?: string[];
  status?: 'connecting' | 'waking' | 'failed';
  attempt?: number;
  elapsed?: number;
  onRetry?: () => void;
};

export default function LoadingScreen({ messages, status, attempt, elapsed = 0, onRetry }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const displayMessages = messages ?? MESSAGES_DEFAULT;

  useEffect(() => {
    if (status === 'failed' || status === 'waking') return;
    setMsgIdx(0);
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % displayMessages.length), 2200);
    return () => clearInterval(t);
  }, [status, displayMessages.length]);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-800 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e5e0_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-sm mx-4 text-center px-6"
      >
        <div className="mb-10">
          <AppBrand />
        </div>

        {status === 'failed' ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-stone-700">서버에 연결할 수 없어요</p>
            <p className="text-xs text-stone-400">잠시 후 다시 시도해주세요</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 px-5 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                다시 시도
              </button>
            )}
          </div>
        ) : status === 'waking' ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-stone-700">서버가 잠들어 있어요</p>
            <p className="text-xs text-stone-500">깨우는 중이에요. 보통 30~60초 걸려요.</p>
            <p className="text-xs text-stone-400 font-mono mt-1">
              {elapsed}초 경과 · {attempt}번째 시도
            </p>
            <div className="relative w-full h-1 bg-stone-200 rounded-full overflow-hidden mt-4">
              <motion.div
                className="absolute top-0 h-full w-2/5 rounded-full bg-emerald-500"
                animate={{ x: ['-100%', '250%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="h-6 overflow-hidden mb-6 relative w-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={status === 'connecting' ? 'connecting' : msgIdx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs text-stone-500 font-mono tracking-wide"
                >
                  ✏️ {status === 'connecting' ? '서버에 연결하는 중...' : displayMessages[msgIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="relative w-full h-1 bg-stone-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 h-full w-2/5 rounded-full bg-emerald-500"
                animate={{ x: ['-100%', '250%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
