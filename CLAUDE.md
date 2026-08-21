# 개인 자산관리 앱 — CLAUDE.md

> Claude Code 작업 시 이 파일을 기준으로 맥락을 유지합니다.
> 기능/스키마 확정될 때마다 업데이트합니다.
>
> **새 세션 시작 시 필수:** `docs/handoff/HANDOFF.md`를 이 파일보다 먼저 읽는다.
> (순서: `git pull` → `HANDOFF.md` → 이 파일 TODO/현재 단계)

---

## 프로젝트 개요

개인 수입/지출, 투자 포트폴리오를 관리하는 웹/앱 서비스.
기획 ~ 개발 ~ 운영까지 전 과정을 AI 바이브코딩으로 진행.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| FE (Web) | Next.js + shadcn/ui + Tailwind CSS |
| FE (App) | React Native (Expo) + WebView 기반 (`apps/app/README.md` 참고) |
| BE | NestJS + Prisma |
| 인증 | Better Auth |
| DB | PostgreSQL |
| DevOps | Vercel (FE) + Render (BE) + Neon (DB) |
| 서버 상태 | @tanstack/react-query v5 |

---

## 문서 관리

| 문서 | 링크 |
|------|------|
| 프로젝트 홈 | [Inote-money 노션](https://app.notion.com/p/Inote-money-35ab5151f22f8048b08cdc6ee8c38253) |
| 기획 문서 | [planning](https://app.notion.com/p/planning-22c408bcf32b47829e78d95eabad51a6) |
| 개발 일지 | [devlog](https://app.notion.com/p/de6909091d054042a9b39ee1ebc7283b) |
| 회고 | [retrospective](https://app.notion.com/p/a72cbb70cff940d89727e8fa8212e41d) |
| QA 테스트 | [QA](https://app.notion.com/p/391b5151f22f802a9127c2114e09bae5) |

---

## 디자인 방향

- 스타일: 클린 미니멀 (토스, 뱅크샐러드 느낌)
- 톤: 밝은 톤
- 포인트 컬러: 초록
- UI 라이브러리: shadcn/ui + Tailwind CSS

---

## 기능 목록 (v0.1)

1. 자산 관리 (대시보드) ✅ 데모 구현
2. 가계부 ✅ 데모 구현
3. 주식 ✅ 데모 구현
4. 수입/지출 관리
5. 금융 지식 (경제 용어, 경제 책)
6. 미니게임 (캐시플로우)
7. 포트폴리오
8. 월별 기록

---

## 화면 정의

→ 상세 화면 스펙은 [기획 문서](https://app.notion.com/p/planning-22c408bcf32b47829e78d95eabad51a6) 참조

---

## 개발 방식

- 모든 코드 작업은 Claude Code + AI로만 진행
- CLAUDE.md를 프로젝트 맥락 기준 문서로 유지
- 기능/화면/스키마 확정 시 이 파일 업데이트

## UI 개발 워크플로우

1. **Google AI Studio** — 페이지별 디자인 목업 생성
2. **Claude Code** — 목업 기반 UI 코드 작성 및 BE 연결
3. **Cursor** — QA / 리뷰·리팩토링 / 문서·devlog 정리

## AI 협업 규칙 (Claude Code ↔ Cursor)

### 역할

| 도구 | 담당 |
|------|------|
| **Claude Code** | 설계·구현 — 세팅, API, 페이지, 도메인 로직 |
| **Cursor** | Task 완료 후 QA, 리뷰·리팩토링, 문서·devlog·PR 정리, handoff |
| **Google AI Studio** | 페이지별 디자인 목업 |
| **사람** | 기획·UX·아키텍처 판단 및 승인 |

- 기획·UX·아키텍처는 AI가 임의로 결정하지 않는다. 대안 제시 → **사람이 승인** 후 반영.
- Claude Code가 Cursor에 넘기는 것: QA 검증·리포트 / devlog 정리·축약 / PR 본문 다듬기 / 구현 후 리뷰·에러 분석

### 작업 흐름 (한 Task 사이클)

1. 사람이 TODO에서 Task 범위 확정
2. Claude Code가 구현
3. Claude → Cursor handoff (변경 파일 / 범위 / 알려진 이슈 / Cursor가 보강할 것)
4. Cursor가 QA → **PASS** / **PASS with notes** / **FAIL**
5. FAIL이면 Cursor → Claude handoff (범위·해도 됨·하지 말 것·기대 산출물)
6. PASS면 문서·PR 정리 → **커밋/PR은 사람이 요청할 때만**

### handoff 형식

프롬프트 첫 줄에 반드시 표시:
- Cursor → Claude: `> **[Cursor → Claude Code]** handoff 프롬프트`
- Claude → Cursor: `> **[Claude Code → Cursor]** handoff`

포함할 것: 현재 브랜치, 완료된 단계, 이번 세션 범위, 해도 됨 / 하지 말 것, 참고 파일, 기대 산출물.

### 세션 전환 (PC·채팅 메모리 초기화 대응)

채팅 메모리는 PC·세션마다 초기화된다. 맥락은 **`docs/handoff/HANDOFF.md` + git**으로 이어간다.

**새 세션 시작 순서 (필수 — 건너뛰지 말 것)**

1. `git pull`
2. **`docs/handoff/HANDOFF.md` 필독** (규칙 + 「현재 상태」)
3. 이 파일(`CLAUDE.md`)의 TODO / 현재 단계
4. 필요 시 `git log` · 최근 변경 파일

**세션 종료 / Task 경계**

1. `docs/handoff/HANDOFF.md` 「현재 상태」 갱신
2. 이 파일 TODO / 현재 단계 동기화
3. commit → push (**사람 요청 시에만**)

상세 규칙·템플릿: [`docs/handoff/HANDOFF.md`](docs/handoff/HANDOFF.md)  
Cursor 역할: [`CURSOR.md`](CURSOR.md)

### 원칙

- Task 단위로 끊어서 구현하고, Task마다 QA한다. 한 번에 전부 만들고 나중에 검증하지 않는다.
- Cursor는 Claude 구현 범위 밖으로 기능을 임의 확장하지 않는다.
- QA FAIL 항목을 Cursor가 임의로 크게 구현하지 않는다. (작은 UI/문서 픽스는 예외로 직접 가능)
- 커밋·PR·push는 사용자 요청 시에만.
- **handoff 없이** 이전 채팅 기억에 의존해 작업하지 않는다.

### Notion 업데이트

- Claude 작업 결과는 Claude가 직접 해당 Notion 페이지에 업데이트한다.
- 레포 문서(`CLAUDE.md`, `HANDOFF.md`)는 레포 수정 → Notion 동기화 순서.
- Notion 업데이트용 프롬프트를 사람에게 전달하지 않는다.

## 이슈·에러 대응 원칙 (CoT)

이슈나 에러가 발생했을 때 반드시 아래 순서대로 답한다.

1. **문제 파악** — 어떤 에러인지, 어디서 발생했는지 명확히 설명한다
2. **해결 방법 검토** — 가능한 해결 방법을 검토하고 최선의 방법을 선택한다
3. **최종 결론** — 선택한 방법을 적용하고 결과를 정리한다

## 레포 구조

```
inote-money/
├── CLAUDE.md
├── apps/
│   ├── web/          ← Next.js (실제 서비스)
│   └── app/          ← React Native (Expo) + WebView
├── backend/          ← NestJS
└── packages/         ← 공통 모듈
```

## 데모 페이지

- 로그인 없이 누구나 UI를 볼 수 있는 데모 페이지 제공
- 하드코딩된 더미 데이터로 화면만 표시
- 실제 데이터 연결 없는 UI 프로토타입 개념
- 경로: `/demo`
- 용도: 블로그 공유, 포트폴리오, 개발 중 UI 확인
- 기획 완료된 화면부터 순서대로 구현 → 실제 기능 완성 후 데이터 연결

---

## 배포 전략 (무료 기준)

| 영역 | 서비스 | 비고 |
|------|--------|------|
| FE | Vercel | Next.js 무료 배포 |
| BE | Render | NestJS 무료 플랜 |
| DB | Neon | PostgreSQL 무료 플랜 |
| 도메인 | Vercel 서브도메인 | 추후 Cloudflare 도메인 연결 가능 |

- AWS 사용 안 함 (프리티어 1년 후 과금)
- 여러 사이드 프로젝트 모두 동일 기준으로 운영
- Claude를 제외한 모든 서비스 무료 플랜 기준

---

## 모바일 앱(React Native) 개발 방향

> 아키텍처 개요는 [`apps/app/README.md`](apps/app/README.md), **진행 방식·실행 체크리스트는 [`apps/app/CLAUDE.md`](apps/app/CLAUDE.md)** 참고. 여기는 핵심 결정 사항만 요약.
>
> **`apps/app` 작업은 다른 협업 모드다** — 사람이 직접 코딩하고 Claude Code는 가이드 역할만 한다 (`inote-server-spring`과 동일한 페어 튜터 모드). `apps/web`/`inote-server`의 기존 "Claude가 구현" 방식과 다르니 혼동하지 말 것.

**아키텍처 (2026-08-11 확정)**: 처음엔 Capacitor로 기존 웹앱을 감싸는 스파이크를 진행(BE `oneTimeToken` 플러그인까지 추가)했다가, 최종적으로 **React Native(Expo) + WebView(react-native-webview)** 방식으로 방향을 정했다. `apps/web` 화면 대부분은 웹뷰로 그대로 재사용하고, 네이티브 모듈이 꼭 필요한 기능만 RN으로 추가하는 하이브리드 구조.

**핵심 기능 — AI 문자 인식 자동 가계부 입력 (Android 전용)**
- 카드 결제 알림 문자를 앱이 감지해 가계부 지출 항목을 자동 생성
- **Android만 지원** — iOS는 서드파티 앱의 SMS 접근이 OS 정책상 원천 차단되어 있어 불가능 (다음 단계에서 수동 입력 등 대체 방식 검토)
- **은행 실시간 연동(오픈뱅킹)은 범위 밖** — 개인 프로젝트로는 사업자 등록·심사가 필요해 지금은 불가능. 문자 알림 파싱만으로도 은행 제휴 없이 "자동 기록" 목표 달성 가능
- AI 역할: 문자 자체는 정규식으로 파싱, LLM은 가맹점명 → 지출 카테고리 자동 분류에 활용
- 이 기능이 들어가면 Expo Go만으로는 테스트 불가 (커스텀 dev client 필요, EAS Build로 로컬 Android Studio 없이 빌드 가능)

**로그인(구글 OAuth) — 쿠키 교환 방식**: 임베디드 웹뷰에서 구글 OAuth가 차단되는 문제 때문에, 로그인은 시스템 브라우저(`expo-web-browser`)로 열고 완료 후 better-auth `oneTimeToken` 플러그인으로 일회성 코드를 발급 → 커스텀 스킴 딥링크로 앱 복귀 → 앱의 WebView 자신이 코드를 검증해 세션 쿠키를 직접 심는 방식. BE(`inote-server`)의 `src/auth/auth.ts`에 `oneTimeToken` 플러그인 추가 완료(커밋 전 — RN 작업 재개 시 함께 커밋).

---

## 미결정 항목

- [x] 대시보드 화면 — 데모 구현 완료, 실서비스 스펙 미정
- [x] 인증 방식 — Better Auth + Google OAuth (실서비스 배포 완료)
- [ ] 수입/지출 관리 화면 정의
- [ ] 금융 지식 화면 정의
- [x] 미니게임 (캐시플로우) 화면 정의 — 데모 + 실서비스 구현 완료
- [ ] DB 스키마
- [x] 앱 아키텍처 방향 — RN(Expo) + WebView 확정, 핵심 기능(문자 인식 자동 가계부)은 Android 전용. 실제 구현 착수 / 스토어 배포 시점은 미정

## 데모 구현 완료 화면 목록

| 경로 | 화면 | 상태 |
|------|------|------|
| `/demo/dashboard` | 자산 관리 대시보드 | ✅ 완료 |
| `/demo/dashboard/setup` | 내 자산 설정 | ✅ 완료 |
| `/demo/account-book` | 가계부 (달력/주차별/전체) | ✅ 완료 |
| `/demo/stocks` | 주식 (국내+해외+환율) | ✅ 완료 |
| `/demo/settings` | 설정 (프로필+다크모드) | ✅ 완료 |
| `/demo/financial-knowledge` | 금융 지식 | 🚧 준비 중 |
| `/demo/mini-game` | 미니게임 (캐시플로우 보드게임) | ✅ 완료 (QA PASS) |

---

## Claude Code 전달용 TODO

> 기획 문서 작성 후 Claude Code에 전달할 작업 목록

### 기획 문서 작성 필요 (작성 후 Claude Code에 전달)

- [ ] **대시보드 화면 기획서** — 주요 지표, 차트 구성, 레이아웃 정의
- [ ] **수입/지출 관리 화면 기획서** — 수입 입력, 지출 카테고리 관리, 예산 설정
- [ ] **투자 기록 화면 기획서** — 종목 입력, 수익률 표시 방식
- [ ] **포트폴리오 화면 기획서** — 자산 배분 차트, 종목별 현황
- [ ] **월별 기록 화면 기획서** — 월간 요약, 전월 비교, 트렌드
- [ ] **하단 탭 네비게이션 기획서** — 탭 구성, 아이콘, 라우팅 구조

### 다음 작업 순서 (확정)

#### 🔴 실서비스 API 연동
- [x] **대시보드 내 자산 카드 API 연동** — 가계부 데이터 연동 (주간/월간 지출 합계, 낭비 금액, 비교 바)
- [x] **주간/월간 리뷰 저장 API 연동** — BE reviews 모듈 구현 (GET/PUT /money/reviews), FE useMutation + toast
- [x] **가계부 메모 기능** — Expense.memo 필드 추가 (DB/DTO/Service), 읽기 모드 독립 저장 (캐시 직접 업데이트), 수정 모드 인라인 확장
- [x] **주식 페이지 API 연동** — 보유 종목 CRUD (BE `/money/stocks`는 기존 구현 재사용, FE `/stocks` 페이지 신규 구현) — 사람 최종 확인 대기
- [x] **미니게임 실서비스 페이지 + 결과 저장 API 연동** — BE `MiniGameResult` 모델/API 신규 구현, FE `/mini-game` 페이지 신규 구현 (승리/포기 시 자동 저장 + 플레이 기록 모달) — 사람 최종 확인 대기

#### 🟡 UI 개선
- [ ] **화면에 사용자 이름 노출** — UI 수정 작업 필요
- [ ] **메뉴 이모지 로고 → 이미지 교체** — Google AI Studio에서 이미지 생성 후 적용 예정

#### 🟢 데모 미완성 화면
- [ ] **금융 지식 화면 구현** (`/demo/financial-knowledge`) — 기획 먼저

#### 🔵 지침 개선
- [ ] **Claude AI 지침 전략 강화** — CLAUDE_EXAMPLE.md 기반으로 CLAUDE.md 지침 개선 (CoT, 토큰 효율, 작업별 접근 방식 등)

### Claude Code 바로 전달 가능 (기획 완료)

- [x] 가계부 화면 — 달력 / 주차별 / 전체 로그 뷰 (구현 완료)
- [x] 대시보드 — 내 정보 카드 / 주간 리뷰 / 월간 요약 (구현 완료)
- [x] 내 자산 설정 — 월급·적금·고정지출·날짜 입력 (구현 완료)
- [x] 설정 페이지 — 프로필 + 다크모드 토글 (구현 완료)
- [x] 주식 페이지 — 국내(Naver API + Lightweight Charts) + 해외(TradingView iframe) + 환율 (구현 완료)

---

## 모바일 / 데스크탑 UI 분리 전략

기능이 많아질수록 모바일과 데스크탑 UI 차이가 크기 때문에 **처음부터 분리 구조로 관리.**

### 분리 기준

- 브레이크포인트: `lg` (1024px) 기준 — 미만 모바일, 이상 데스크탑/태블릿
- `m.` 서브도메인 방식 사용 안 함 (레거시, SEO 불리, 유지비용 2배)
- `window` 훅 기반 분기 사용 안 함 (SSR 깜빡임 문제)

### 분리 방식 — CSS 숨기기

```tsx
// page.tsx
<>
  <div className="hidden lg:block">
    <DemoDesktop {...sharedProps} />
  </div>
  <div className="block lg:hidden">
    <DemoMobile {...sharedProps} />
  </div>
</>
```

- `page.tsx`: 상태·핸들러만 관리, UI 없음
- `desktop/`: 웹/태블릿 전용 컴포넌트
- `mobile/`: 모바일 전용 컴포넌트 (하단 탭 네비게이션 포함)
- 공통 로직은 `page.tsx`에서 props로 내려주기

### 폴더 구조 컨벤션

```
src/app/demo/
├── page.tsx                  ← 상태/핸들러만
├── data.ts
└── components/
    ├── desktop/              ← 웹/태블릿 전용
    │   ├── DemoDesktop.tsx
    │   └── ...
    └── mobile/               ← 모바일 전용
        ├── DemoMobile.tsx
        ├── BottomTabNav.tsx
        └── ...
```

새 화면 추가 시 `desktop/`, `mobile/` 양쪽에 동일하게 추가.

---

## 실서비스 구현 완료 목록

| 경로 | 화면 | 상태 |
|------|------|------|
| `/login` | 로그인 (Google OAuth) | ✅ 완료 |
| `/dashboard` | 자산 관리 대시보드 레이아웃 + 인증 보호 | ✅ 완료 |
| `/dashboard/setup` | 내 자산 설정 (월급·적금·고정지출·메모, API 연동) | ✅ 완료 |
| `/dashboard/setup/history` | 자산 설정 히스토리 목록 | ✅ 완료 |
| `/dashboard/setup/history/[id]` | 자산 설정 히스토리 상세 (제목 수정·삭제·메모) | ✅ 완료 |
| `/settings` | 설정 (프로필+로그아웃+자산설정 진입점) | ✅ 완료 |
| `/account-book` | 가계부 (달력/주차별/전체, CRUD API 연동) | ✅ 완료 |
| `/stocks` | 주식 (보유 종목 CRUD, 국내/해외 차트, 환율) | ✅ 완료 (사람 확인 대기) |
| `/mini-game` | 미니게임 (캐시플로우 보드게임 + 결과 저장/기록) | ✅ 완료 (사람 확인 대기) |

---

## 현재 단계

> 상세 세션별 이력은 `DEV_LOG.md` 참고. 여기는 현재 스냅샷만 유지.

로그인(Google OAuth) + Vercel/Render/Neon 프로덕션 배포 완료. 실서비스 화면 6종(`/dashboard`, `/dashboard/setup`(+히스토리), `/settings`, `/account-book`, `/stocks`, `/mini-game`) 모두 API 연동까지 구현 완료 — `/stocks`, `/mini-game`은 사람 최종 확인 대기 중. 미니게임은 `/demo/mini-game`(순수 로컬 데모)과 `/mini-game`(로그인 필수, 결과 저장 + 플레이 기록 조회)로 분리 운영. 로컬 개발 시 크로스 오리진 로그인 이슈(쿠키 SameSite/Secure)를 inote-server에서 환경별로 분기 처리해 해결.

다음 단계: 사람이 `/mini-game` 실제 플레이로 이번 세션 버그 픽스 3건(헤더 레이아웃, 자녀 출산 카운트, 보드 카드 높이) 재확인 → 문제없으면 Task #5 confetti 착수 여부 결정.

---

## 회고 작성 가이드

### 작성 타이밍
- 데모 버전 완성 후
- 기능 하나 완성할 때마다
- 배포 후
- 프로젝트 마무리 시

### 담을 내용
- 왜 이 기술을 선택했는지
- 막혔던 부분과 해결 방법
- 바이브코딩으로 혼자 만들면서 느낀 점
- 다음엔 다르게 할 것들
