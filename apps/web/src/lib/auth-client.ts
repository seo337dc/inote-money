import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  basePath: '/api/v1/auth',
});

export const { signIn, signOut, useSession } = authClient;
