# 작업 리스트

## 개발 작업

- [ ] 로그인 상태 확인 및 미인증 리다이렉트
  - 로그인 후 세션 체크
  - 미인증 사용자가 `/dashboard` 접근 시 `/login` 리다이렉트
  - Next.js middleware 또는 layout에서 처리

- [ ] Vercel FE 배포
  - 환경변수 `NEXT_PUBLIC_API_URL` 설정
  - 도메인 연결 확인

## 문서 작업

- [ ] 로그인 페이지 Notion 문서 업데이트
  - Better Auth 설정
  - Google OAuth 연동
  - 트러블슈팅 기록 (channel_binding, state_mismatch 등)

- [ ] DEV_LOG.md 업데이트
  - 로그인 페이지 구현 내용
  - Render 트러블슈팅
  - `channel_binding=require` 제거 해결 기록

- [ ] CLAUDE.md 업데이트
  - `/dashboard` 페이지 추가 반영
  - 로그인 구현 완료 반영
  - `/demo` 페이지 제거 반영

## 완료

- [x] Google OAuth 로그인 페이지 구현
- [x] Better Auth FE 연동 (`auth-client.ts`)
- [x] Render BE 배포
- [x] CORS / trustedOrigins 설정
- [x] OAuth `state_mismatch` 해결 (`channel_binding=require` 제거)
- [x] `/dashboard` 페이지 생성 (demo 대시보드 UI 적용)
