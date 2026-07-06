'use client';

import { useEffect, useState } from 'react';
import LoadingScreen from './LoadingScreen';

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
        const res = await fetch('/api/health-check', {
          signal: AbortSignal.timeout(10000),
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

  if (!ready) return <LoadingScreen waking={waking} />;

  return <>{children}</>;
}
