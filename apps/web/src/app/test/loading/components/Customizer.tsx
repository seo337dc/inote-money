'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Palette, 
  Zap, 
  MessageSquare, 
  Layers, 
  Play, 
  Code, 
  Copy, 
  Check, 
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { LoaderConfig, LoaderStyle } from '../types';

interface CustomizerProps {
  config: LoaderConfig;
  onChangeConfig: (newConfig: LoaderConfig) => void;
  onTriggerLoading: () => void;
}

export default function Customizer({ config, onChangeConfig, onTriggerLoading }: CustomizerProps) {
  const [copied, setCopied] = useState(false);
  const [customMsgInput, setCustomMsgInput] = useState('');
  const [activeTab, setActiveTab] = useState<'settings' | 'code'>('settings');

  // Available options
  const styles: { id: LoaderStyle; label: string; desc: string }[] = [
    { id: 'glassmorphic', label: '✨ Glassmorphic Ledger', desc: '유려한 블러, 빛나는 구형 서클, 세련된 하이테크 스타일' },
    { id: 'minimal-memo', label: '✏️ Minimal Memo Book', desc: '아날로그 플립 애니메이션, 텍스처 그리드 종이, 서정적인 무드' },
    { id: 'organic-flow', label: '🌊 Organic Emerald Blob', desc: '유동적인 자연 액체 형태의 모핑, 마인드풀니스 소비 습관 유도' },
  ];

  const colors = [
    { id: 'emerald', label: 'Emerald Mint', bg: 'bg-emerald-500' },
    { id: 'indigo', label: 'Electric Indigo', bg: 'bg-indigo-500' },
    { id: 'rose', label: 'Coral Rose', bg: 'bg-rose-500' },
    { id: 'amber', label: 'Luxury Amber', bg: 'bg-amber-500' },
    { id: 'sky', label: 'Sky Turquoise', bg: 'bg-sky-500' },
  ];

  const handleStyleChange = (style: LoaderStyle) => {
    onChangeConfig({ ...config, style });
  };

  const handleColorChange = (color: string) => {
    onChangeConfig({ ...config, primaryColor: color });
  };

  const handleAddMessage = () => {
    if (!customMsgInput.trim()) return;
    onChangeConfig({
      ...config,
      customMessages: [...config.customMessages, customMsgInput.trim()],
    });
    setCustomMsgInput('');
  };

  const handleResetMessages = () => {
    onChangeConfig({
      ...config,
      customMessages: [
        '암호화된 금융 원장 연결 중...',
        '오늘의 수입/지출 메모 파싱 중...',
        '소비 태그 및 카테고리 분석 중...',
        '이번 달 자산 변동 리포트 계산 완료!',
      ],
    });
  };

  const handleCopyCode = () => {
    const codeSnippet = `
/* ==========================================
   iNote Money Loading Screen Integration
   ========================================== */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Sparkles, Lock } from 'lucide-react';

export default function FinanceLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  
  const messages = [
    "암호화된 금융 원장 연결 중...",
    "오늘의 수입/지출 메모 파싱 중...",
    "소비 태그 및 카테고리 분석 중...",
    "이번 달 자산 변동 리포트 계산 완료!"
  ];

  useEffect(() => {
    // 1. Progress Counter Sequence
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (onComplete) setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 4 + 1.5;
      });
    }, 100);

    // 2. Message Rotator Sequence
    const msgTimer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 1800);

    return () => {
      clearInterval(timer);
      clearInterval(msgTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100 overflow-hidden">
      {/* Dynamic Glassmorphic Ring */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl text-center flex flex-col items-center"
      >
        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="54" className="stroke-slate-800" strokeWidth="6" fill="transparent" />
            <motion.circle
              cx="64" cy="64" r="54" stroke="#10b981" strokeWidth="6" fill="transparent"
              strokeDasharray={2 * Math.PI * 54}
              animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - progress / 100) }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Coins className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">iNote Money</h1>
        <AnimatePresence mode="wait">
          <motion.p key={msgIdx} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="text-xs text-slate-400">
            {messages[msgIdx]}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}`;

    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800 p-6 shadow-2xl">
      <div className="max-w-6xl mx-auto">
        
        {/* Workspace Title bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase font-mono">Interactive Design Lab</span>
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5 mt-1">
              <span>아이노트 머니 로딩화면 스튜디오</span>
              <Sparkles className="w-4.5 h-4.5 text-yellow-400" />
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">상상의 아이디어를 실제 프로덕트 레벨의 디자인으로 빌드하고 파라미터를 조절해보세요.</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {/* Run simulate button */}
            <button
              onClick={onTriggerLoading}
              className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 hover:brightness-110"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>로딩 시뮬레이션 시작</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 border-b border-slate-900/40 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('settings')}
            className={`text-xs font-bold pb-1.5 transition-all relative ${activeTab === 'settings' ? 'text-white border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <span className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              <span>디자인 파라미터 조절</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`text-xs font-bold pb-1.5 transition-all relative ${activeTab === 'code' ? 'text-white border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <span className="flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              <span>React 컴포넌트 코드 추출</span>
            </span>
          </button>
        </div>

        {activeTab === 'settings' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Template Card Selection (5/12) */}
            <div className="md:col-span-5 space-y-3">
              <label className="text-xs font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>로딩 비주얼 템플릿 스타일</span>
              </label>
              <div className="space-y-2">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleChange(style.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1 ${config.style === style.id ? 'bg-slate-900 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.06)]' : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'}`}
                  >
                    <span className="text-xs font-bold text-white">{style.label}</span>
                    <span className="text-[10px] text-slate-400 leading-relaxed">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Customizer settings items (7/12) */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Accents, Speed, and Switches */}
              <div className="space-y-5">
                {/* Accent Color selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    <span>브랜드 테마 컬러</span>
                  </label>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleColorChange(color.id)}
                        className={`w-7 h-7 rounded-full ${color.bg} transition-all relative flex items-center justify-center active:scale-95`}
                        title={color.label}
                      >
                        {config.primaryColor === color.id && (
                          <motion.div 
                            layoutId="activeColor"
                            className="w-4 h-4 rounded-full bg-slate-950 border-2 border-white flex items-center justify-center"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Multiplier slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>로딩 속도 (배속)</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">{config.speedMultiplier.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.5"
                    value={config.speedMultiplier}
                    onChange={(e) => onChangeConfig({ ...config, speedMultiplier: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Particle / autoDismiss Toggles */}
                <div className="space-y-3.5 pt-1">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-all">🪙 입체적 금융 입자 시뮬레이션</span>
                      <p className="text-[9px] text-slate-500 mt-0.5">동전 및 노트 기호가 수직 상승하는 파티클 효과</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.showParticles}
                      onChange={(e) => onChangeConfig({ ...config, showParticles: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 relative" />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-all">⚡ 대시보드로 자동 진입 (Auto-dismiss)</span>
                      <p className="text-[9px] text-slate-500 mt-0.5">로딩이 100% 완료되면 자동으로 화면이 슬라이드 아웃</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.autoDismiss}
                      onChange={(e) => onChangeConfig({ ...config, autoDismiss: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 relative" />
                  </label>
                </div>
              </div>

              {/* Message queue list */}
              <div className="space-y-3">
                <label className="text-xs font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>로딩 중 교체 멘트 목록</span>
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customMsgInput}
                    onChange={(e) => setCustomMsgInput(e.target.value)}
                    placeholder="추가하고 싶은 문구를 적으세요"
                    className="flex-1 bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl outline-none focus:border-slate-700 text-white"
                  />
                  <button
                    onClick={handleAddMessage}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white border border-slate-700 hover:border-slate-600 transition"
                  >
                    추가
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-3 max-h-[140px] overflow-y-auto space-y-1.5 scrollbar-thin">
                  {config.customMessages.map((msg, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] text-slate-300 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
                      <span className="truncate pr-2">{msg}</span>
                      <button
                        onClick={() => {
                          onChangeConfig({
                            ...config,
                            customMessages: config.customMessages.filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  {config.customMessages.length === 0 && (
                    <div className="text-center text-[10px] text-slate-600 py-3">메시지가 존재하지 않습니다.</div>
                  )}
                </div>

                <button
                  onClick={handleResetMessages}
                  className="w-full text-right text-[10px] text-slate-500 hover:text-slate-300 transition block"
                >
                  기본 문구셋으로 초기화
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-t-2xl border-t border-x border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded font-bold uppercase">React Component</span>
                <span className="text-xs text-slate-400">Vite / Next.js 프로젝트에서 바로 쓸 수 있는 컴포넌트입니다.</span>
              </div>
              
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 hover:border-slate-600 transition flex items-center gap-1.5 active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '복사 완료!' : '전체 소스코드 복사'}</span>
              </button>
            </div>
            <pre className="bg-zinc-950 border-b border-x border-slate-850 p-5 rounded-b-2xl text-xs font-mono overflow-x-auto max-h-[350px] text-slate-300 leading-relaxed scrollbar-thin">
              {`// 로딩 화면 코드 복사 및 연동 안내:
// 1. 'framer-motion' 대신 'motion' 패키지를 사용하고 있는 경우, 'import { motion } from "motion/react"'로 가져옵니다.
// 2. 부모 컴포넌트에서 로딩 상태(isLoading)를 관리하여, 로딩이 종료되면 대시보드를 드러내도록 설계하면 됩니다.

`}
              {`import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Sparkles, Lock } from 'lucide-react';

export default function FinanceLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  
  const messages = [
    "암호화된 금융 원장 연결 중...",
    "오늘의 수입/지출 메모 파싱 중...",
    "소비 태그 및 카테고리 분석 중...",
    "이번 달 자산 변동 리포트 계산 완료!"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (onComplete) setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 4 + 1.5;
      });
    }, 100);

    const msgTimer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 1800);

    return () => {
      clearInterval(timer);
      clearInterval(msgTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl text-center flex flex-col items-center">
        {/* Circle Ring */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="54" className="stroke-slate-800" strokeWidth="6" fill="transparent" />
            <motion.circle
              cx="64" cy="64" r="54" stroke="#10b981" strokeWidth="6" fill="transparent"
              strokeDasharray={2 * Math.PI * 54}
              animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - progress / 100) }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Coins className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">iNote Money</h1>
        <AnimatePresence mode="wait">
          <motion.p key={msgIdx} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="text-xs text-slate-400">
            {messages[msgIdx]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}`}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
