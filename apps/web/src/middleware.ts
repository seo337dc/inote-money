import { NextResponse } from 'next/server';

// 미들웨어 쿠키 기반 세션 체크는 크로스 도메인(Vercel FE + Render BE)에서 동작하지 않음.
// 세션 보호는 각 layout에서 useSession()으로 처리.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
