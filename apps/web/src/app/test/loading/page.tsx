'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoaderConfig } from './types';
import LoadingScreens from './components/LoadingScreens';
import Customizer from './components/Customizer';
import Dashboard from './components/Dashboard';

const INITIAL_CONFIG: LoaderConfig = {
  style: 'glassmorphic',
  primaryColor: 'emerald',
  brandName: 'iNote Money',
  speedMultiplier: 1.0,
  showParticles: true,
  autoDismiss: true,
  dismissDelay: 800,
  customMessages: [
    '암호화된 금융 원장 연결 중...',
    '오늘의 수입/지출 메모 파싱 중...',
    '소비 태그 및 카테고리 분석 중...',
    '이번 달 자산 변동 리포트 계산 완료!',
  ],
};

export default function TestLoadingPage() {
  const [config, setConfig] = useState<LoaderConfig>(INITIAL_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLoadingSimulation = () => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (messageTimerRef.current) clearInterval(messageTimerRef.current);

    setProgress(0);
    setCurrentMessageIndex(0);
    setIsLoading(true);

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        const step = (Math.random() * 5 + 2) * config.speedMultiplier;
        const next = prev + step;
        if (next >= 100) {
          if (progressTimerRef.current) clearInterval(progressTimerRef.current);
          if (config.autoDismiss) {
            setTimeout(() => setIsLoading(false), config.dismissDelay);
          }
          return 100;
        }
        return next;
      });
    }, 100);

    const messageInterval = 2000 / config.speedMultiplier;
    messageTimerRef.current = setInterval(() => {
      setCurrentMessageIndex((prev) => prev + 1);
    }, messageInterval);
  };

  useEffect(() => {
    startLoadingSimulation();
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
    };
  }, [config.style, config.speedMultiplier]);

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans selection:bg-green-200 selection:text-green-800">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-[#f8fafc]"
          >
            <LoadingScreens
              config={config}
              progress={progress}
              currentMessageIndex={currentMessageIndex}
            />
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setIsLoading(false)}
                className="px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium border border-gray-300 transition backdrop-blur-sm"
              >
                로딩 스킵 (Skip)
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="app-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="w-full"
          >
            <Customizer
              config={config}
              onChangeConfig={setConfig}
              onTriggerLoading={startLoadingSimulation}
            />
            <Dashboard
              primaryColor={config.primaryColor}
              onRestartLoader={startLoadingSimulation}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
