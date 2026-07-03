'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    console.log('[callback] 페이지 로드, window.opener:', !!window.opener);
    if (window.opener) {
      console.log('[callback] postMessage 전송 → origin:', window.location.origin);
      window.opener.postMessage({ type: 'AUTH_SUCCESS' }, window.location.origin);
      window.close();
    } else {
      console.log('[callback] opener 없음 → /dashboard 이동');
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
