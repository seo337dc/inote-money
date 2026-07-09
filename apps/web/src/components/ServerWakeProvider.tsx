'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import LoadingScreen from './LoadingScreen';
import { waitForServer, type WakeState } from '@/lib/waitForServer';

export default function ServerWakeProvider({ children }: { children: React.ReactNode }) {
  const [wakeState, setWakeState] = useState<WakeState>({ status: 'connecting' });
  const [elapsed, setElapsed] = useState(0);

  const controllerRef = useRef<AbortController | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const stopElapsedTimer = useCallback(() => {
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }, []);

  const run = useCallback(() => {
    controllerRef.current?.abort();
    stopElapsedTimer();

    const controller = new AbortController();
    controllerRef.current = controller;
    startTimeRef.current = Date.now();
    setElapsed(0);
    setWakeState({ status: 'connecting' });

    waitForServer((state) => {
      setWakeState(state);

      if (state.status === 'waking' && !elapsedTimerRef.current) {
        elapsedTimerRef.current = setInterval(() => {
          setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
      }

      if (state.status === 'ready' || state.status === 'failed') {
        stopElapsedTimer();
      }
    }, controller.signal);
  }, [stopElapsedTimer]);

  useEffect(() => {
    if (window.location.hostname === 'localhost') {
      setWakeState({ status: 'ready' });
      return;
    }

    run();

    return () => {
      controllerRef.current?.abort();
      stopElapsedTimer();
    };
  }, [run, stopElapsedTimer]);

  if (wakeState.status === 'ready') return <>{children}</>;

  return (
    <LoadingScreen
      status={wakeState.status}
      attempt={wakeState.status === 'waking' ? wakeState.attempt : undefined}
      elapsed={elapsed}
      onRetry={run}
    />
  );
}
