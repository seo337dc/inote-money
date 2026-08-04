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

## 아키텍처 학습 (외부 과제 피드백 반영)

> 상세: [`docs/retrospective/fsd-architecture-feedback.md`](docs/retrospective/fsd-architecture-feedback.md)
> `langdy-fe-assignment` 과제 탈락 피드백 — 레이어형 아키텍처 도입 시 반복 방지용 체크리스트

- [ ] 레이어(계층) 구조 도입 시 의존성 방향을 lint 룰로 강제하는 방법 검토
- [ ] `packages/` ↔ `apps/web` 의존성 방향 기준 정하기 (문서화)
- [ ] 새 모듈 추가 시 "왜 이 레이어/폴더에 두는지" 그때그때 커밋/PR에 기록 (사후 총정리 X)

## 완료

- [x] Google OAuth 로그인 페이지 구현
- [x] Better Auth FE 연동 (`auth-client.ts`)
- [x] Render BE 배포
- [x] CORS / trustedOrigins 설정
- [x] OAuth `state_mismatch` 해결 (`channel_binding=require` 제거)
- [x] `/dashboard` 페이지 생성 (demo 대시보드 UI 적용)
