# HANDOFF — inote-money

> PC·채팅·AI 메모리가 바뀌어도 이 파일 + git이 맥락의 단일 소스다.
> **Claude Code / Cursor는 새 세션 시작 시 반드시 이 파일을 먼저 읽는다.**

관련: `CLAUDE.md` (TODO·현재 단계) · `CURSOR.md` (Cursor 역할) · `.cursor/rules/`

---

## 규칙 (항상 적용)

### 왜 필요한가

채팅 메모리는 PC·세션마다 초기화된다. 구현/QA 맥락은 **이 문서에 쓰고 push**해서 이어간다.

### 새 세션 시작 순서 (필수)

1. `git pull`
2. **`docs/handoff/HANDOFF.md` 읽기** ← 이 파일
3. `CLAUDE.md`의 TODO / 현재 단계
4. `CURSOR.md` (Cursor만) 또는 역할 확인
5. 필요 시 `git log -5 --oneline`, 최근 변경 파일

이 순서를 건너뛰고 추측으로 작업하지 않는다.

### 세션 종료 시 (사람 요청 또는 Task 경계에서)

1. 아래 **「현재 상태」** 섹션을 최신으로 갱신
2. 필요 시 `CLAUDE.md` TODO / 현재 단계 동기화
3. 해당 Notion 페이지 직접 갱신 (작업 AI가 직접)
4. commit → push (사람이 요청할 때만)

### Notion 갱신 규칙

- 작업 AI는 세션 종료 전 해당 Notion 페이지를 직접 갱신한다.
- 「현재 상태」에 Notion 갱신 여부를 기록한다.
  예: `Notion 회고 페이지 갱신 완료` / `Notion 미갱신 — 다음 세션에서 처리`
- 사람에게 Notion 갱신 프롬프트를 전달하지 않는다.

### 누가 언제 갱신하는가

| 시점 | 작성자 | 할 일 |
|------|--------|------|
| Claude 구현 Task 끝 | Claude Code | 「현재 상태」+ Cursor용 넘김 항목 작성 |
| Cursor QA 끝 | Cursor | 판정 기록 + FAIL이면 Claude 넘김 항목 작성 |
| PC/세션 전환 직전 | 작업 중이던 AI | 「현재 상태」를 반드시 최신화 후 push 요청 |

### handoff 채팅 프롬프트 첫 줄

채팅으로 넘길 때도 동일 형식을 쓴다. **문서(`HANDOFF.md`)가 우선**, 채팅은 보조다.

- Cursor → Claude: `> **[Cursor → Claude Code]** handoff 프롬프트`
- Claude → Cursor: `> **[Claude Code → Cursor]** handoff`

### 「현재 상태」에 반드시 넣을 것

- 날짜 / 작성자 (Claude | Cursor | 사람)
- 브랜치
- 완료된 단계
- 진행 중 / 다음 Task
- 이번 범위 (해도 됨 / 하지 말 것)
- 변경·참고 파일
- 알려진 이슈
- 상대 AI에게 기대하는 산출물
- QA 판정 (해당 시: PASS / PASS with notes / FAIL)

### 금지

- handoff 없이 PC·세션을 바꾸고 “이전 대화 기억”에 의존하기
- 「현재 상태」를 갱신하지 않은 채 다음 Task 시작하기
- 상대 역할 범위의 작업을 임의로 가져가기

---

## 현재 상태

> 세션이 바뀔 때마다 **이 섹션만** 덮어쓴다. 위 규칙은 유지한다.

### 메타

| 항목 | 값 |
|------|-----|
| 날짜 | 2026-08-05 |
| 작성자 | Claude Code |
| 브랜치 | `main` |
| 다음 수신자 | 사람 (Task #5 confetti 또는 주식 API 연동 중 선택) |

### 완료된 단계

- `/demo/mini-game` 캐시플로우 보드게임 데모 구현 완료 (이전 세션)
- **애니메이션 3종 추가:**
  - **Task #2: 토큰 이동 애니메이션** — 주사위 굴리면 말(말)이 한 칸씩 200ms/step으로 이동. 이동 중 파란색 `→` 뱃지, 착지 후 황금색 `MY TOKEN` bounce 뱃지. `tokenPosition` 시각 상태와 `player.currentSpaceIndex` 게임 상태 분리.
  - **Task #3: 부유 금액 텍스트 애니메이션** — 현금 변동 시(월급날 통과·소비·매수·매각·대출·상환) `+N만원` / `-N만원` 텍스트가 보드 중앙에서 위로 떠오르며 페이드아웃. 녹색(수입) / 빨간색(지출). 1.6s, 랜덤 좌우 오프셋.
  - **Task #4: 카드 플립 애니메이션** — 카드 모달 등장 시 `rotateY(90deg → 0deg)` 0.42s flip. `CardModal` 마운트마다 자동 실행.
- Turbopack 스테일 캐시 이슈 확인: `.next` 전체 삭제로 해결, 게임 동작 정상
- **사람(사용자) 브라우저 QA 진행** — 직업 선택, 토큰 이동, 카드 플립, 부유 텍스트, 자녀 출산 카드, 은행 대출 플로우 확인
- **버그 픽스:** 카드 모달 안에서 "은행 대출 열기" 클릭 시 `BankModal`이 `CardModal`에 가려지던 문제 — 둘 다 `z-50`이라 DOM상 나중에 그려지는 `CardModal`이 위로 덮음 → `BankModal.tsx` 오버레이 `z-[60]`으로 수정, 사람이 재확인 후 정상 동작 확인
- **Render 서버 웨이크업 기능 제거** — 콜드 스타트 이슈 해소되어 `ServerWakeProvider`/`waitForServer.ts`/`/api/health-check` route 삭제, `layout.tsx`에서 래퍼 제거. `LoadingScreen.tsx`는 다른 페이지 범용 로딩 UI로 유지.
- **버그 픽스:** 위 변경으로 페이지가 실제 서버 렌더링되며 드러난 `/demo/mini-game` 하이드레이션 에러(초기 로그 타임스탬프가 `new Date()` 기반이라 서버/클라이언트 값이 다름) — 해당 `<span>`에 `suppressHydrationWarning` 추가로 해결, 사람이 재확인 후 정상 동작 확인
- **버그 픽스:** `/demo/stocks` 네이버 금융 API 500 에러 — `api/stock/[ticker]/route.ts`가 네이버 응답(헤더 행만 작은따옴표인 JS 배열 리터럴)을 `JSON.parse`로 바로 파싱해 SyntaxError 발생 → `text.replace(/'/g, '"')` 후 파싱하도록 수정, 브라우저에서 `/api/stock/005930` 직접 호출로 200 + 244개 캔들 반환 확인
- **`/demo/dashboard` 가계부 데이터 실제 연동** (포트폴리오 소개 페이지 캡처 준비 과정에서 발견) — 주간/월간 지출·낭비 금액이 하드코딩 "0원"이던 것을, 실제 `/dashboard`의 계산 로직을 이식해 `demo/account-book/data.ts`의 `INITIAL_EXPENSES`로 실제 계산하도록 구현. 7월(지난달 비교, 581,400원)/8월 1~5일(이번 달, 140,900원) 목데이터 추가. 브라우저 확인 완료.
- **`/demo/dashboard` "내 정보" 카드 기본 목데이터 추가** — `localStorage`에 `inote-settings`가 없으면 `DEFAULT_SETTINGS`(월급 320만원 등)로 자동 초기화하도록 수정, 항상 "설정된 정보 없음"으로 보이던 문제 해결. 브라우저 확인 완료.
- **`/demo/mini-game` 진입 시 직업 선택 모달 자동 표시 제거** — `showProfessionModal` 초기값을 `false`로 변경해 보드가 먼저 보이도록 하고, 기존 리셋 버튼으로 필요할 때 모달을 열도록 변경. 브라우저 확인 완료.

### 진행 중 / 다음 Task

QA PASS. 다음 둘 중 선택 필요 (사람 결정 대기):
- **Task #5: 폭죽 파티클 (confetti)** — 쥐경주 탈출 승리 시 폭죽 이펙트
- **주식 페이지 API 연동** — 보유 종목 CRUD

### 이번 범위

**해도 됨**
- `/demo/mini-game` 기능 QA + 애니메이션 3종 동작 확인 (사람이 직접 수행)
- 발견된 버그 즉시 픽스 (은행 모달 z-index, 하이드레이션 에러)
- Render 서버 웨이크업 기능 제거 (사람 확인 후 불필요 판단)

**하지 말 것**
- 주식 API 구현 (다음 Task, 미착수)
- 보드게임 규칙 임의 변경
- Task #5 confetti 임의 구현 (다음 Task, 미착수)

### 변경·참고 파일

```
apps/web/src/app/demo/mini-game/
├── page.tsx                    ← FloatItem 타입, addFloat 훅, 토큰 이동 로직, float 트리거, timestamp suppressHydrationWarning
└── components/
    ├── BoardView.tsx           ← tokenPosition/isMoving props, 파란/황금 뱃지, step 이동 표시
    ├── CardModal.tsx           ← card-flip-in CSS keyframe, perspective 오버레이
    └── BankModal.tsx           ← 오버레이 z-index z-50 → z-[60] (카드 모달에 가려지던 버그 픽스)

apps/web/src/app/layout.tsx      ← ServerWakeProvider 래퍼 제거

삭제:
├── apps/web/src/components/ServerWakeProvider.tsx
├── apps/web/src/lib/waitForServer.ts
└── apps/web/src/app/api/health-check/route.ts

apps/web/src/app/api/stock/[ticker]/route.ts  ← 네이버 응답 JSON.parse 전 작은따옴표 치환

apps/web/src/app/demo/dashboard/page.tsx      ← INITIAL_EXPENSES 기반 실제 주간/월간 계산 로직 이식, DEFAULT_SETTINGS 자동 초기화
apps/web/src/app/demo/account-book/data.ts    ← 7월(지난달)/8월(이번달) 목데이터 추가
```

### 알려진 이슈

- Turbopack 콘솔에 `hasCharityBoost is defined multiple times` 에러 메시지 반복 표시됨 — **브라우저 캐시된 과거 이벤트 재생(phantom)**. 실제 파일·서버 로그 에러 없음. `.next` 삭제 후 재시작하면 신규 컴파일 에러 없음. 게임 동작 정상.

### 다음 수신자에게 기대하는 것

**다음 세션 (Claude Code):**
- 사람이 Task #5(confetti) / 주식 API 연동 중 하나를 정하면 그 Task로 착수

### QA 판정

**PASS** — 사람이 직접 브라우저로 확인 (직업 선택, 토큰 이동, 카드 플립, 부유 텍스트, 자녀 출산 카드, 은행 대출 플로우, 서버 웨이크업 제거 후 하이드레이션 에러 해소, 주식 페이지 네이버 API, 대시보드 가계부 연동). 버그 3건 발견 즉시 픽스 완료(은행 모달 z-index, 미니게임 하이드레이션 에러, 주식 네이버 API JSON 파싱) + 대시보드 데모 데이터 연동 1건.
