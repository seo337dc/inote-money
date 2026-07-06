'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('session_active', '1');
    if (window.opener) {
      window.opener.postMessage({ type: 'AUTH_SUCCESS' }, window.location.origin);
      window.close();
    } else {
      router.replace('/dashboard');
    }
  }, [router]);

  return <LoadingScreen />;
}
