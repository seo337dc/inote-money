export type WakeState =
  | { status: 'connecting' }
  | { status: 'waking'; attempt: number }
  | { status: 'ready' }
  | { status: 'failed' };

async function healthCheck(timeoutMs: number, signal: AbortSignal): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  signal.addEventListener('abort', () => { clearTimeout(timer); controller.abort(); });

  try {
    const res = await fetch('/api/health-check', {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(t); resolve(); });
  });
}

export async function waitForServer(
  onStatus: (s: WakeState) => void,
  signal: AbortSignal,
): Promise<void> {
  onStatus({ status: 'connecting' });

  // 1단계: 5초 타임아웃으로 빠른 체크
  const firstOk = await healthCheck(5000, signal);
  if (signal.aborted) return;
  if (firstOk) {
    onStatus({ status: 'ready' });
    return;
  }

  // 2단계: waking — 최대 5회 재시도 (60초 타임아웃, 시도 간 5초 대기)
  const MAX_ATTEMPTS = 5;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (signal.aborted) return;
    onStatus({ status: 'waking', attempt });

    const ok = await healthCheck(60000, signal);
    if (signal.aborted) return;
    if (ok) {
      onStatus({ status: 'ready' });
      return;
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(5000, signal);
    }
  }

  if (!signal.aborted) {
    onStatus({ status: 'failed' });
  }
}
