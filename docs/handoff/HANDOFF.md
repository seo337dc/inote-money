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
| 날짜 | 2026-08-19 |
| 작성자 | Claude Code |
| 브랜치 | `main` |
| 다음 수신자 | 사람 (다른 PC에서 이어서 작업 가능) |

> 이전 세션들의 상세 이력은 이 섹션에 쌓지 않고 `DEV_LOG.md`에 기록되어 있음. 아래는 **가장 최근 세션 기준 현재 상태**만 담음.

### 완료된 단계

- **모바일 앱 아키텍처 확정**: React Native(Expo) + `react-native-webview`로 `apps/web` 배포 URL을 감싸는 하이브리드 구조. Capacitor 스파이크를 검토했다가 최종적으로 RN+WebView로 결정. 상세는 [`apps/app/README.md`](../../apps/app/README.md).
- **`apps/app`에 협업 모드 + 실행 체크리스트 문서화** — [`apps/app/CLAUDE.md`](../../apps/app/CLAUDE.md) 신규 작성. **이 폴더는 "사람이 직접 코딩, Claude는 가이드"하는 페어 튜터 모드**로 진행 (`inote-server-spring`과 동일 패턴, `apps/web`/`inote-server`의 기존 "Claude 구현" 방식과 다름). 실행 체크리스트 6단계(환경 준비 → WebView 붙이기 → EAS Build로 첫 APK → 로그인 플로우 → AI 문자 인식 → 배포 결정) 정리 완료, **전부 미착수** 상태.
- **로그인 설계(쿠키 교환 방식) 확정**: 시스템 브라우저에서 구글 로그인 → BE `oneTimeToken` 플러그인으로 일회성 코드 발급 → 커스텀 스킴 딥링크로 앱 복귀 → 앱 WebView 자신이 코드 검증해 세션 쿠키 직접 심음. BE(`inote-server`) `src/auth/auth.ts`에 `oneTimeToken` 플러그인 추가 완료 — **커밋 전** (`inote-server` 별도 HANDOFF 확인 필요할 수 있음).
- (별도 트랙, `inote-money`와 직접 관련 없음) 이직 준비로 Java/Spring 학습 병행 결정 — `career-notes`(개인 노트, private), `inote-server-spring`(학습용 Spring 포팅 프로젝트, private) 레포 신규 생성. `inote-money`는 포트폴리오 공개 레포라 이 내용은 여기 들어있지 않음.
- 이전 세션(미니게임 실서비스 이전 + 버그 픽스 3건, `/stocks`·`/mini-game` 확인 대기)은 **아직 사람 확인 여부 불명** — 이번 세션에서 다루지 않았음. 다음 수신자가 확인 후 상태 갱신 필요.

### 진행 중 / 다음 Task

1. **`apps/app` 단계 1**: Expo Go 설치 + `npx create-expo-app@latest . --template blank-typescript` 실행 (사람이 직접, 다음 세션에서 Claude와 같이 진행)
2. 이전 세션의 `/stocks`, `/mini-game` 실서비스 확인이 아직 안 됐다면 그것도 병행 확인 필요 (미확인 상태로 방치되고 있음)

### 이번 범위

**해도 됨**
- `apps/app` 전략/문서 정리, BE `oneTimeToken` 플러그인 추가(inote-server)

**하지 말 것**
- `apps/app`에서 Claude Code가 코드를 대신 완성해서 진행하기 — 반드시 사람이 직접 작성하고 Claude는 가이드만 (`apps/app/CLAUDE.md` 참고)
- `prisma migrate reset` 등 데이터 삭제 동반 작업 (inote-server 쪽 원칙, 크로스 레포 공통 원칙)

### 변경·참고 파일

```
apps/app/CLAUDE.md              ← 신규: 협업 모드(페어 튜터) + 실행 체크리스트 6단계
apps/app/README.md              ← 아키텍처 개요 갱신 (Capacitor→RN+WebView 최종 결정 반영, 이전 세션)
CLAUDE.md                       ← "모바일 앱(React Native) 개발 방향" 섹션에 apps/app/CLAUDE.md 링크 추가
(inote-server, 별도 레포) src/auth/auth.ts  ← oneTimeToken 플러그인 추가, 커밋 전
```

### 알려진 이슈

- `inote-server`의 `oneTimeToken` 플러그인 추가분이 아직 커밋되지 않음 — `apps/app` 로그인 플로우(단계 4) 작업 시작 전에 반드시 커밋 상태 확인할 것.
- 이전 세션의 `/stocks`, `/mini-game` 사람 확인이 완료됐는지 이 세션에서 추적하지 못함 — 다음 세션에서 git 이력/사람에게 직접 확인 필요.

### 다음 수신자에게 기대하는 것

**사람 (다른 PC 포함):** `git pull` 후 `apps/app/CLAUDE.md`의 체크리스트 "단계 1"부터 이어서 진행. Claude Code에게 페어 튜터 모드임을 상기시킬 필요는 없음 — 파일에 이미 명시돼 있어 자동 적용됨.

### QA 판정

해당 없음 (이번 세션은 문서/전략 정리, 코드 변경 없음)
