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
| 날짜 | 2026-08-07 |
| 작성자 | Claude Code |
| 브랜치 | `main` |
| 다음 수신자 | 사람 (`/mini-game` 실서비스 플레이 테스트) |

> 이전 세션들의 상세 이력은 이 섹션에 쌓지 않고 `DEV_LOG.md`(세션 8~14)에 기록되어 있음. 아래는 **가장 최근 세션(14) 기준 현재 상태**만 담음.

### 완료된 단계

- **미니게임을 실서비스 `/mini-game` 페이지로 이전** — `/stocks`, `/account-book`과 동일하게 로그인 필수 실서비스 페이지 신규 구현 (직업 선택 → 플레이 → 승리/포기 시 자동 결과 저장 → "내 플레이 기록" 모달). `/demo/mini-game`은 API 호출 없는 순수 로컬 데모로 원복.
- **버그 픽스 3건** (사람이 실제 플레이하며 발견):
  1. 헤더가 현금 숫자 길이에 따라 레이아웃이 흔들림 → `GameHeader.tsx`를 2행 고정 구조로 변경
  2. "자녀 출산" 카드가 실제로 `childrenCount`를 증가시키지 않던 버그 → `handleAcceptBaby` 핸들러 추가
  3. 보드 중앙 카드가 칸 설명 길이에 따라 높이가 흔들림 → 설명 `<p>`에 `min-h-[2rem]` 고정
- 로컬 로그인 이슈 대응 (inote-server 쪽, 별도 HANDOFF 참고): 쿠키 SameSite/Secure 환경별 분기, `.env.local`을 프로덕션 서버로 전환하는 방법 안내

### 진행 중 / 다음 Task

1. **사람:** `/mini-game`에서 실제 플레이 + 위 버그 3건 재확인, 승리/포기 시 결과 저장 및 "내 플레이 기록" 모달 확인
2. 확인 후 남은 선택지: **Task #5 폭죽 파티클 (confetti)** — 쥐경주 탈출 승리 시 폭죽 이펙트

### 이번 범위

**해도 됨**
- 미니게임 실서비스 이전 + 발견된 버그 즉시 픽스

**하지 말 것**
- 보드게임 규칙 임의 변경
- Task #5 confetti 임의 구현 (다음 Task, 미착수)

### 변경·참고 파일

```
apps/web/src/app/mini-game/           ← 신규: 실서비스 페이지 전체 (page.tsx, layout.tsx, types.ts, data/, lib/, components/)
apps/web/src/app/demo/mini-game/      ← 순수 로컬 데모로 원복 (GameHistoryModal.tsx 삭제, useSession/api 제거)
  components/GameHeader.tsx           ← 2행 고정 레이아웃
  components/CardModal.tsx            ← onAcceptBaby prop 추가
  components/BoardView.tsx            ← 설명 min-h-[2rem]
```

### 알려진 이슈

- Turbopack 콘솔에 `hasCharityBoost is defined multiple times` 에러 메시지가 뜰 수 있음 — 브라우저 캐시 phantom, `.next` 삭제 후 재시작하면 사라짐. 실제 동작엔 영향 없음.

### 다음 수신자에게 기대하는 것

**사람:** `/mini-game` 로그인 후 실제 플레이로 이번 세션 버그 픽스 3건 + 결과 저장/기록 모달 확인. 문제 있으면 Claude Code에 전달.

### QA 판정

`/mini-game` 실서비스 + 이번 버그 픽스 3건: **미수행 (사람 확인 대기)**
