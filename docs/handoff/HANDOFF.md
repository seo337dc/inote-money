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
| 날짜 | 2026-09-04 (금) — 다음 세션은 주말(09-05~06) 예정 |
| 작성자 | Claude Code |
| 브랜치 | `main` |
| 다음 수신자 | 사람 (주말 작업, 다른 PC 가능) |

> 이전 세션들의 상세 이력은 이 섹션에 쌓지 않고 `DEV_LOG.md`에 기록되어 있음. 아래는 **가장 최근 세션 기준 현재 상태**만 담음.

### 완료된 단계

- **모바일 앱이 최우선 작업으로 확정 및 문서화됨** (`CLAUDE.md` "🔥 모바일 앱" 섹션, 커밋 `ec9ec44`/`832e549`) — 아래 🔴🟡🟢🔵 항목보다 우선 순위.
- **`/stocks`, `/mini-game` 실서비스 페이지 구현 완료** (커밋 `f1dd8c1`, `f8c54f3` + 버그 픽스 3건) — **사람 최종 확인 아직 대기 중** (헤더 레이아웃 / 자녀 출산 카운트 / 보드 카드 높이).
- **(이슈 해소 확인)** `inote-server`의 `oneTimeToken` 플러그인 — 지난 HANDOFF에 "커밋 전"으로 남아있었는데, 이번에 직접 확인해보니 **이미 커밋 완료**(`inote-server` 커밋 `334dfe1`, `src/auth/auth.ts`에 정상 반영, working tree 깨끗함). 더 이상 블로커 아님.
- `CLAUDE.md`의 "커밋·PR·push는 사람 요청 시에만" 규칙 문구를 더 명시적으로 강화(자동 이어가기 금지 사례 추가) — 이번 세션에서 같이 커밋.

### 진행 중 / 다음 Task (주말에 이어서)

1. **[최우선] `apps/app` 단계 1** — Expo Go 설치 + `npx create-expo-app@latest . --template blank-typescript` 실행. **사람이 직접 코딩, Claude Code는 가이드만** (페어 튜터 모드 — `apps/app/CLAUDE.md` 체크리스트 참고). `oneTimeToken` 커밋 이슈는 해소됐으니 이 단계 진행에 걸림돌 없음.
2. **`/mini-game` 실제 플레이 재확인** — 이전 세션 버그 픽스 3건(헤더 레이아웃 / 자녀 출산 카운트 / 보드 카드 높이) 문제없는지 확인 → 괜찮으면 Task #5(confetti) 착수 여부 결정.
3. (여유 되면) `/stocks` 페이지도 같이 최종 확인.

### 이번 범위

**해도 됨**
- `apps/app` 단계 1 진행 시 Claude Code의 가이드
- `/mini-game`·`/stocks` 확인 결과에 따른 다음 Task 여부 판단

**하지 말 것**
- `apps/app`에서 Claude Code가 코드를 대신 완성해서 진행하기 — 반드시 사람이 직접 작성하고 Claude는 가이드만 (`apps/app/CLAUDE.md` 참고)
- `prisma migrate reset` 등 데이터 삭제 동반 작업 (inote-server 쪽 원칙, 크로스 레포 공통 원칙)

### 변경·참고 파일

```
CLAUDE.md                       ← 커밋·PR·push 규칙 문구 강화 (2026-09-04)
apps/app/CLAUDE.md              ← 체크리스트 6단계 (단계 1부터 시작)
(inote-server, 별도 레포) src/auth/auth.ts  ← oneTimeToken 플러그인, 커밋 334dfe1로 확인 완료
```

### 알려진 이슈

없음 — 지난 세션의 `oneTimeToken` 미커밋 이슈는 이번에 확인해서 해소됨.

### 다음 수신자에게 기대하는 것

**사람 (다른 PC 포함):** `git pull` 후 `apps/app/CLAUDE.md`의 체크리스트 "단계 1"부터 시작 (Expo Go 설치, `create-expo-app` 실행). 시간 되면 `/mini-game` 실제 플레이로 버그 픽스 3건도 같이 확인. Claude Code에게 페어 튜터 모드임을 상기시킬 필요는 없음 — 파일에 이미 명시돼 있어 자동 적용됨.

### QA 판정

해당 없음 (이번 세션은 handoff 문서 갱신만, 코드 변경 없음)
