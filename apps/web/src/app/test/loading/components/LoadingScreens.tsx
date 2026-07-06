'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coins,
  Sparkles,
  TrendingUp,
  CheckCircle,
  PenTool,
  Lock,
} from 'lucide-react';
import { LoaderConfig, LoaderStyle } from '../types';

interface LoadingScreenProps {
  config: LoaderConfig;
  progress: number;
  currentMessageIndex: number;
  onComplete?: () => void;
}

// Particle generator helper
const generateParticles = (count: number, color: string) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 12 + 6,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
    emoji: ['🪙', '📝', '📊', '💳', '✨', '💸'][i % 6],
  }));
};

export default function LoadingScreens({ config, progress, currentMessageIndex, onComplete }: LoadingScreenProps) {
  const [particles] = useState(() => generateParticles(config.showParticles ? 15 : 0, config.primaryColor));
  const activeMessage = config.customMessages[currentMessageIndex % config.customMessages.length];

  // Map theme values to Tailwind color classes or inline colors
  const getColorHex = (colorName: string) => {
    switch (colorName) {
      case 'emerald': return '#10b981';
      case 'indigo': return '#6366f1';
      case 'rose': return '#f43f5e';
      case 'amber': return '#f59e0b';
      case 'sky': return '#0ea5e9';
      default: return '#10b981';
    }
  };

  const primaryColorHex = getColorHex(config.primaryColor);

  // Render different loader styles
  switch (config.style) {
    case 'glassmorphic':
      return (
        <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#f8fafc] text-slate-800">
          {/* Ambient Glowing Background */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.06] pointer-events-none transition-all duration-1000"
            style={{ backgroundColor: primaryColorHex }}
          />
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full blur-[100px] opacity-[0.04] pointer-events-none bg-indigo-500" />

          {/* Particles */}
          {config.showParticles && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute text-lg select-none filter drop-shadow-sm"
                  initial={{ opacity: 0, x: `${p.x}vw`, y: '110vh' }}
                  animate={{ 
                    opacity: [0, 0.6, 0.6, 0],
                    y: ['110vh', '-10vh'],
                    x: [`${p.x}vw`, `${p.x + (Math.random() * 10 - 5)}vw`]
                  }}
                  transition={{
                    duration: p.duration / config.speedMultiplier,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "easeOut"
                  }}
                >
                  {p.emoji}
                </motion.div>
              ))}
            </div>
          )}

          {/* Loader Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-10 w-full max-w-md mx-4 p-8 rounded-3xl border border-gray-200/90 bg-white/75 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-center flex flex-col items-center"
          >
            {/* Header Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border border-gray-200 bg-gray-50 mb-6 text-gray-500"
            >
              <Lock className="w-3 h-3 text-green-600" />
              <span>AES-256 SECURED LEDGER</span>
            </motion.div>

            {/* Circular Gauge Loader */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-8">
              {/* Outer Glow Ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className="stroke-gray-100"
                  strokeWidth="6"
                  fill="transparent"
                />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="62"
                  stroke={primaryColorHex}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 62}
                  animate={{ strokeDashoffset: 2 * Math.PI * 62 * (1 - progress / 100) }}
                  transition={{ ease: "easeInOut" }}
                />
              </svg>

              {/* Center Content with pulsing icon */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    filter: [`drop-shadow(0 0 2px ${primaryColorHex}00)`, `drop-shadow(0 0 6px ${primaryColorHex}33)`, `drop-shadow(0 0 2px ${primaryColorHex}00)`]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="p-3.5 rounded-2xl bg-white border border-gray-150 shadow-inner"
                >
                  <Coins className="w-8 h-8" style={{ color: primaryColorHex }} />
                </motion.div>
              </div>

              {/* Floating Percentage Indicator */}
              <motion.div 
                className="absolute -bottom-2 px-3 py-0.5 rounded-full text-xs font-bold font-mono tracking-wider border text-white shadow-md animate-bounce"
                style={{ backgroundColor: primaryColorHex, borderColor: 'rgba(255,255,255,0.2)' }}
              >
                {Math.round(progress)}%
              </motion.div>
            </div>

            {/* Brand Title */}
            <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-gray-900">
              {config.brandName}
            </h1>

            {/* Status Messages */}
            <div className="h-6 overflow-hidden mb-6 relative w-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentMessageIndex}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-gray-500 font-bold tracking-wide flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-yellow-500 shrink-0" />
                  {activeMessage}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Linear segment indicator */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex p-[1px] border border-gray-200">
              <motion.div 
                className="h-full rounded-full"
                style={{ backgroundColor: primaryColorHex }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeInOut" }}
              />
            </div>
            
            {/* Tech stats */}
            <div className="flex justify-between items-center w-full mt-4 text-[10px] font-mono text-gray-400 tracking-wider font-semibold">
              <span>PING: 12ms</span>
              <span>EST. TIME: {((100 - progress) * 0.04 / config.speedMultiplier).toFixed(1)}s</span>
              <span>VER: 1.4.2</span>
            </div>
          </motion.div>
        </div>
      );

    case 'minimal-memo':
      return (
        <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-800 font-sans">
          {/* Subtle grid paper background overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e5e0_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 w-full max-w-sm mx-4 text-center px-6"
          >
            {/* Minimalist flipping memo page animation */}
            <div className="relative w-24 h-24 mx-auto mb-10 flex items-center justify-center">
              {/* Back page shadows */}
              <div className="absolute w-20 h-24 bg-stone-200 border border-stone-300 rounded-lg transform rotate-6 shadow-sm" />
              <div className="absolute w-20 h-24 bg-stone-100 border border-stone-300 rounded-lg transform -rotate-3 shadow-md" />
              
              {/* Active Book/Memo Pad */}
              <motion.div 
                className="absolute w-20 h-24 bg-white border-2 border-stone-800 rounded-lg shadow-lg p-2.5 flex flex-col justify-between"
                animate={{
                  rotateY: [0, 180, 0],
                  transformOrigin: "left center"
                }}
                transition={{
                  duration: 2.5 / config.speedMultiplier,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Simulated memo lines */}
                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-stone-800/20 rounded" />
                  <div className="w-5/6 h-2 bg-stone-800/20 rounded" />
                  <div className="w-4/6 h-2 bg-stone-800/20 rounded" style={{ backgroundColor: `${primaryColorHex}33` }} />
                </div>
                
                {/* Tiny ledger symbol */}
                <div className="flex justify-between items-center mt-auto">
                  <div className="w-4 h-4 rounded-full border border-stone-800/30 flex items-center justify-center text-[8px] font-bold">
                    ₩
                  </div>
                  <PenTool className="w-3 h-3 text-stone-400" />
                </div>
              </motion.div>
            </div>

            {/* Handwriting brand Title */}
            <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-stone-900 font-serif italic flex items-center justify-center gap-1">
              <span className="text-stone-400 font-light not-italic font-sans text-xl mr-1">i</span>
              <span>{config.brandName.replace(/^i/, '')}</span>
            </h1>

            {/* Handwritten loader indicator text */}
            <div className="h-6 overflow-hidden mb-6 relative w-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentMessageIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="text-xs text-stone-500 font-mono tracking-wide"
                >
                  ✏️ {activeMessage}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Hand-drawn style Progress Line */}
            <div className="relative w-full h-1 bg-stone-200 rounded-full mb-2 overflow-hidden">
              <motion.div 
                className="absolute left-0 top-0 h-full rounded-full"
                style={{ backgroundColor: primaryColorHex }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>

            {/* Percentage Text with handwritten typewriter style */}
            <div className="flex justify-between text-[11px] font-mono text-stone-400">
              <span>수집 중...</span>
              <span className="font-bold text-stone-700">{Math.round(progress)}%</span>
            </div>
          </motion.div>
        </div>
      );

    case 'organic-flow':
      return (
        <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#f0fdf4] text-emerald-900 font-sans">
          {/* Breathing Organic Orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Soft backdrop blur waves */}
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.45] bg-emerald-200"
              animate={{
                x: ['-20%', '10%', '-20%'],
                y: ['-10%', '20%', '-10%'],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 12 / config.speedMultiplier, repeat: Infinity, ease: "easeInOut" }}
              style={{ left: '10%', top: '10%' }}
            />
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.45] bg-teal-100"
              animate={{
                x: ['20%', '-10%', '20%'],
                y: ['10%', '-20%', '10%'],
                scale: [1.1, 0.9, 1.1]
              }}
              transition={{ duration: 15 / config.speedMultiplier, repeat: Infinity, ease: "easeInOut" }}
              style={{ right: '5%', bottom: '15%' }}
            />
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="z-10 text-center px-4 max-w-sm flex flex-col items-center"
          >
            {/* Morphing Liquid Blob in center */}
            <div className="relative w-40 h-40 mb-12 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-emerald-300/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
              />

              {/* Dynamic Blob Shape */}
              <motion.div
                className="w-32 h-32 flex items-center justify-center relative shadow-[0_10px_35px_rgba(16,185,129,0.18)]"
                style={{
                  backgroundColor: primaryColorHex,
                  borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                }}
                animate={{
                  borderRadius: [
                    '60% 40% 30% 70% / 60% 30% 70% 40%',
                    '50% 60% 70% 30% / 50% 60% 30% 70%',
                    '40% 70% 60% 50% / 40% 50% 70% 60%',
                    '60% 40% 30% 70% / 60% 30% 70% 40%'
                  ],
                  scale: [1, 1.05, 0.97, 1]
                }}
                transition={{
                  duration: 6 / config.speedMultiplier,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Embedded Glowing Icon */}
                <TrendingUp className="w-12 h-12 text-white filter drop-shadow" />
              </motion.div>

              {/* Floating progress percentage */}
              <motion.div 
                className="absolute -bottom-4 bg-white text-emerald-950 font-bold px-4 py-1.5 rounded-full text-sm shadow-md tracking-wide flex items-center gap-1 border border-emerald-100"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>{Math.round(progress)}%</span>
              </motion.div>
            </div>

            {/* Brand Title */}
            <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-emerald-950">
              {config.brandName}
            </h1>

            {/* Peaceful and mindful loader messages */}
            <div className="h-6 overflow-hidden mb-8 relative w-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentMessageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-emerald-700/85 text-sm font-bold tracking-wide flex items-center gap-2"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {activeMessage}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Smooth continuous wave loader bar */}
            <div className="w-48 h-1.5 bg-emerald-100 rounded-full overflow-hidden relative border border-emerald-200/50">
              <motion.div 
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </div>
      );

    default:
      return null;
  }
}
