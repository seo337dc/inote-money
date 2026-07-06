'use client';

import { useEffect } from 'react';
import { signIn } from '@/lib/auth-client';
import LoadingScreen from '@/components/LoadingScreen';

export default function AuthPopupPage() {
  useEffect(() => {
    signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}/auth/callback`,
    });
  }, []);

  return <LoadingScreen />;
}
