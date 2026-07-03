'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  ArrowLeft, 
  Copy, 
  Check, 
  Lock, 
  FileText, 
  BookOpen, 
  TrendingUp,
  Cpu,
  Coins
} from 'lucide-react';

// The path to the generated brand logo
const brandLogo = "/src/assets/images/inote_money_logo_1783062074697.jpg";

interface LoadingScreenLightProps {
  onBackToOption1?: () => void;
}

type LightLoaderType = 'modern-ring' | 'bouncing-dots' | 'sliding-line' | 'minimal-spinner';

export default function LoadingScreenLight({ onBackToOption1 }: LoadingScreenLightProps) {
  const [loaderType, setLoaderType] = useState<LightLoaderType>('modern-ring');
  const [progress, setProgress] = useState(0);
  const [currentMsgIdx, setCurrentMsgIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [accentColor, setAccentColor] = useState('#16a34a'); // Default Green

  const messages = [
    '지능형 자산 장부 파싱 모듈 로드 중...',
    '작성된 지출/수입 메모 데이터 해석 중...',
    '실시간 카테고리 태그 분류 중 (식비, 카페, 수입)...',
    '이번 달 권장 예산 잔액 대조 분석 중...',
    '안전한 로컬 AES-256 금융 원장 동기화 완료!',
  ];

  // Simulated auto-incrementing progress for demo purposes
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0; // Loop progress for continuous demo
        }
        return prev + Math.random() * 5 + 1.5;
      });
    }, 120);

    const messageInterval = setInterval(() => {
      setCurrentMsgIdx((prev) => (prev + 1) % messages.length);
    }, 2200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  const getCodeSnippet = () => {
    return `import React, { useState, useEffect } from 'react';

export default function iNoteLoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  
  const messages = [
    '지능형 자산 장부 파싱 모듈 로드 중...',
    '작성된 지출/수입 메모 데이터 해석 중...',
    '실시간 카테고리 태그 분류 중 (식비, 카페, 수입)...',
    '이번 달 권장 예산 잔액 대조 분석 중...',
    '안전한 로컬 AES-256 금융 원장 동기화 완료!'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 2.5));
    }, 100);

    const msgTimer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(msgTimer);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f9fafb] font-sans antialiased text-gray-900 px-6">
      {/* Top Sliding Progress Indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden bg-gray-100">
        <div 
          className="h-full bg-[#16a34a] transition-all duration-300 ease-out"
          style={{ width: \`\${progress}%\` }}
        />
      </div>

      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        {/* Brand Logo with circular pulse shadow */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#16a34a]/10 blur-xl scale-110 animate-pulse" />
          <img 
            src="/assets/images/inote_money_logo.jpg" 
            alt="iNote Money Logo" 
            className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg relative z-10"
            onError={(e) => {
              // Fallback to emoji if image is missing
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.classList.remove('hidden');
              }
            }}
          />
          <div className="hidden w-20 h-20 rounded-2xl bg-green-50 border-2 border-green-200 shadow-md flex items-center justify-center text-3xl z-10">
            💰
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[21px] font-extrabold text-gray-900 tracking-tight">iNote Money</span>
          </div>
          <p className="text-sm font-medium text-gray-500">자산을 스마트하게 정리하는 중이에요</p>
        </div>

        {/* Dynamic parsing feedback */}
        <div className="h-5 text-xs text-green-700 font-mono tracking-wide font-medium bg-green-50/70 border border-green-100/50 px-3.5 py-1 rounded-full animate-pulse">
          {messages[msgIdx]}
        </div>

        {/* Loading Spinner */}
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#16a34a]"></div>
      </div>
    </div>
  );
}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between font-sans">
      
      {/* Control Navigation Header */}
      <div className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-40 sticky top-0">
        <div className="flex items-center gap-3">
          {onBackToOption1 && (
            <button
              onClick={onBackToOption1}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm transition flex items-center gap-1.5 hover:border-gray-300"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-gray-500" />
              <span>화려한 다크 1안</span>
            </button>
          )}
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
              <span>iNote 밝은 2안 스튜디오</span>
              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">BRAND NEW</span>
            </h2>
            <p className="text-[11px] text-gray-500">생성된 브랜드 로고 이미지와 토스/뱅크샐러드 풍 미니멀리즘 디자인</p>
          </div>
        </div>

        {/* Accent Color Pickers */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">포인트 컬러:</span>
          {[
            { id: '#16a34a', bg: 'bg-green-600', label: 'Classic Green' },
            { id: '#059669', bg: 'bg-emerald-600', label: 'Emerald' },
            { id: '#2563eb', bg: 'bg-blue-600', label: 'Toss Blue' },
            { id: '#4f46e5', bg: 'bg-indigo-600', label: 'Indigo' },
            { id: '#d97706', bg: 'bg-amber-600', label: 'Amber' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setAccentColor(c.id)}
              className={`w-6 h-6 rounded-full ${c.bg} transition-all relative flex items-center justify-center ${accentColor === c.id ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-85 hover:opacity-100'}`}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* DYNAMIC VISUAL DEMO SPACE */}
      <div className="relative flex-1 flex flex-col items-center justify-center bg-[#f9fafb] py-20 px-6 overflow-hidden">
        
        {/* Sliding line loader (Option C) */}
        {loaderType === 'sliding-line' && (
          <div className="absolute top-0 left-0 right-0 h-1.5 overflow-hidden bg-gray-100">
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ 
                backgroundColor: accentColor,
                width: `${progress}%`
              }}
            />
          </div>
        )}

        <div className="flex flex-col items-center gap-7 max-w-sm text-center relative z-10">
          
          {/* Logo container with micro float physics effect */}
          <div className="relative group select-none">
            {/* Soft backdrop blur halo */}
            <div 
              className="absolute inset-0 rounded-3xl blur-2xl opacity-20 scale-125 transition-all duration-700 animate-pulse"
              style={{ backgroundColor: accentColor }}
            />
            
            {/* Generated brand logo frame */}
            <div className="relative p-1 bg-white rounded-3xl border border-gray-100 shadow-[0_12px_40px_rgba(0,0,0,0.06)] transform transition duration-500 hover:scale-105">
              <img 
                src="" 
                alt="iNote Money Logo" 
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-2xl object-cover border border-gray-50 shadow-inner"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  // Reveal emoji fallback if needed
                  const fallback = document.getElementById('emoji-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              
              {/* Emoji Fallback */}
              <div 
                id="emoji-fallback" 
                className="hidden w-24 h-24 rounded-2xl bg-green-50 border-2 border-green-200 shadow-sm flex items-center justify-center text-4xl"
              >
                💰
              </div>

              {/* Secure tag */}
              <div className="absolute -bottom-2 -right-2 bg-white px-2 py-0.5 rounded-full text-[8px] font-mono border border-gray-200 shadow font-bold text-gray-500 tracking-wider flex items-center gap-0.5">
                <Lock className="w-2 h-2 text-green-600" />
                <span>SSL</span>
              </div>
            </div>
          </div>

          {/* Title and descriptions */}
          <div className="space-y-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 font-sans flex items-center justify-center gap-1">
              <span>iNote Money</span>
            </h1>
            <p className="text-sm font-semibold text-gray-500">자산을 스마트하게 정리하는 중이에요</p>
          </div>

          {/* DYNAMIC SUBTLE FEEDBACK LOGS */}
          <div className="h-9 flex items-center justify-center">
            <div 
              className="px-4 py-1.5 rounded-full text-xs font-semibold font-mono border tracking-wide transition-all duration-500 animate-pulse flex items-center gap-1.5"
              style={{ 
                color: accentColor, 
                backgroundColor: `${accentColor}08`,
                borderColor: `${accentColor}1c`
              }}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>{messages[currentMsgIdx]}</span>
            </div>
          </div>

          {/* PROGRESS INDICATORS (Type Switcher) */}
          <div className="w-full pt-4">
            {loaderType === 'modern-ring' && (
              <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="24" className="stroke-gray-100" strokeWidth="4" fill="transparent" />
                  <circle 
                    cx="28" cy="28" r="24" 
                    stroke={accentColor} 
                    strokeWidth="4" 
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 24}
                    strokeDashoffset={2 * Math.PI * 24 * (1 - progress / 100)}
                    className="transition-all duration-300 ease-out"
                  />
                </svg>
                <div className="absolute text-[10px] font-bold font-mono text-gray-700">
                  {Math.round(progress)}%
                </div>
              </div>
            )}

            {loaderType === 'bouncing-dots' && (
              <div className="flex items-center justify-center gap-2 h-8">
                {[0, 1, 2].map((i) => (
                  <div 
                    key={i}
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: accentColor,
                      animation: 'bounce 1.2s infinite ease-in-out',
                      animationDelay: `${i * 0.15}s`
                    }}
                  />
                ))}
              </div>
            )}

            {loaderType === 'minimal-spinner' && (
              <div className="h-8 flex items-center justify-center">
                <div 
                  className="h-7 w-7 rounded-full border-3 border-gray-100"
                  style={{
                    borderTopColor: accentColor,
                    animation: 'spin 0.8s infinite linear'
                  }}
                />
              </div>
            )}

            {loaderType === 'sliding-line' && (
              <div className="text-[11px] font-mono text-gray-400 font-bold">
                원장 불러오는 중... {Math.round(progress)}%
              </div>
            )}
          </div>
        </div>

        {/* Dynamic bottom selector */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur border border-gray-200 px-4 py-2 rounded-2xl shadow-md flex items-center gap-2">
          <span className="text-[10px] font-extrabold text-gray-500 mr-2 border-r border-gray-200 pr-2">로딩 애니메이션 스타일:</span>
          {(['modern-ring', 'bouncing-dots', 'sliding-line', 'minimal-spinner'] as LightLoaderType[]).map((type) => (
            <button
              key={type}
              onClick={() => setLoaderType(type)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${loaderType === type ? 'text-white' : 'text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100'}`}
              style={{ backgroundColor: loaderType === type ? accentColor : undefined }}
            >
              {type === 'modern-ring' && '원형 게이지'}
              {type === 'bouncing-dots' && '바운싱 점'}
              {type === 'sliding-line' && '진행 바'}
              {type === 'minimal-spinner' && '스피너'}
            </button>
          ))}
        </div>
      </div>

      {/* SOURCE EXPORTER FOOTER */}
      <div className="bg-gray-950 text-gray-300 p-6 border-t border-gray-800 z-40">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-green-500/20 text-green-400 font-mono px-2 py-0.5 rounded font-bold uppercase">React Code Export</span>
                <span className="text-xs text-gray-400">Next.js/React에 바로 탑재 가능한 완벽한 소스코드</span>
              </div>
              <p className="text-[11px] text-gray-500">생성된 인공지능 브랜드 로고 이미지 경로(/assets/images/inote_money_logo.jpg)가 자동 매핑되어 있습니다.</p>
            </div>
            
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition active:scale-95 shrink-0"
              style={{ backgroundColor: accentColor === '#16a34a' ? '#22c55e' : accentColor }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '복사 완료!' : '컴포넌트 코드 복사'}</span>
            </button>
          </div>

          <pre className="bg-black/60 p-4 rounded-xl border border-gray-850 text-[11px] font-mono overflow-x-auto max-h-[160px] text-gray-400 leading-relaxed scrollbar-thin">
            {getCodeSnippet()}
          </pre>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-4px); }
          50% { transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
}
