# apps/app — CLAUDE.md

> 이 폴더(`apps/app`) 작업 시 최상위 `CLAUDE.md`보다 **이 파일의 협업 방식을 우선** 적용한다.
> 개요/기술 스택은 [`README.md`](README.md) 참고, 여기는 **진행 방식 + 실행 체크리스트**.

---

## 협업 방식 (반드시 지킬 것)

> "사장님이 직접 코딩, Claude는 가이드" — 2026-08-19 확정. `inote-server-spring`과 동일한 페어 튜터 모드.

- 코드를 대신 완성해서 던지지 않는다. 개념 설명 → 사장님이 직접 명령어/코드 실행 → 결과 같이 확인 → 다음 단계 순서로 진행한다.
- 작은 단위로 쪼갠다. 체크리스트 한 항목씩만 진행하고, 확인 없이 다음 항목으로 넘어가지 않는다.
- 터미널 명령어는 이 세션의 Bash가 아니라 **사장님 터미널에서 직접 실행**하도록 안내하고 결과를 받아서 같이 본다 (다른 inote-money/inote-server 작업과 다른 점).
- Next.js/React 지식과 비교하며 설명한다 (RN 컴포넌트 ↔ HTML 태그, Expo Router ↔ App Router, Metro ↔ Webpack/Turbopack 등).
- `inote-money`(웹)/`inote-server`(BE) 작업은 기존처럼 Claude Code가 빠르게 구현하는 방식 그대로 유지 — 이 모드는 **`apps/app` 한정**이다.

---

## 아키텍처 결정 사항 (요약, 상세는 README.md)

- React Native(Expo) + `react-native-webview`로 `apps/web` 배포 URL을 그대로 로드하는 하이브리드 구조
- 우선 플랫폼: **Android** (핵심 기능인 문자 인식이 iOS 정책상 불가능해서)
- 로그인: 쿠키 교환 방식 — BE(`inote-server`)에 better-auth `oneTimeToken` 플러그인 추가 완료 (커밋 전, `src/auth/auth.ts`)
- 배포 방식: Expo Go(빠른 개발용) → 어느 정도 되면 EAS Build로 실제 APK를 뽑아 폰에 설치해서 "진짜 앱처럼" 사용

---

## 실행 체크리스트

### 단계 1 — 개발 환경 준비
- [ ] Expo Go 앱 설치 (안드로이드폰, Play Store)
- [ ] `apps/app`에서 `npx create-expo-app@latest . --template blank-typescript` 실행
- **확인 기준**: Expo Go로 QR 스캔 → 기본 "Open up App.tsx" 화면이 폰에 뜸

### 단계 2 — WebView로 URL 붙이기
- [ ] `react-native-webview` 설치
- [ ] 배포된 Vercel URL(`https://inote-money.vercel.app`) 로드하는 화면 작성
- **확인 기준**: 폰에서 실제 웹사이트가 앱처럼 화면 꽉 차게 보임

### 단계 3 — EAS Build로 첫 진짜 APK
- [ ] `eas-cli` 설치 + Expo 계정 연결 (무료)
- [ ] `eas build -p android --profile preview` 실행
- [ ] 나온 APK 다운로드해서 폰에 직접 설치
- **확인 기준**: 홈 화면에 아이콘 생기고, 개발 서버 꺼도 그냥 실행됨

### 단계 4 — 로그인 플로우 (쿠키 교환 방식)
- [ ] `expo-web-browser`로 시스템 브라우저 열어 구글 로그인 진입
- [ ] `expo-linking`으로 커스텀 스킴 딥링크 수신
- [ ] BE `oneTimeToken` 검증 → WebView에 세션 쿠키 심기
- [ ] Android manifest에 커스텀 스킴 등록
- **확인 기준**: 로그인 탭 → 구글 로그인 → 앱 복귀 → 로그인된 상태로 대시보드 진입

### 단계 5 — AI 문자 인식 자동 가계부 (Android 전용, 가장 어려운 구간)
- [ ] SMS 리스닝 네이티브 모듈 조사/선정
- [ ] `eas build --profile development`로 커스텀 dev client 빌드 (이때부터 Expo Go 졸업)
- [ ] SMS 권한 요청 + 리스너 구현
- [ ] 정규식 파싱(금액/날짜/가맹점명) + AI 카테고리 분류 연동
- **확인 기준**: 카드 결제 문자 오면 가계부에 자동으로 지출 항목 생김

### 단계 6 — 배포 여부 결정 (미정, 나중에)
- [ ] 개인용으로만 쓸지, Play Store 공개 배포할지 결정 (공개 시 SMS 권한 심사 필요)

---

## 현재 단계

🚧 **단계 1 시작 전** — 전략/체크리스트 문서만 세팅 완료. 다음 세션에서 `create-expo-app` 실행부터 진행 예정.
