'use client';

import { useEffect } from 'react';
import { signIn } from '@/lib/auth-client';

export default function AuthPopupPage() {
  useEffect(() => {
    signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}/auth/callback`,
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
