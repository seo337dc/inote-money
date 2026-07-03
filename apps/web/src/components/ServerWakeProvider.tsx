'use client';

import { useEffect, useState } from 'react';

function ServerWakeScreen({ waking }: { waking: boolean }) {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
      <div className="flex flex-col items-center gap-7">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-[26px]">
            💰
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[18px] font-medium text-gray-900 tracking-tight">iNote Money</span>
            <span className="text-[13px] text-gray-400">
              {waking ? '서버 접속을 확인하는 중이에요...' : '연결 중이에요...'}
            </span>
          </div>
        </div>

        <div className="flex gap-1.5 items-center">
          <span className="w-[7px] h-[7px] rounded-full bg-green-600 animate-[bounce_1.2s_ease-in-out_infinite_0ms] opacity-30" />
          <span className="w-[7px] h-[7px] rounded-full bg-green-600 animate-[bounce_1.2s_ease-in-out_infinite_200ms] opacity-30" />
          <span className="w-[7px] h-[7px] rounded-full bg-green-600 animate-[bounce_1.2s_ease-in-out_infinite_400ms] opacity-30" />
        </div>
      </div>
    </div>
  );
}

export default function ServerWakeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    // 로컬 개발 환경에서는 서버 웜업 불필요
    if (window.location.hostname === 'localhost') {
      setReady(true);
      return;
    }

    let cancelled = false;

    const ping = async (): Promise<void> => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
          signal: AbortSignal.timeout(5000),
          cache: 'no-store',
        });
        if (res.ok && !cancelled) {
          setReady(true);
          return;
        }
      } catch {}

      if (!cancelled) {
        await new Promise((r) => setTimeout(r, 3000));
        return ping();
      }
    };

    // 1초 후에도 응답 없으면 "서버를 깨우는 중" 문구로 전환
    const wakingTimer = setTimeout(() => {
      if (!cancelled) setWaking(true);
    }, 1000);

    ping().then(() => clearTimeout(wakingTimer));

    return () => {
      cancelled = true;
      clearTimeout(wakingTimer);
    };
  }, []);

  if (!ready) return <ServerWakeScreen waking={waking} />;

  return <>{children}</>;
}
