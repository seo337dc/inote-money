'use client';

import { useState, useEffect } from 'react';

const ACCENT_COLORS = [
  { label: 'Green', value: '#16a34a' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Indigo', value: '#4f46e5' },
  { label: 'Amber', value: '#d97706' },
];

const MESSAGES = [
  '서버 접속을 확인하는 중이에요...',
  '자산을 정리하는 중이에요...',
  '데이터를 불러오는 중이에요...',
  '잠깐만 기다려 주세요...',
];

// ── 1. Bouncing Dots (현재 사용 중) ─────────────────────────────────────
function BouncingDotsLoader({ color, message }: { color: string; message: string }) {
  return (
    <div className="flex flex-col items-center gap-7">
      <div className="flex flex-col items-center gap-2.5">
        <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-[26px]">
          💰
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[18px] font-medium text-gray-900 tracking-tight">iNote Money</span>
          <span className="text-[13px] text-gray-400">{message}</span>
        </div>
      </div>
      <div className="flex gap-1.5 items-center">
        {[0, 200, 400].map((delay) => (
          <span
            key={delay}
            className="w-[7px] h-[7px] rounded-full animate-bounce opacity-30"
            style={{ backgroundColor: color, animationDelay: `${delay}ms`, animationDuration: '1.2s' }}
          />
        ))}
      </div>
    </div>
  );
}

// ── 2. Ring Progress ────────────────────────────────────────────────────
function RingLoader({ color, message, progress }: { color: string; message: string; progress: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} stroke="#e5e7eb" strokeWidth="4" fill="none" />
          <circle
            cx="32" cy="32" r={r}
            stroke={color} strokeWidth="4" fill="none"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        <span className="absolute text-[22px]">💰</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[17px] font-medium text-gray-900 tracking-tight">iNote Money</span>
        <span className="text-[12px] text-gray-400">{message}</span>
      </div>
    </div>
  );
}

// ── 3. Top Sliding Bar ──────────────────────────────────────────────────
function SlidingBarLoader({ color, message, progress }: { color: string; message: string; progress: number }) {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gray-100 overflow-hidden rounded-t-xl">
        <div
          className="h-full rounded-full"
          style={{ width: `${progress}%`, backgroundColor: color, transition: 'width 0.3s ease' }}
        />
      </div>
      <div className="flex flex-col items-center gap-5 mt-4">
        <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-[26px]">
          💰
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[17px] font-medium text-gray-900 tracking-tight">iNote Money</span>
          <span className="text-[12px] text-gray-400">{message}</span>
        </div>
        <span className="text-[11px] font-mono text-gray-300">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

// ── 4. Spinner ──────────────────────────────────────────────────────────
function SpinnerLoader({ color, message }: { color: string; message: string }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-4 border-gray-100"
          style={{ borderTopColor: color, animation: 'spin 0.85s linear infinite' }}
        />
        <span className="text-[22px]">💰</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[17px] font-medium text-gray-900 tracking-tight">iNote Money</span>
        <span className="text-[12px] text-gray-400">{message}</span>
      </div>
    </div>
  );
}

// ── 5. Pulse Glow ───────────────────────────────────────────────────────
function PulseGlowLoader({ color, message }: { color: string; message: string }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center">
        <div
          className="absolute w-20 h-20 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute w-16 h-16 rounded-full animate-pulse opacity-15"
          style={{ backgroundColor: color }}
        />
        <div
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-[26px] border"
          style={{ backgroundColor: `${color}18`, borderColor: `${color}33` }}
        >
          💰
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[17px] font-medium text-gray-900 tracking-tight">iNote Money</span>
        <span className="text-[12px] text-gray-400">{message}</span>
      </div>
      <div
        className="px-3 py-1 rounded-full text-[11px] font-medium animate-pulse"
        style={{ backgroundColor: `${color}12`, color }}
      >
        {message}
      </div>
    </div>
  );
}

// ── 6. Glassmorphic Card ────────────────────────────────────────────────
function GlassmorphicLoader({ color, message, progress }: { color: string; message: string; progress: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} stroke="#f3f4f6" strokeWidth="5" fill="none" />
          <circle
            cx="32" cy="32" r={r}
            stroke={color} strokeWidth="5" fill="none"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        <div
          className="absolute w-14 h-14 rounded-2xl flex items-center justify-center text-[26px] shadow-sm border"
          style={{ backgroundColor: `${color}10`, borderColor: `${color}20` }}
        >
          💰
        </div>
        <div
          className="absolute -bottom-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow"
          style={{ backgroundColor: color }}
        >
          {Math.round(progress)}%
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[17px] font-semibold text-gray-900 tracking-tight">iNote Money</span>
        <span className="text-[11px] text-gray-400 font-mono">{message}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${progress}%`, backgroundColor: color, transition: 'width 0.3s ease' }}
        />
      </div>
    </div>
  );
}

// ── Preview Card Wrapper ────────────────────────────────────────────────
function PreviewCard({
  title,
  tag,
  children,
  fullPreviewBg = 'bg-white',
}: {
  title: string;
  tag?: string;
  children: React.ReactNode;
  fullPreviewBg?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white flex flex-col">
      <div className={`relative flex-1 flex items-center justify-center py-10 px-6 ${fullPreviewBg}`}>
        {children}
      </div>
      <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50">
        <span className="text-[13px] font-semibold text-gray-700">{title}</span>
        {tag && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Full Screen Preview Modal ───────────────────────────────────────────
function FullScreenPreview({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur">
        <span className="text-sm font-semibold text-gray-700">전체화면 미리보기</span>
        <button
          onClick={onClose}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
        >
          닫기 ✕
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">{children}</div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────
export default function TestLoadingPage() {
  const [color, setColor] = useState('#16a34a');
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState<number | null>(null);

  useEffect(() => {
    const p = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1.5));
    }, 80);
    const m = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => { clearInterval(p); clearInterval(m); };
  }, []);

  const message = MESSAGES[msgIdx];

  const variants = [
    {
      title: 'Bouncing Dots',
      tag: '현재 사용 중',
      node: <BouncingDotsLoader color={color} message={message} />,
    },
    {
      title: 'Ring Progress',
      node: <RingLoader color={color} message={message} progress={progress} />,
    },
    {
      title: 'Sliding Bar',
      node: <SlidingBarLoader color={color} message={message} progress={progress} />,
    },
    {
      title: 'Spinner',
      node: <SpinnerLoader color={color} message={message} />,
    },
    {
      title: 'Pulse Glow',
      node: <PulseGlowLoader color={color} message={message} />,
    },
    {
      title: 'Glassmorphic',
      node: <GlassmorphicLoader color={color} message={message} progress={progress} />,
    },
  ];

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {fullscreen !== null && (
        <FullScreenPreview onClose={() => setFullscreen(null)}>
          {variants[fullscreen].node}
        </FullScreenPreview>
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 px-5 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">💰 Loading UI 레퍼런스</h1>
            <p className="text-xs text-gray-400 mt-0.5">스타일 클릭 시 전체화면 미리보기</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-medium">포인트 컬러</span>
            <div className="flex gap-1.5">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className="w-6 h-6 rounded-full transition-all"
                  style={{
                    backgroundColor: c.value,
                    outline: color === c.value ? `2px solid ${c.value}` : 'none',
                    outlineOffset: '2px',
                    transform: color === c.value ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {variants.map((v, i) => (
            <button
              key={i}
              onClick={() => setFullscreen(i)}
              className="text-left focus:outline-none group"
            >
              <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white flex flex-col transition group-hover:shadow-md group-hover:border-gray-200">
                <div className="relative flex-1 flex items-center justify-center py-10 px-6 bg-white min-h-[220px]">
                  {v.node}
                  <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/[0.02] transition rounded-t-2xl flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition text-[11px] font-bold text-gray-500 bg-white/80 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                      전체화면 보기
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50">
                  <span className="text-[13px] font-semibold text-gray-700">{v.title}</span>
                  {v.tag && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      {v.tag}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Color swatch info */}
        <div className="max-w-4xl mx-auto px-4 pb-10">
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <p className="text-xs font-semibold text-gray-400 mb-3">현재 선택 컬러</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: color }} />
              <span className="text-sm font-mono text-gray-700">{color}</span>
              <span className="text-xs text-gray-400">
                — {ACCENT_COLORS.find((c) => c.value === color)?.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
