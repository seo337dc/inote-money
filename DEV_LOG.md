# 개발 기록 로그 — iNote Money

> 다른 PC에서 작업을 이어받을 때 이 파일을 먼저 읽고 맥락을 파악합니다.
> 작업할 때마다 아래 로그에 날짜 + 내용을 추가합니다.

---

## 빠른 현황 파악

| 항목 | 상태 |
|------|------|
| 레포 위치 | `~/Desktop/side-project/inote-money` |
| FE 경로 | `apps/web` (Next.js 16) |
| BE 경로 | `backend/` (미시작) |
| 현재 진행 단계 | 로그인 + 미들웨어 구현 완료, 프로덕션 QA 진행 중 |
| 실행 포트 | `http://localhost:3000` |
| Vercel 배포 | `https://inote-money.vercel.app` |

---

## 로컬 실행 방법

```bash
# FE 개발 서버
cd apps/web
npm run dev

# 접속
http://localhost:3000        # 홈
http://localhost:3000/login  # 로그인
http://localhost:3000/demo   # 데모
```

> ⚠️ 로컬 개발 시 `.env.local`의 `NEXT_PUBLIC_API_URL`을 `http://localhost:3200`으로 설정해야 인증이 정상 동작합니다. (프로덕션은 Render URL 사용)

---

## 작업 로그

### 2026-07-02

#### ✅ 로그인 페이지 구현 (Better Auth Google OAuth)

**신규 파일**
- `src/app/login/page.tsx` — Google 로그인 버튼 UI
- `src/lib/auth-client.ts` — Better Auth 클라이언트 설정
  - `baseURL: process.env.NEXT_PUBLIC_API_URL`
  - `basePath: '/api/v1/auth'`

**BE 연결 설정**
- `apps/web/.env.local` — `NEXT_PUBLIC_API_URL` 환경변수
  - 로컬: `http://localhost:3200` (로컬 BE)
  - 프로덕션 Vercel 환경변수: `https://inote-server-5a63.onrender.com`

#### ✅ 미인증 라우트 보호 미들웨어 구현

- `src/middleware.ts` — 세션 쿠키 체크 기반 라우트 보호
  - 보호 경로: `/dashboard`, `/settings` → 미인증 시 `/login` 리다이렉트
  - 인증 경로: `/login` → 인증 시 `/dashboard` 리다이렉트
  - 쿠키명: `better-auth.session_token` / `__Secure-better-auth.session_token`

#### ✅ 설정 페이지 로그아웃 구현

- `/settings/page.tsx` — `signOut()` 호출 후 `/` 이동
- `/settings/layout.tsx` — 대시보드 레이아웃 재사용 (`export { default } from '../dashboard/layout'`)
- `/demo/settings/page.tsx` — 데모용 로그아웃 (UI만, `/`로 이동)

#### ✅ Vercel FE 배포 완료

- 배포 URL: `https://inote-money.vercel.app`
- 환경변수 설정: `NEXT_PUBLIC_API_URL=https://inote-server-5a63.onrender.com`

#### ✅ 로컬 QA 완료 — 로그인 / 라우트 보호

| # | 시나리오 | 결과 |
|---|---------|------|
| 1 | 미인증 → `/dashboard` 접근 | `/login` 리다이렉트 ✅ |
| 2 | 미인증 → `/settings` 접근 | `/login` 리다이렉트 ✅ |
| 3 | 인증 상태 → `/login` 접근 | `/dashboard` 리다이렉트 ✅ |
| 4 | 로그인 후 `/dashboard` 접근 | 정상 표시 ✅ |
| 5 | 로그인 후 `/settings` 접근 | 정상 표시 ✅ |
| 6 | 미인증 → `/demo` 접근 | 정상 접근 ✅ |
| 7 | 로그아웃 후 `/dashboard` 재접근 | `/login` 리다이렉트 ✅ |
| 8 | 설정 로그아웃 클릭 | `/` 이동 ✅ |

#### ✅ 크로스 도메인 인증 버그 수정

**증상**
- 프로덕션(Vercel FE + Render BE)에서 Google 로그인 후 `/dashboard`로 이동하지 않고 `/login`으로 튕김
- Render 로그에는 아무 반응 없음

**근본 원인**
Next.js 미들웨어가 세션 쿠키를 직접 체크하는 방식이 크로스 도메인에서 동작하지 않음.

- Render BE가 세션 쿠키를 `onrender.com` 도메인에 세팅
- Vercel 미들웨어는 `vercel.app` 요청의 쿠키만 확인 → Render 쿠키 없음 → 항상 미인증 판단
- OAuth 완료 후 Vercel `/dashboard`로 이동해도 미들웨어가 즉시 `/login`으로 튕겨버림 → 클라이언트 코드 실행 기회 없음

로컬에서는 FE(`localhost:3000`)와 BE(`localhost:3200`)가 같은 `localhost` 호스트라 쿠키가 공유돼 문제없었음.

**수정**
- `middleware.ts` — 세션 체크 로직 제거 (pass-through)
- `dashboard/layout.tsx` — `useSession()` hook으로 세션 체크 (미인증 시 `/login` 리다이렉트)
- `login/page.tsx` — `useSession()` hook으로 이미 인증된 경우 `/dashboard` 리다이렉트

`useSession()`은 Render BE에 직접 요청을 보내므로 브라우저가 `onrender.com` 쿠키를 정상 전달 → 크로스 도메인에서도 세션 확인 가능.

#### 🔜 다음 작업
- FE + BE API 연동

---

### 2026-07-03

#### ✅ CLAUDE.md 업데이트
- DevOps 항목: `Railway` → `Render`, `Supabase` → `Neon` 수정
- 미결정 항목: 인증 완료 체크, AWS 인프라 항목 제거
- `실서비스 구현 완료 목록` 섹션 추가 (로그인/대시보드/설정)
- `현재 단계` 최신화

#### ✅ Notion 기획 문서 업데이트 (#12)
- 기술 스택 테이블 Railway → Render 수정
- 기능 목록에 로그인 항목 추가
- 화면 정의에 로그인 스펙 추가 (인증 플로우, 크로스 도메인 이슈, 상태 처리)
- 미결정 항목 갱신, 배포 URL 추가

#### ✅ Google OAuth 팝업 로그인 구현

**배경**
- 기존: Google 로그인 클릭 시 현재 탭에서 Google OAuth로 리다이렉트 → 돌아올 때 흰 화면 깜빡임
- 개선: `window.open()`으로 팝업 창을 열어 OAuth 진행 → 부모 창에서 대기 → 완료 후 `/dashboard` 이동

**구현 방식: postMessage**
```
로그인 버튼 클릭
  → window.open('/auth/popup')                    팝업 창 열기
  → signIn.social({ provider: 'google' })        Better Auth OAuth 시작
  → Google 계정 선택
  → BE /api/v1/auth/callback/google              Better Auth 세션 생성
  → FE /auth/callback                            콜백 페이지
  → window.opener.postMessage({ type: 'AUTH_SUCCESS' })  부모에 완료 신호
  → window.close()                               팝업 닫기
  → 부모 창 message 이벤트 수신
  → window.location.href = '/dashboard'          대시보드 이동
```

**신규 파일**
- `src/app/auth/popup/page.tsx` — 팝업 창에서 열리는 중간 페이지. `signIn.social()` 호출 후 Google로 이동
- `src/app/auth/callback/page.tsx` — OAuth 완료 후 돌아오는 콜백 페이지. `window.opener`가 있으면 `postMessage`, 없으면 직접 `/dashboard` 이동

**주요 변경 파일**
- `src/app/login/page.tsx` — 팝업 오픈 + `message` 이벤트 리스너 등록

**구현 시 마주친 이슈들**

1. **팝업 오픈 후 dashboard 미이동 — `router.replace` 무력화**
   - 증상: `AUTH_SUCCESS` 메시지는 수신되고 핸들러도 실행됐으나 화면 이동 없음
   - 원인: `router.replace('/dashboard')` 호출 직후 dashboard layout의 `useSession()`이 세션을 아직 못 가져온 순간(`isPending=false, session=null`)이 발생해 즉시 `/login`으로 다시 튕김 → 로그인 페이지 재렌더 → `message` 리스너 재등록 → 이동 안 된 것처럼 보임
   - 해결: `router.replace` → `window.location.href = '/dashboard'`로 변경. 하드 이동이므로 Next.js 라우터 상태 간섭 없이 전체 페이지 새로 로드 → `useSession()`이 세션을 새로 패치 → dashboard 정상 표시

2. **COOP 에러 — `popup.closed` 접근 차단**
   - 증상: 팝업이 Google 페이지(`accounts.google.com`)에 있을 때 `Cross-Origin-Opener-Policy policy would block the window.closed call` 에러 발생
   - 원인: Google OAuth 페이지가 `Cross-Origin-Opener-Policy: same-origin` 헤더를 설정 → 다른 오리진 팝업에서 `popup.closed` 읽기 차단
   - 해결: `setInterval` 내 `popup.closed` 체크를 `try/catch`로 감싸 에러 억제 (팝업 닫힘 감지는 부가 기능이므로 차단돼도 postMessage 메인 플로우에 영향 없음)

3. **로컬 vs 프로덕션 환경 Google Cloud Console 리다이렉트 URI 설정**
   - 로컬: `http://localhost:3200/api/v1/auth/callback/google`
   - 프로덕션: `https://inote-server-5a63.onrender.com/api/v1/auth/callback/google`
   - Google Cloud Console → OAuth 2.0 클라이언트 → 승인된 리다이렉션 URI에 두 개 모두 등록 필요

**팝업 UX**
- 팝업 열리는 동안 로그인 페이지에 반투명 오버레이 + 초록 bouncing dots 표시
- `popupOpen` state로 버튼 비활성화 (중복 팝업 방지)
- `setInterval`로 `popup.closed` 감지 → 팝업 닫히면 overlay 해제 (COOP try/catch 적용)

#### 🔜 다음 작업
- FE + BE API 연동 (가계부, 주식, 설정 CRUD)

#### ✅ 세션 만료 감지 + 토스트 알림

**배경**
- 로그인 후 세션이 만료됐을 때 그냥 `/login`으로 튕기면 사용자가 이유를 모름
- 만료(세션 없음)와 미로그인(세션 없음)을 FE에서 구분해야 함

**구현 방식**
- `localStorage.session_active = '1'` — 로그인 성공 시 세팅 (`auth/callback/page.tsx`)
- `localStorage.removeItem('session_active')` — 로그아웃 시 제거 (`settings/page.tsx`)
- `dashboard/layout.tsx` — `useSession()` 결과가 `session=null`일 때 `session_active` 유무로 분기
  - 있으면: 만료 → `toast.error('세션이 만료되었습니다...')` + 1초 후 `/login`
  - 없으면: 미로그인 → 바로 `/login`

**BE 세션 설정** (`inote-server/src/auth/auth.ts`)
- `expiresIn: 86400` (1일)
- `updateAge: 43200` (12시간마다 자동 갱신)

---

#### ✅ Render 콜드 스타트 대응 — ServerWakeProvider

**배경**
- Render 무료 플랜은 15분 비활동 후 서버 슬립 → 첫 요청에 30~60초 지연
- 앱 진입 시 먼저 BE에 핑을 보내고, 응답 올 때까지 로딩 화면 표시

**파일**: `apps/web/src/components/ServerWakeProvider.tsx`

**동작 흐름**
```
앱 진입
  → localhost? → 바로 통과 (로컬 개발 환경 제외)
  → 프로덕션? → GET /health 핑
              → 1초 내 응답 없으면 "서버 접속을 확인하는 중이에요..." 문구 전환
              → 응답 오면 → children 렌더 (앱 정상 진입)
              → 실패 시 3초 후 재시도 (무한 재시도)
```

**로딩 화면**: 💰 로고 + `iNote Money` + 초록 3점 바운스 (`animate-bounce`) — 전체 화면, opacity 없음

**주의사항**
- `apps/web/src/app/layout.tsx`의 `<body>` 전체를 `ServerWakeProvider`로 감쌈
- `NEXT_PUBLIC_API_URL` 환경변수로 BE URL 참조

---

#### ✅ 로딩 UI 테스트 페이지 — `/test/loading`

**배경**
- `inote-money-loader` Vite 앱(AI Studio 기반)을 참고용으로 Next.js에 이식
- 실서비스 로딩 스타일 결정 전 인터랙티브하게 4가지 스타일 비교

**파일 구조**
```
apps/web/src/app/test/loading/
├── page.tsx                ← 시뮬레이션 엔진 (progress 타이머 + AnimatePresence)
├── types.ts
└── components/
    ├── LoadingScreens.tsx  ← 4가지 스타일
    ├── Customizer.tsx      ← 다크 컨트롤 패널
    └── Dashboard.tsx       ← 로딩 후 더미 대시보드
```

**스타일 4가지** (→ 상세 스펙: `docs/UI_LOADING_REFERENCE.md`)
- `glassmorphic` — 원형 SVG 링 게이지, 파티클, 블러 배경
- `minimal-memo` — 메모장 플립 애니메이션, 그리드 종이 배경
- `cyber-neon` — 터미널 콘솔 로그, 세그먼트 바, 스캔 라인
- `organic-flow` — 모핑 blob, 부드러운 초록 오브

**2안 제거**: `LoadingScreenLight` (Toss 스타일 단순 스피너) — 필요 없어서 삭제

#### ✅ ServerWakeProvider CORS 버그 수정

**증상**
- 프로덕션에서 앱 진입 시 로딩 화면이 끝나지 않고 무한 루프
- Network 탭: `/health` 요청이 빨간 X로 계속 실패

**원인 1 — CORS**
- `ServerWakeProvider`가 브라우저에서 직접 `https://inote-server-5a63.onrender.com/health` 요청
- Vercel(`inote-money.vercel.app`) → Render(`onrender.com`) 크로스 도메인
- 브라우저가 CORS 정책으로 응답 차단 → Response Headers 비어있음 → catch → 3초 후 재시도 → 무한 루프

**원인 2 — 잘못된 경로**
- `/health`로 요청했으나 NestJS에 `app.setGlobalPrefix('api/v1')` 설정으로 실제 경로는 `/api/v1/health`
- 404 반환 → 프록시가 502 반환 → 계속 실패

**해결**
- `apps/web/src/app/api/health-check/route.ts` 신규 생성 (Next.js API Route 프록시)
  - 브라우저는 같은 도메인(`/api/health-check`)에 요청 → CORS 없음
  - Vercel 서버 사이드에서 `NEXT_PUBLIC_API_URL/api/v1/health`로 서버간 요청
- `ServerWakeProvider.tsx` — fetch 대상을 `/api/health-check`로 변경

**교훈**
- 브라우저에서 직접 크로스 도메인 핑을 보내면 CORS에 막힘 → 반드시 Next.js API Route 프록시 경유
- NestJS globalPrefix 설정 확인 필수 (`/health` ≠ `/api/v1/health`)

#### 🔜 다음 작업
- `/test/loading` 4가지 스타일 중 실서비스 로딩 1개 최종 결정
- 결정 후 `ServerWakeProvider.tsx`에 이식
- FE + BE API 연동 (가계부, 주식, 설정 CRUD)

---

### 2026-07-06

#### ✅ FE API 인프라 구축

**공통 API 클라이언트** (`apps/web/src/lib/api.ts`)
- `fetch` 래퍼 — `credentials: 'include'`로 Better Auth 세션 쿠키 자동 전달
- `ApiError` 클래스 — HTTP status 코드 보존 (404 = 첫 설정, 401 = 세션 만료 등 분기 처리)
- `api.get / post / put / patch / delete` 메서드

**@tanstack/react-query v5 설치 및 설정**
- `apps/web/src/lib/query-client.tsx` — `ReactQueryProvider` 컴포넌트
  - `staleTime: 60초`, `retry: 1` 기본 설정
- `apps/web/src/app/layout.tsx` — `ReactQueryProvider`로 `ServerWakeProvider` 래핑
- 사용 패턴: `useQuery`로 GET, `useMutation`으로 PUT/POST, 저장 성공 시 `invalidateQueries`로 캐시 무효화

#### ✅ BE UpsertSettingsDto 스키마 수정

**문제**: `savings`, `fixedExpenses`가 `@IsInt()`로 선언되어 있었으나 DB 컬럼은 `Json` 타입

**수정** (`inote-server/src/money/settings/dto/upsert-settings.dto.ts`)
- `SettingsItemDto` 신규 추가 (`id: string`, `name: string`, `amount: number`, `day?: number`)
- `savings`, `fixedExpenses`를 `SettingsItemDto[]`로 변경 (`@ValidateNested`, `@Type`)

**수정** (`inote-server/src/money/settings/settings.service.ts`)
- `savings as unknown as Prisma.InputJsonValue` 캐스트 추가 (Prisma Json 타입 호환)

#### ✅ `/dashboard/setup` 실서비스 구현 (API 연동)

**파일**: `apps/web/src/app/dashboard/setup/page.tsx`

**동작 흐름**
- `useQuery(['settings'])` → `GET /api/v1/money/settings`
  - 404 = 첫 설정 → 빈 폼 (에러 아님)
  - 200 = 기존 설정 → 폼에 자동 입력
- `useMutation` → `PUT /api/v1/money/settings` → 성공 시 `invalidateQueries(['settings'])` + 뒤로가기

**필드 매핑**
| 폼 필드 | API 필드 |
|---------|---------|
| monthlyIncome | salary |
| incomeDay | salaryDate |
| dailyLimit | dailyLimit |
| monthlyGoal | monthlySavingGoal |
| assetUpdateDay | assetUpdateDate |
| savings (items) | savings[] |
| fixedExpenses (items) | fixedExpenses[] |

#### ✅ 설정 페이지 — 나의 자산 설정 섹션 추가

- `apps/web/src/app/settings/page.tsx` — 프로필 카드 아래 `Wallet` 아이콘 섹션 + `/dashboard/setup` 링크
- `apps/web/src/app/demo/settings/page.tsx` — 동일 섹션, `/demo/dashboard/setup` 링크

#### 🔜 다음 작업
- 대시보드 내 정보 카드 → settings API 연동
- 가계부 페이지 API 신규 구현 (GET/POST/PATCH/DELETE)
- 주식 페이지 API 신규 구현

---

### 2026-07-06 (세션 2)

#### ✅ 로딩 UI 전체 Minimal Memo 스타일로 통일

**배경**
- 기존 로딩이 초록 스피너, 바운싱 dots 등 제각각
- `/test/loading`의 4가지 스타일 중 Minimal Memo Book 선택 → 실서비스 로딩으로 확정
- Cyber Neon Terminal 스타일 제거 (불필요)

**Cyber Neon Terminal 제거**
- `LoadingScreens.tsx` — `cyber-neon` case 삭제, 관련 미사용 import 정리 (`Cpu`, `FileText`, `Loader2`, `PieChart`, `DollarSign`)
- `types.ts` — `LoaderStyle`에서 `'cyber-neon'` 제거
- `Customizer.tsx` — 스타일 목록에서 Cyber Neon Terminal 항목 제거

**`LoadingScreen.tsx` 재작성** (`apps/web/src/components/LoadingScreen.tsx`)
- Minimal Memo 스타일 기반으로 전면 교체
- `waking` prop: `false`(초기) / `true`(1초 후 서버 느릴 때) 에 따라 메시지 세트 전환
- 메모장 플립 애니메이션 + 그리드 종이 배경 (`radial-gradient`)
- 좌→우 shimmer 프로그레스 바 (무한 루프)
- `motion/react` 기반, `AnimatePresence`로 메시지 전환 애니메이션

**ServerWakeProvider 정리** (`apps/web/src/components/ServerWakeProvider.tsx`)
- 인라인 `ServerWakeScreen` 컴포넌트 제거
- `<LoadingScreen waking={waking} />`으로 교체

**Next.js route-level loading 추가**
- `apps/web/src/app/demo/loading.tsx` 신규 — `/demo/*` 페이지 이동 시 LoadingScreen
- `apps/web/src/app/dashboard/loading.tsx` 신규 — `/dashboard/*` 페이지 이동 시 LoadingScreen

**전체 스피너 → LoadingScreen 교체**

| 파일 | 변경 내용 |
|------|-----------|
| `dashboard/layout.tsx` | 세션 체크 스피너 → `<LoadingScreen />` |
| `dashboard/setup/page.tsx` | API isLoading 스피너 → `<LoadingScreen />` |
| `auth/callback/page.tsx` | 콜백 스피너 → `<LoadingScreen />` |
| `auth/popup/page.tsx` | 팝업 스피너 → `<LoadingScreen />` |
| `demo/stocks/components/KoreanStockChart.tsx` | 차트 스피너 → 미니 memo 스타일 인라인 (차트 영역 내장) |

**최종 로딩 통일 현황**

| 상황 | UI |
|------|-----|
| 앱 최초 진입 (서버 웨이크업) | Minimal Memo 전체 화면 (`waking` prop) |
| `/demo/*`, `/dashboard/*` 페이지 이동 | Minimal Memo 전체 화면 |
| 세션 체크 중 | Minimal Memo 전체 화면 |
| API 데이터 로딩 (react-query) | Minimal Memo 전체 화면 |
| 차트 데이터 로딩 (컴포넌트 내장) | 미니 memo 스타일 인라인 |

#### 🔜 다음 작업
- 대시보드 내 정보 카드 → settings API 연동
- 가계부 페이지 API 신규 구현 (GET/POST/PATCH/DELETE)
- 주식 페이지 API 신규 구현

---

### 2026-07-06 (세션 4)

#### ✅ "내 자산 설정" 이름 변경

- 전체 코드베이스에서 "내 정보 설정" → "내 자산 설정" 텍스트 일괄 수정
- 관련 파일: `setup/page.tsx`, `settings/page.tsx`, `demo/settings/page.tsx`, `CLAUDE.md` 등

#### ✅ 자산 설정 히스토리 기능 구현 (BE + FE 전체)

**BE 스키마 변경** (`inote-server/prisma/schema.prisma`)
- `UserSetting` — `memo String?` 필드 추가
- `SettingHistory` 모델 신규 추가
  ```
  id / userId / month / title? / salary / salaryDate / dailyLimit /
  monthlySavingGoal / assetUpdateDate / savings(Json) / fixedExpenses(Json) /
  memo? / recordedAt(DateTime @default(now))
  ```
- `user` 모델 — `settingHistories SettingHistory[]` 관계 추가
- `prisma migrate dev` 대신 `prisma db push` 사용 (Better Auth가 DB에 추가한 컬럼으로 migration drift 발생)

**BE API 추가** (`inote-server/src/money/settings/`)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/money/settings/history` | 히스토리 목록 (최신순) |
| POST | `/money/settings/history` | 현재 설정 스냅샷 저장 |
| GET | `/money/settings/history/:id` | 단건 조회 |
| PATCH | `/money/settings/history/:id` | 제목 수정 |
| DELETE | `/money/settings/history/:id` | 삭제 (204) |

- DTO 신규: `CreateSettingHistoryDto` (month, title?), `UpdateSettingHistoryDto` (title?)
- `UpsertSettingsDto` — `memo?: string` 필드 추가
- 소유권 체크: `userId !== item.userId` 시 `ForbiddenException`

**FE 변경**

*`/dashboard/setup/page.tsx`*
- 헤더 우측 "히스토리" 버튼 추가 → `/dashboard/setup/history`
- 저장 성공 후 히스토리 기록 확인 모달 표시 (제목 입력 + 기록하기 / 건너뛰기)
- `saveHistory` mutation — `POST /money/settings/history`
- 메모 `<Textarea>` 섹션 추가 (저장 시 API에 함께 전송)

*`/dashboard/setup/history/page.tsx` (신규)*
- 히스토리 목록 — 제목(없으면 월 라벨), 기록일(시:분:초), 기본 정보 요약
- 카드 클릭 → 상세 페이지 이동

*`/dashboard/setup/history/[id]/page.tsx` (신규)*
- 헤더: ✏️ 제목 인라인 수정 + 🗑 삭제 버튼
- 섹션: 기본 정보 그리드 / 적금 목록 / 고정 지출 목록 / 메모 (있을 때만)
- 제목 수정: `PATCH /money/settings/history/:id`
- 삭제: `DELETE` 후 `router.back()`

#### ✅ shadcn Dialog 설치 및 전체 모달 교체

**설치**
- `npx shadcn add dialog` → `src/components/ui/dialog.tsx` 생성 (`@base-ui/react/dialog` 기반)
- `button.tsx` 덮어쓰기 방지 — 설치 시 "N" 선택

**`dialog.tsx` 커스터마이징**
- `DialogOverlay` — 기본 배경 `bg-black/40 backdrop-blur-sm`으로 프로젝트 스타일 통일
- `DialogPopup` 신규 추가 — bottom-sheet 모달용 커스텀 포지셔닝 래퍼
  - `DialogPrimitive.Popup`을 `fixed inset-0 flex` 컨테이너로 사용 가능하게 래핑
  - 접근성(ESC 닫기, 포커스 트랩, aria-modal) 자동 적용

**교체 파일 목록**

| 파일 | 교체 방식 | 비고 |
|------|---------|------|
| `dashboard/setup/page.tsx` | `Dialog` + `DialogContent` + `DialogHeader` | 히스토리 기록 확인 |
| `dashboard/setup/history/[id]/page.tsx` | `Dialog` + `DialogContent` + `DialogHeader` | 삭제 확인 |
| `demo/stocks/page.tsx` (StockModal) | `Dialog` + `DialogPortal` + `DialogOverlay` + `DialogPopup` | bottom-sheet 유지 |
| `demo/account-book/AddExpenseModal.tsx` | 동일 | bottom-sheet 유지 |
| `demo/account-book/DayDetailModal.tsx` | 동일 | 고정 높이 bottom-sheet |

#### 🔜 다음 작업
- 대시보드 내 자산 카드 → settings API 연동
- 가계부 페이지 API 신규 구현 (GET/POST/PATCH/DELETE)
- 주식 페이지 API 신규 구현

---

### 2026-07-06 (세션 3)

#### ✅ shadcn/ui Input · Textarea 컴포넌트 전체 적용

**배경**
- `components/ui/`에 `button`만 있고 `input`, `textarea`는 shadcn 미설치 상태
- 20개 이상 파일에서 동일한 `className` 문자열을 반복 사용 중

**컴포넌트 커스터마이징** (`apps/web/src/components/ui/`)
- `input.tsx` — `@base-ui/react/input` 기반, 프로젝트 스타일 적용
  - `bg-gray-50`, `rounded-xl`, `focus-visible:ring-green-200` 등
- `textarea.tsx` — 네이티브 `<textarea>` 기반, Input과 동일한 스타일

**적용 파일 목록**

| 파일 | 변경 내용 |
|------|-----------|
| `settings/page.tsx` | 이름·직책·소개 입력 → `<Input>` + `<Textarea>` |
| `demo/settings/page.tsx` | 동일 |
| `dashboard/page.tsx` | 주간·월간 리뷰 → `<Textarea>`, `TEXTAREA` 상수 제거 |
| `demo/dashboard/page.tsx` | 동일 |
| `dashboard/setup/page.tsx` | DynamicList 이름 입력 → `<Input className="flex-1">` |
| `demo/dashboard/setup/page.tsx` | 동일 + import 추가 |
| `demo/stocks/page.tsx` | 종목명·티커·메모 → `<Input>`, 수량·매입가·투자금액 → `<Input className="pr-*">` |

**의도적으로 유지한 raw input**
- `NumberField` / DynamicList 금액 입력: 래퍼 div + "원" suffix 패턴 필요 (`INPUT_WRAP` + `INPUT_BASE` 유지)
- account-book 모달 인라인 수정 폼: 파란색 편집 상태 스타일로 의도적으로 다름

#### 🔜 다음 작업
- 대시보드 내 정보 카드 → settings API 연동
- 가계부 페이지 API 신규 구현 (GET/POST/PATCH/DELETE)
- 주식 페이지 API 신규 구현

---

### 2026-05-08

#### ✅ 프로젝트 초기 세팅
- 레포 구조 확정 (`apps/web`, `apps/app`, `backend`, `packages`)
- `CLAUDE.md` 작성 — 프로젝트 맥락 기준 문서
- `DEV_LOG.md` 작성 (이 파일)

#### ✅ apps/web — Next.js 초기 설정
- Next.js 16.2.6 생성 (TypeScript + App Router + src/ 구조 + Tailwind CSS)
- shadcn/ui 초기화 (base-nova 스타일, @base-ui/react 기반)
  - 주의: 이 버전 shadcn Button은 `asChild` prop 미지원 → Link에는 `buttonVariants` 직접 사용
- 포인트 컬러 초록 적용 (`globals.css` CSS 변수 `--primary` oklch 값 변경)
- 홈(`/`) 랜딩 페이지 작성

#### ✅ /demo — 가계부 UI 프로토타입
실제 데이터 연결 없이 하드코딩 더미 데이터로만 구성된 프로토타입.

**파일 구조**
```
src/app/demo/
├── data.ts                       ← 타입 정의 + 5월 더미 데이터 (8일치)
├── page.tsx                      ← 메인 페이지 (전체 상태 관리, "use client")
└── components/
    ├── SummaryCards.tsx          ← 상단 요약 카드 4개
    ├── LedgerCalendar.tsx        ← 반응형 달력
    ├── DayDetailModal.tsx        ← 날짜 클릭 시 상세 모달
    └── AddExpenseModal.tsx       ← 지출 입력 모달
```

**구현 기능**
- 상단 요약 카드 4개: 이번달 월급 / 총지출 / 남은금액 / 현금통장잔액
- 반응형 달력
  - 월 이동 (◀︎ ▶︎)
  - 오늘 날짜 초록 원 강조
  - 날짜 셀: 총지출 + 낭비금액 + 건수 표시 (데스크탑)
  - 날짜 셀: 컬러 점(●●)으로 표시 (모바일)
- 일별 상세 모달 (바텀시트 / 센터 모달 반응형)
  - 총지출 / 낭비 요약 카드
  - 지출 목록 (사용처 + 카테고리 뱃지 + 금액)
  - 낭비 항목: ⚠️ 아이콘 + 주황 금액
  - 지출 추가 버튼
- 지출 입력 모달
  - 금액 / 사용처 / 카테고리 선택 / 낭비 토글 / 저장
  - 저장 시 해당 세션 내 실제 반영 (새로고침 시 초기화)
- 데스크탑 레이아웃: 좌측 사이드바 + 우측 캘린더 2열
  - 사이드바: 요약 카드 + 이번달 낭비금액 + 카테고리별 지출 바 차트

**더미 데이터 범위**: 2026-05-01 ~ 2026-05-08

---

### 2026-05-10

#### ✅ /demo 가계부 — 뷰 전환 (달력 / 주차별 / 전체 로그)

**파일 구조 변경**
```
src/app/demo/
├── data.ts
├── page.tsx                      ← 뷰 상태 ("calendar" | "weekly" | "all") 추가
└── components/
    ├── SummaryCards.tsx
    ├── LedgerCalendar.tsx
    ├── DayDetailModal.tsx
    ├── AddExpenseModal.tsx
    ├── WeeklyLogView.tsx         ← 신규: 주차별 뷰
    └── AllLogView.tsx            ← 신규: 전체 로그 뷰 (무한 스크롤)
```

**구현 내용**
- 상단 탭 3개 (달력 / 주차별 / 전체 로그) 토글
- **주차별 뷰** (`WeeklyLogView`)
  - 현재 주차 데이터만 표시 (기본값: 가장 최근 주차)
  - 좌우 화살표(◀ ▶)로 주차 이동
  - 데이터 있는 주차만 순환 / 양 끝에서 버튼 비활성화
- **전체 로그 뷰** (`AllLogView`)
  - 전체 데이터 최신순 나열
  - IntersectionObserver 기반 무한 스크롤 (5개 날짜씩 추가)
  - 마지막 항목 도달 시 "모든 내역을 불러왔습니다" 표시
- 날짜 카드 공통: 날짜+요일 헤더 / 지출 목록 / 낭비 주황 표시 / 일별 합계 푸터
- 항목 클릭 시 일별 상세 모달 오픈

---

### 2026-05-11

#### ✅ 주차별 뷰 — 오늘 카드 + 인라인 입력 개선

**오늘 카드 (TodayCard) 신규 설계**
- 현재 주차에 오늘 날짜 카드 항상 표시 (데이터 유무 무관)
- 접힌 상태: "오늘 지출 내역이 없습니다. 탭하여 추가하세요" → 클릭 시 폼 펼침
- 입력 폼 한 줄 구성: 금액 입력 + 사용처(선택) + 낭비 토글
- 카테고리 칩 + 추가/닫기 버튼 (space-between)
- **추가** 클릭 시 폼 초기화 + 열린 상태 유지 → 연속 입력 가능
- 추가된 항목은 하단 리스트에 즉시 누적
- 리스트 하단 푸터: 건수 + 낭비금액 + 총금액

**UX 결정 사항**
- 사용처는 선택 입력 (미입력 시 `-` 로 저장)
- 금액만 있으면 추가 버튼 활성화
- Enter 키로도 추가 가능

**저장 버튼 연결**
- 저장 버튼 `onClick={() => setExpanded(false)}` 연결 → 폼 닫힘
- 데모에서는 `onAdd` 호출 시점에 이미 부모 state에 반영되므로 저장 = 폼 접기
- 접힌 상태에서 "n건 입력됨 · 탭하여 추가" 문구로 입력 건수 확인 가능

**최종 확정된 TodayCard UI 구조**
- 헤더: 날짜 + [오늘] 뱃지 (인라인) / 오른쪽 ✕ 닫기 버튼 (펼침 시)
- 입력 폼: 금액(w-36) + 사용처(flex-1, 선택) + 낭비 토글 — 한 줄
- 카테고리 칩 + [추가] 버튼 (space-between)
- 리스트: `금액 [⚠️] 사용처 (카테고리)` 좌측 정렬
- 푸터: `총액  낭비금액  건수` 왼쪽 / `[저장]` 오른쪽

**미해결 / 추후 검토**
- 주차 계산 방식: 현재 `Math.ceil(day/7)` → 실제 서비스에서는 월요일 기준 ISO 주차로 변경 필요
- 오늘이 월의 첫 주 월요일 이전이면 이전 달 날짜도 같은 주차로 묶이는 케이스 처리 필요

---

### 2026-05-12

#### ✅ 주차별 / 전체 로그 뷰 — 카드 UX 통합 개선

**TodayCard + DayCard 통합**
- 기존 TodayCard / DayCard 두 컴포넌트를 단일 `DayCard`로 통합
- 저장 후 접힌 상태에서도 입력된 아이템 리스트 그대로 표시 (기존: "N건 입력됨" 문구만 표시)
- 모든 카드 클릭 시 인라인 입력 폼 열림 (오늘 + 과거 날짜 모두 동일)
- 폼 열린 상태에서 저장(✕) 버튼으로 닫기

**전체 로그 뷰 동일 카드 적용**
- AllLogView도 동일한 DayCard 형태로 변경
- 전체 로그 최상단에도 오늘 카드 표시 (데이터 유무 무관)

**카테고리 뱃지 통합**
- `CATEGORY_BADGE` 를 `data.ts`에 공통 export로 이동 (중복 제거)
- 달력 모달 / 주차별 / 전체 로그 세 곳 모두 컬러 뱃지 적용
  - 식비 초록 / 카페 황색 / 교통 파랑 / 쇼핑 보라 / 의료 빨강 / 문화 핑크 / 구독 인디고 / 기타 회색
- 달력 모달 아이템도 금액 → 사용처 → 뱃지 순서로 통일

#### ✅ 지출 입력 UX — pending 패턴 적용 (전체 통일)

**변경 사유**
- 기존: "추가" 클릭 시 즉시 부모 state에 저장됨 → UX 어색
- 개선: "추가"는 로컬 pendingItems에만 누적, "저장 (N)" 클릭 시 일괄 반영

**적용 범위**
- `WeeklyLogView.tsx` DayCard — pending 패턴 적용
- `AllLogView.tsx` DayCard — pending 패턴 적용
- `DayDetailModal.tsx` — pending 패턴 적용 + 모달 고정 높이(`h-[82vh] sm:h-[600px]`) + 리스트 스크롤

**UX 동작**
- "추가" 클릭 → pendingItems 배열에 추가, 폼 초기화 후 열린 상태 유지 (연속 입력 가능)
- 미저장 항목은 `bg-green-50/40` 배경 + "미저장" 라벨로 구분 표시
- 총액/낭비/건수 푸터는 saved + pending 합산하여 실시간 표시
- "저장 (N)" 클릭 → 모든 pending 항목 onAdd 호출 후 폼 닫힘
- 폼 닫기(✕) 클릭 → pending 항목 전체 버림 (저장 없이 취소)

#### ✅ 전체 CRUD 완성 — 수정 / 삭제 / pending 항목 편집

**수정 (Edit)**
- 각 지출 항목 hover 시 수정(✏️) 버튼 노출
- 클릭 시 해당 행이 인라인 `InlineEditForm`으로 전환 (파란 테두리)
- 저장 시 해당 항목만 업데이트, 취소 시 원상 복귀
- 적용 범위: DayDetailModal / WeeklyLogView DayCard / AllLogView DayCard

**삭제 (Delete)**
- hover 시 삭제(🗑) 버튼 노출 → 즉시 제거
- 적용 범위: 위 세 곳 동일

**pending 항목 편집/삭제**
- "미저장" 라벨 영역 hover 시 편집(✏️) / 제거(✕) 버튼 노출
- 편집: 해당 pending 행이 `InlineEditForm`으로 전환 (저장된 항목과 동일 UX)
- 제거: pendingItems 배열에서 즉시 제거 (부모 state에는 영향 없음)

**hover 레이아웃 안정화**
- 기존 `hidden group-hover:flex` → 버튼 등장 시 행 높이/너비 변화 문제
- 수정: `opacity-0/opacity-100` + `absolute` 포지셔닝 + 고정 너비 컨테이너로 레이아웃 고정

**중복 key 버그 수정**
- pending 항목 여러 개 일괄 저장 시 `Date.now()` 동일 → React key 중복 에러
- 수정: `useRef` 카운터 추가 → `id = \`${Date.now()}-${counter}\`` 형태로 고유성 보장

#### ✅ DayDetailModal UX 개선

- "지출 추가" 토글 버튼 제거 → 입력 폼 항상 표시
- 하단 버튼: "닫기" (모달 닫기) + "저장 (N)" (pending 일괄 저장 후 닫기)
- 저장 시 `onClose()` 자동 호출

#### ✅ 낭비 입력 방식 변경 — 스위치 → 칩 → 동그라미 체크박스

- 1차: 슬라이드 토글 스위치 → pill 칩 버튼으로 변경
- 2차: 카테고리 칩 줄에서 분리 → 입력 필드 하단 동그라미 체크박스로 변경
  - 비활성: 회색 빈 원 + "낭비" 회색 텍스트
  - 활성: 주황 채워진 원 + 체크 아이콘 + "낭비" 주황 텍스트
- 적용 범위: DayDetailModal / WeeklyLogView DayCard / AllLogView DayCard

#### ✅ 입력 폼 레이아웃 전면 개선 (전체 뷰 통일)

**개선 전 문제점**
- "추가" 버튼이 카테고리 칩 줄 끝에 작게 위치 → 눈에 안 띔
- 낭비 버튼이 카테고리 칩과 같은 줄 → 성격이 다른 요소가 혼재
- 입력 흐름 (금액 → 사용처 → 낭비) → 카테고리 선택 순서가 부자연스러움

**개선 후 구조** (DayDetailModal / WeeklyLogView / AllLogView 동일 적용)
```
[카테고리 칩들]             ← 1줄: 먼저 성격 분류
[금액 입력] [사용처 입력]   ← 2줄: 금액 입력
○ 낭비                     ← 3줄: 낭비 여부 (작은 체크박스)
[      + 추가하기      ]   ← 4줄: 풀 width 버튼, 금액 없으면 비활성
```

**InlineEditForm (수정 폼)도 동일 구조 적용**
```
[카테고리 칩들]
[금액] [사용처] [✕취소] [✓저장]
○ 낭비
```

**모바일 UX**
- 수정/삭제 버튼: 모바일에서 항상 표시 (`sm:opacity-0 sm:group-hover:opacity-100`)

#### 🔜 다음: 모바일 전용 레이아웃 개발

현재 `/demo` 가계부는 웹/태블릿 기준으로 구현 완료.
모바일 전용 레이아웃은 별도로 개발 예정 (하단 탭 네비게이션 포함).

---

### 2026-06-01 (세션 1)

#### ✅ 지출 추가 UX — 데스크탑 + 모바일 FAB

**배경**
- 기존에는 달력 날짜 셀 클릭 / DayCard 열기로만 지출 추가 가능 → 진입점이 숨겨져 있어 불편
- 데스크탑과 모바일 각각에 맞는 빠른 추가 진입점 필요

**데스크탑 — 탭 우측 "+ 오늘 추가" 버튼**
- 뷰 전환 탭 (`달력 / 주차별 / 전체 로그`) 우측에 초록 버튼 배치
- 클릭 시 오늘 날짜 기준 `DayDetailModal` 즉시 오픈
- `hidden lg:flex` — 데스크탑에서만 표시

**모바일 — 우측 하단 FAB (Floating Action Button)**
- 화면 우측 하단 고정 (`fixed bottom-6 right-5`)
- 초록 원형 버튼 (`w-14 h-14 rounded-full`), "+" 텍스트
- 클릭 시 오늘 날짜 기준 `DayDetailModal` 오픈
- `active:scale-95` 터치 피드백
- `lg:hidden` — 모바일에서만 표시

**달력 모바일 전체 너비 개선**
- 달력 컴포넌트가 모바일에서 우측에 여백이 남는 문제 수정
- 원인: flex 컨테이너의 `items-start` → 모바일 `flex-col`에서 자식이 stretch 되지 않음
- 수정: `lg:items-start`로 변경 → 모바일 기본 stretch 복원
- 달력 wrapper에 `px-3 lg:px-0` 추가 (모바일 좌우 약간의 패딩)

---

### 2026-06-01 (세션 2)

#### ✅ 프로젝트 구조 개편 — 메뉴 기반 멀티 섹션

**배경**
- 가계부만 있던 `/demo`를 5개 섹션이 있는 앱 구조로 확장

**새 라우트 구조**
```
/demo                       → /demo/dashboard 리다이렉트
/demo/layout.tsx            ← 공통 네비게이션 레이아웃
/demo/dashboard             ← 자산 관리 (메인)
/demo/dashboard/setup       ← 내 정보 설정/수정
/demo/account-book          ← 가계부 (기존 /demo 이동)
/demo/stocks                ← 주식 (준비 중)
/demo/financial-knowledge   ← 금융 지식 (준비 중)
/demo/mini-game             ← 미니게임 - 캐시 플로우 (준비 중)
```

**네비게이션 (`demo/layout.tsx`)**
- 데스크탑: 좌측 고정 사이드바 (`w-56`) — 로고 + 5개 메뉴 + 활성 초록 하이라이트
- 모바일: 하단 탭 바 — 아이콘 + 라벨 5개
- 아이콘: lucide-react (LayoutDashboard, BookOpen, TrendingUp, GraduationCap, Gamepad2)

#### ✅ 자산 관리 대시보드 (`/demo/dashboard`)

**내 정보 카드**
- 월급 / 적금 합계(N개) / 고정지출 합계(N개) / 일일 한도 요약 표시
- "상세보기 ▼" 클릭 시 인라인 펼침 — 적금 목록 + 고정지출 목록 상세
- "수정" 링크 → `/demo/dashboard/setup`

**주간 리뷰 카드**
- 주 이동 (◀ ▶), 이번 주 날짜 범위 표시
- 이번 주 지출 / 낭비 금액 (가계부 연결 예정, 현재 0원)
- 지난주 비교 — 가로 바 차트
- ⭐ 별점 (1~5) + 리뷰 텍스트 영역
- 저장 → localStorage 영구 보관

**월간 요약 카드**
- 월 이동 (◀ ▶), 년월 표시
- 총 지출 / 낭비 / 저축 목표 표시
- 지난달 비교 — 가로 바 차트
- ⭐ 별점 + 리뷰 텍스트
- 저장 → localStorage 영구 보관

#### ✅ 내 정보 설정 페이지 (`/demo/dashboard/setup`)

**섹션 구성**
- 기본 정보: 월급 / 일일 한도 / 월 저축 목표
- 적금: 이름 + 금액, 여러 개 추가/삭제, 합계 자동 계산
- 고정 지출: 이름 + 금액, 여러 개 추가/삭제 (ex. 넷플릭스, 보험, 통신비)
- 저장 시 localStorage에 보관

**UX**
- `+적금 추가` / `+고정 지출 추가` 점선 버튼으로 행 추가
- ✕ 버튼으로 행 삭제
- 각 섹션 우측 상단에 실시간 합계 표시

---

### 2026-06-01 (세션 3)

#### ✅ 다크 모드 시스템 구축

**배경**
- 설정 메뉴 추가, 앱 전체 다크/라이트 모드 토글 필요

**구현 방식**
- `demo/dark-mode.tsx` — `DarkModeProvider` + `useDarkMode` 훅 (React Context)
- 루트 레이아웃 div에 `isDark && "dark"` 클래스 조건부 적용
- Tailwind `dark:` 변형 클래스로 컴포넌트 개별 스타일링
- localStorage(`inote-dark`) 영구 보관

**설정 페이지 (`/demo/settings`)**
- 프로필 편집: 이름 / 직업·직책 / 한 줄 소개, 저장 시 localStorage(`inote-profile`) 보관
- "저장됨 ✓" 2초 피드백 상태
- 다크 모드 토글 스위치 (Sun/Moon 아이콘 + 슬라이드 버튼)
- 데스크탑 사이드바 하단 고정 / 모바일 탭바 6번째 항목

**다크 모드 적용 범위 (이번 세션)**
- `demo/layout.tsx` — 사이드바 + 하단 탭바 + 메인 래퍼
- `demo/dashboard/page.tsx` — 모든 카드, 입력 필드, 버튼
- `demo/dashboard/setup/page.tsx` — 기본 정보 / 적금 / 고정 지출 카드, 동적 리스트

**미적용 (다음 세션으로 이월)**
- `demo/account-book` — 가계부 뷰 및 모달 컴포넌트 전체

---

### 2026-06-01 (세션 4)

#### ✅ 가계부 전체 다크모드 적용

**적용 컴포넌트**
- `SummaryCards.tsx` — 카드별 배경색 `bg-*-50 dark:bg-*-900/20` 방식 (data-driven)
- `LedgerCalendar.tsx` — 캘린더 컨테이너, 셀, 범례, 네비게이션 버튼
- `DayDetailModal.tsx` — 모달 전체, InlineEditForm, 카테고리 칩, 입력 필드
- `WeeklyLogView.tsx` / `AllLogView.tsx` — DayCard, 폼, 미저장 pending 배경
- `account-book/page.tsx` — 낭비 요약 카드, 카테고리별 지출 카드, 뷰 토글 탭

---

### 2026-06-01 (세션 5)

#### ✅ 대시보드 설정 — 날짜 필드 추가

**변경 내용 (`/demo/dashboard/setup`)**
- `ListItem` 타입에 `day: string` 필드 추가 (적금·고정지출 이체일)
- `FormState`에 `incomeDay`, `assetUpdateDay` 추가
- `DaySelect` 컴포넌트 신규 (1~31일 선택 드롭다운, `w-[72px]`)
- `NumberField`에 선택적 `day` + `onDayChange` prop → 월급 입금일 inline 표시
- `DynamicList` 행: `[이름] [금액] [날짜] [삭제]` 4열 구조
- 자산 업데이트일 standalone DaySelect 추가

**대시보드 표시 (`/demo/dashboard`)**
- 월급 셀: 금액 아래 "매달 N일 입금" 서브텍스트
- 상세 펼침 시: 자산 업데이트일, 각 항목 이체일 표시

---

### 2026-06-08 (세션 6)

#### ✅ 주식 페이지 초기 구현 (`/demo/stocks`)

**구성**
- 환율 영역: USD/KRW, 100엔/KRW, EUR/KRW — `open.er-api.com` 무료 API
- 내 보유 종목 영역: 가로 스크롤 카드 (좌우 슬라이드 버튼)
- 주식 차트 영역: TradingView iframe embed (전체 너비)

**초기 차트 방식: TradingView 스크립트 → iframe으로 전환**
- 처음에 `tv.js` 스크립트 방식 시도 → 종목 전환 시 이전 차트 잔류 버그
- iframe `key={src}` 방식으로 변경 → URL 변경 시 DOM 완전 교체로 해결

**입력 방식 2가지 지원**
- 수량 모드 (국내 기본): 보유 수량(주) + 평균 매입가
- 금액 모드 (해외 기본): 투자 총액(USD)만 입력
- 통화 선택(KRW/USD) 시 inputMode 자동 전환

**샘플 데이터**
- 국내: 삼성전자, TIGER S&P500, TIGER 나스닥100, TIGER 미국우주테크
- 해외: 엔비디아, 애플, 테슬라, 마이크로소프트

---

### 2026-06-10 (세션 7)

#### ✅ 주식 페이지 — 국내/해외 2섹션 분리 + Naver API 차트

**레이아웃 재구성**
```
환율 영역 (USD/KRW, 100엔, EUR)
──────────────────────────────
국내 주식 / ETF 섹션
  [가로 스크롤 카드] + 좌우 슬라이드 버튼
  [차트: Naver 금융 + Lightweight Charts]
──────────────────────────────
해외 주식 섹션
  [가로 스크롤 카드]
  [차트: TradingView iframe]
```

**신규: Next.js API Route 프록시**
- `src/app/api/stock/[ticker]/route.ts`
- Naver `fchart.stock.naver.com/siseJson.nhn` CORS 우회
- OHLCV 파싱 → `{ time: "YYYY-MM-DD", open, high, low, close, volume }[]`
- 5분 캐시 (`Cache-Control: public, max-age=300`)

**신규: KoreanStockChart 컴포넌트**
- `src/app/demo/stocks/components/KoreanStockChart.tsx`
- `lightweight-charts` v5 (`chart.addSeries(CandlestickSeries, ...)`)
- 로딩 스피너 / 에러 상태 처리
- 다크모드 대응 (배경, 그리드, 텍스트 색상)
- 녹색/빨간 캔들 (상승/하락)
- `ResizeObserver`로 컨테이너 크기 변화 대응

**섹션별 독립 상태**
- `domesticSelectedId` / `foreignSelectedId` 분리
- 섹션별 `scrollRef` 분리
- 추가 버튼: 국내 섹션 → `defaultCurrency: "KRW"`, 해외 → `"USD"` 자동 세팅

---

### 2026-08-04 (세션 8)

#### ✅ 캐시플로우 보드게임 데모 구현 (`/demo/mini-game`)

Google AI Studio로 제작한 Vite/React 버전 보드게임을 Next.js App Router + 라이트 테마로 이식.
AI Studio 할당량 초과로 Claude Code가 테마 전환 포함 전체 이식 직접 수행.

**이전 구현 (카드 기반) → 신규 구현 (보드 기반) 전면 교체**

삭제한 파일:
- `data/jobs.ts`, `data/opportunity-cards.ts`, `data/doodad-cards.ts`, `data/market-cards.ts`
- `lib/game-engine.ts`, `lib/ai-player.ts`
- `components/SetupScreen.tsx`, `components/GameScreen.tsx`, `components/ResultScreen.tsx`, `components/AiTurnDisplay.tsx`

**신규 파일 구조**
```
apps/web/src/app/demo/mini-game/
├── types.ts              ← 전체 타입 (Profession, BoardSpace, DealCard 등)
├── page.tsx              ← 게임 상태 관리 + 핸들러 전체
├── data/
│   ├── board.ts          ← 12칸 보드 정의
│   ├── professions.ts    ← 6개 직업 (급여/부채/저축 데이터)
│   └── cards.ts          ← 소액 6장, 대형 5장, 지출 6장, 시장 6장
├── lib/
│   └── gameLogic.ts      ← 패시브 인컴/총지출/잉여현금/승리조건 계산
└── components/
    ├── BoardView.tsx       ← 12칸 보드 레이아웃 + 주사위 패널
    ├── GameHeader.tsx      ← 상단 현황바 (현금/패시브인컴/잉여현금)
    ├── CardModal.tsx       ← 공간 도착 시 카드 모달 (7종 처리)
    ├── ProfessionSelectModal.tsx ← 직업 선택 + 재무제표 미리보기
    ├── FinancialStatement.tsx    ← 수입/지출/자산/부채/로그 3탭
    ├── BankModal.tsx             ← 은행 대출·상환 + 부채 조기상환
    └── VictoryModal.tsx          ← 쥐경주 탈출 성공 화면
```

**게임 규칙 구현**
- 12칸 보드: Payday(0,6), 소액투자(1,7,11), 지출(2), 시장(3), 대형투자(4,9), 자녀(5), 자선(8), 실직(10)
- 6개 직업: 의사($13,200) / 엔지니어($4,900) / 교사($3,300) / 트럭운전사($2,500) / 비서($2,500) / 변호사($7,500)
- 승리 조건: 패시브 인컴 > 월 총지출 (쥐경주 탈출)
- 자선 칸: 총수입 10% 기부 → 3턴 주사위 2개 선택 가능
- 실직 칸: `downsizedTurnsLeft=1` 설정, 다음 턴 자동 스킵
- 은행 대출: $1,000 단위, 월 이자 = 대출액 × 10%

**테마 전환 (dark → light)**
| 이전 (dark) | 신규 (light) |
|---|---|
| `bg-slate-900` | `bg-white` |
| `bg-slate-800` | `bg-stone-100` |
| `bg-slate-700` | `bg-stone-200` |
| `text-white` | `text-stone-900` |
| `text-slate-400` | `text-stone-400` |
| 포인트 컬러 | emerald/amber/rose 유지 |

**Next.js 적용 사항**
- `'use client'` 디렉티브 추가
- React import 제거 (불필요)
- `export const Component: React.FC` → `export function Component()`
- import 경로: `../types/game` → `../types`, `../utils/gameLogic` → `../lib/gameLogic`

---

### 2026-08-04 (세션 9)

#### ✅ `/demo/mini-game` 애니메이션 3종 추가 + 사람 QA 진행

**Task #2: 토큰 이동 애니메이션**
- 주사위 굴리면 말이 한 칸씩 200ms/step으로 순차 이동
- 이동 중 파란색 `→` 뱃지, 착지 후 황금색 `MY TOKEN` bounce 뱃지
- `tokenPosition`(시각) 상태와 `player.currentSpaceIndex`(게임) 상태 분리 — `page.tsx`

**Task #3: 부유 금액 텍스트 애니메이션**
- 현금 변동 시(월급날·소비·매수·매각·대출·상환) `+N만원`/`-N만원` 텍스트가 보드 중앙에서 떠오르며 페이드아웃 (1.6s, 랜덤 좌우 오프셋)
- 녹색(수입) / 빨간색(지출), `FloatItem` 타입 + `addFloat` 훅 — `page.tsx`

**Task #4: 카드 플립 애니메이션**
- 카드 모달 등장 시 `rotateY(90deg → 0deg)` 0.42s flip — `CardModal.tsx`의 `card-flip-in` keyframe

#### 🐛 버그 픽스 — 은행 대출 모달이 카드 모달에 가려짐

카드 모달(지출 등) 안에서 "은행 대출 열기" 클릭 시 `BankModal`과 `CardModal`이 동시에 열리는데, 둘 다 `z-50`이라 JSX상 나중에 렌더링되는 `CardModal`이 위로 덮어버림.
→ `BankModal.tsx`의 오버레이를 `z-[60]`으로 올려 항상 위에 표시되도록 수정.

#### ✅ 사람(사용자) 브라우저 QA 진행 — 직업 선택 / 토큰 이동 / 카드 플립 / 부유 텍스트 / 자녀 출산 카드 / 은행 대출 플로우 확인 완료

---

### 2026-08-04 (세션 10)

#### ✅ Render 서버 웨이크업 기능 제거

Render 콜드 스타트 문제가 해소되어 앱 진입 시마다 헬스체크로 서버를 깨우던 로직이 더 이상 필요 없어짐.

**삭제한 파일**
- `src/components/ServerWakeProvider.tsx` — 앱 전체를 감싸던 웨이크업 게이트 컴포넌트
- `src/lib/waitForServer.ts` — 헬스체크 폴링 로직 (connecting → waking → ready/failed)
- `src/app/api/health-check/route.ts` — BE `/api/v1/health` 프록시 Next.js API Route

**수정**
- `src/app/layout.tsx` — `ServerWakeProvider` 래퍼 제거, `ReactQueryProvider` 안에서 `children` 바로 렌더링
- `src/components/LoadingScreen.tsx`는 다른 페이지(`/dashboard`, `/account-book` 등)에서 범용 로딩 UI로 계속 쓰여서 유지

#### 🐛 버그 픽스 — `/demo/mini-game` 하이드레이션 에러

ServerWakeProvider 제거로 페이지가 실제로 서버에서 렌더링되기 시작하면서, 그동안 가려져 있던 잠재 버그가 드러남.
`createInitialPlayerState`가 `useState` lazy initializer 안에서 `new Date().toLocaleTimeString()`으로 초기 로그 타임스탬프를 생성 → 서버 렌더링 시각과 클라이언트 하이드레이션 시각이 달라 텍스트 불일치 에러 발생.
직업 선택 전 미리보기용 로그라 정확한 시각이 중요하지 않으므로 해당 `<span>`에 `suppressHydrationWarning` 추가로 해결 — `page.tsx`.

#### ✅ 사람(사용자) 브라우저 QA 진행 — 하이드레이션 에러 해소, 다른 페이지 정상 동작 확인

---

### 2026-08-04 (세션 11)

#### 🐛 버그 픽스 — `/demo/stocks` 네이버 금융 API 연결 실패 (500)

사람이 `/demo/stocks`에서 국내 주식 차트 로딩 시 콘솔에 `GET /api/stock/005930 500 (Internal Server Error)` 발견, 화면엔 "데이터를 불러올 수 없어요 · 네이버 금융 API 연결 실패" 표시.

**원인**
`apps/web/src/app/api/stock/[ticker]/route.ts`가 네이버 증권 차트 API(`fchart.stock.naver.com/siseJson.nhn`) 응답을 `JSON.parse()`로 직접 파싱하는데, 이 응답이 순수 JSON이 아니라 JS 배열 리터럴 형식 — 헤더 행만 작은따옴표(`'날짜', '시가', ...`)를 쓰고 데이터 행은 큰따옴표를 씀. `JSON.parse`는 작은따옴표 문자열을 허용하지 않아 헤더 행에서 `SyntaxError` 발생 → catch에서 500 응답. 오늘 세션 작업(서버 웨이크업 제거)과 무관한 기존 버그.

**수정**
- `route.ts` — `JSON.parse(text)` → `JSON.parse(text.replace(/'/g, '"'))` (데이터 값은 숫자/날짜뿐이라 따옴표 치환이 안전함)
- 브라우저에서 `/api/stock/005930` 직접 호출로 검증 — `200 OK`, 244개 캔들 정상 반환 확인

---

### 2026-08-05 (세션 12)

#### ✅ `/demo/dashboard` 가계부 데이터 실제 연동 (포트폴리오 캡처용)

소개(포트폴리오) 페이지 캡처를 준비하던 중, `/demo/dashboard`의 주간/월간 지출·낭비 금액이 실제로는 전부 하드코딩된 "0원" + "가계부 연결 예정" 플레이스홀더였다는 걸 확인. 실제 `/dashboard`(실서비스)의 계산 로직을 이식해 데모 가계부 데이터로 실제 계산하도록 구현.

**데이터 추가 — `demo/account-book/data.ts`**
- 기존 `INITIAL_EXPENSES`는 2026년 5월치만 존재 (계산 기준일인 오늘 2026-08-05 기준으로는 "이번 달/이번 주"에 해당하는 데이터가 없어 항상 0원이 나올 수밖에 없었음)
- 7월 전체(지난달 비교용, 총 581,400원) + 8월 1~5일(이번 달/이번 주, 총 140,900원) 목데이터 추가

**로직 이식 — `demo/dashboard/page.tsx`**
- `../account-book/data`의 `INITIAL_EXPENSES` import
- 실제 `/dashboard/page.tsx`의 `filterByWeek`/`filterByMonth`/`sumAmount`/`sumWaste` 패턴을 `ExpenseMap`(날짜별 키) 구조에 맞게 이식 (`itemsInRange`, `itemsInMonth`, `sumAmount`, `sumWaste`)
- 주간/월간 카드의 "0원"·"가계부 연결 예정" 하드코딩 제거 → 실제 계산값 + 지난주/지난달 대비 바 차트(폭 비율) 반영

**검증**
- 브라우저 확인: 이번 주 67,000원(낭비 18,800원, 지난주 192,000원), 8월 총 지출 140,900원(낭비 18,800원, 지난달 581,400원) — 정상 렌더링, 콘솔 에러 없음

#### ✅ `/demo/dashboard` "내 정보" 카드 기본 목데이터 추가

같은 캡처 준비 과정에서 "내 정보" 카드도 `/demo/dashboard/setup`에서 직접 입력해야만 채워지는 구조라 항상 "아직 설정된 정보가 없어요"로 비어 보이던 문제 발견.

- `page.tsx`에 `DEFAULT_SETTINGS` 상수 추가 (월급 3,200,000원, 적금 2건, 고정지출 3건, 일일한도 30,000원 등)
- `localStorage`에 `inote-settings`가 없을 때만 `DEFAULT_SETTINGS`로 초기화 + 저장 (기존 저장값 있으면 그대로 사용)
- 브라우저 확인: 내 정보 카드 정상 렌더링(월급 3,200,000원 / 적금 400,000원(2개) / 고정지출 154,000원(3개) / 일일한도 30,000원), 콘솔 에러 없음

#### ✅ `/demo/mini-game` 진입 시 직업 선택 모달 자동 표시 제거 (포트폴리오 캡처용)

캐시플로우 보드게임 진입 시 직업(캐릭터) 선택 모달이 첫 화면을 가리던 것을, 보드가 먼저 보이고 우측 상단 "직업 변경/새 게임" 버튼으로 필요할 때 열도록 변경.

- `page.tsx` — `showProfessionModal` 초기값 `true` → `false` (기존 리셋 버튼(`onResetGame`)이 이미 `setShowProfessionModal(true)`로 연결돼 있어 별도 배선 불필요)
- 브라우저 확인: 첫 진입 시 보드 즉시 표시, 리셋 버튼 클릭 시 모달 정상 오픈, 콘솔 에러 없음

---

## UI 인사이트 / 기획 메모

### 리스트·테이블 뷰 필요 (2026-05-08)

달력 뷰만으로는 데이터 입력·조회가 불편함.
실제 사용 패턴이 아래처럼 날짜별 항목 나열 방식이라 **리스트/테이블 형태의 뷰**가 추가로 필요.

```
05.01
  2,700   편의점
 15,000   회의
 84,200   인쇄물
  4,000   기타
─────────────────
109,200   (합계)

05.02
  5,000   기타
  4,000   배달
 12,900   식당
─────────────────
 22,600   (합계 / 낭비 1만 2천)
```

**검토할 UI 방향:**
- 달력 뷰 ↔ 리스트 뷰 **탭 전환** 방식
- 리스트 뷰: 날짜별 그룹핑 + 항목 나열 + 일별 합계
- 빠른 입력에 최적화 (항목 탭으로 이동, 엔터로 다음 줄 추가 등)
- 모바일에서 특히 유용할 것으로 예상

---

## 다음 작업 예정

### 2단계 — FE 데모 나머지 화면 (BE 배포와 병행 가능)

- [x] 가계부 — 달력 / 주차별 / 전체 로그 뷰, CRUD
- [x] 가계부 전체 다크모드 적용
- [x] 대시보드 — 내 정보 카드 / 주간 리뷰 / 월간 요약
- [x] 내 정보 설정 — 월급·적금·고정지출·날짜 입력
- [x] 설정 — 프로필 + 다크모드
- [x] 주식 — 국내(Naver API + Lightweight Charts) / 해외(TradingView) / 환율
- [ ] **금융 지식 화면 구현** (`/demo/financial-knowledge`)
- [x] **미니게임 화면 구현** (`/demo/mini-game`) — 캐시플로우 보드게임 이식 완료

### 3단계 — FE + BE 연동 (BE Render 배포 완료)

- [x] 로그인 페이지 실제 연동 (Better Auth Google 소셜 로그인)
- [x] 내 자산 설정 localStorage → 실제 API 교체 (`/api/v1/money/settings`)
- [x] 자산 설정 히스토리 API 연동 (목록·상세·저장·수정·삭제)
- [ ] 대시보드 내 자산 카드 → settings API 연동
- [ ] 가계부 localStorage → 실제 API 교체 (`/api/v1/money/expenses`)
- [ ] 주식 localStorage → 실제 API 교체 (`/api/v1/money/stocks`)
- [ ] 대시보드 ↔ 가계부 데이터 연동
- [ ] 알림 배너 (자산 업데이트일 D-2~3)

### 인프라
- [x] Neon PostgreSQL 세팅 (inote-server)
- [x] Render 배포: inote-server (BE) — https://inote-server-5a63.onrender.com
- [x] Vercel 배포 (FE — inote-money) — https://inote-money.vercel.app

---

## 주요 기술 결정 사항

| 결정 | 내용 | 이유 |
|------|------|------|
| 인증 라이브러리 | Better Auth | Next.js 16 + Prisma 지원, next-auth 대체 |
| DB 호스팅 | Supabase or Neon | 무료 플랜 PostgreSQL |
| FE 배포 | Vercel | Next.js 무료 배포 |
| BE 배포 | Render | NestJS 무료 플랜 (15분 슬립) |
| AWS | 사용 안 함 | 프리티어 1년 후 과금 |
| shadcn 스타일 | base-nova | 설치 시 자동 선택됨 (@base-ui/react 기반) |

---

## 알아두면 좋은 것들

- `shadcn/ui` Button이 `@base-ui/react/button` 기반이라 `asChild` prop 없음
  → Link를 버튼처럼 쓸 때: `<Link className={cn(buttonVariants({ ... }))}>` 패턴 사용
- 더미 데이터는 `src/app/demo/data.ts`의 `INITIAL_EXPENSES` 에 날짜별로 추가
- 카테고리 추가 시 `CATEGORIES` 배열과 `CATEGORY_BADGE` (DayDetailModal), `CATEGORY_COLORS` (page.tsx) 모두 업데이트 필요
