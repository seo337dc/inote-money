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
| 날짜 | 2026-08-04 |
| 작성자 | Claude Code |
| 브랜치 | `main` |
| 다음 수신자 | Cursor (QA) → Claude Code (주식 API 연동) |

### 완료된 단계

- `/demo/mini-game` 캐시플로우 보드게임 데모 구현 완료
  - 이전 카드 기반 구현 → 보드 기반으로 전면 교체
  - AI Studio Vite/React → Next.js App Router 이식
  - dark slate 테마 → light stone/emerald 테마 전환
  - 12칸 보드 / 6개 직업 / 4종 카드 덱 / 게임 로직 / 7개 컴포넌트
- `error.tsx`, `not-found.tsx` 페이지 추가 (`/`, `/account-book`, `/dashboard`)
- DEV_LOG.md 세션 8 기록 추가
- 커밋·푸시 완료 (`abc829e`)

### 진행 중 / 다음 Task

1. **Cursor:** `/demo/mini-game` QA — 직업 선택 → 보드 이동 → 카드 모달 → 재무제표 → 승리 화면
2. QA PASS 후: **주식 페이지 API 연동** (다음 Claude Code Task)

### 이번 범위

**해도 됨 (Cursor)**
- `/demo/mini-game` 기능 QA (골든 패스 + 엣지케이스)
- 소소한 UI 버그 픽스
- devlog/Notion 정리

**하지 말 것**
- 주식 API 구현 (다음 Task)
- 보드게임 규칙 임의 변경
- 커밋/push (사람 요청 전)

### 변경·참고 파일

```
apps/web/src/app/demo/mini-game/
├── types.ts
├── page.tsx
├── data/board.ts, cards.ts, professions.ts
├── lib/gameLogic.ts
└── components/ (7개)

apps/web/src/app/
├── error.tsx
├── not-found.tsx
├── account-book/error.tsx
└── dashboard/error.tsx
```

### 알려진 이슈

- 없음 (타입 에러 0, 브라우저 동작 확인 완료)

### 다음 수신자에게 기대하는 것

**Cursor:**
- QA 체크리스트: 직업 선택 6종, 주사위 롤 → 각 칸 카드 모달, 소액/대형 매수, 지출 지불, 시장 매각, 자선/실직/자녀 특수 칸, 재무제표 3탭, 은행 대출/상환, 승리 모달
- PASS 후 Notion devlog 갱신

### QA 판정

미수행 (Claude Code → Cursor handoff)
