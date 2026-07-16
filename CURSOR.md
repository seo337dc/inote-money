# Cursor 지침 — inote-money (FE)

> Cursor 작업 시 이 파일을 기준으로 역할을 유지한다.
> Claude Code용 맥락·TODO·현재 단계는 `CLAUDE.md`를 참조한다.
>
> **새 세션 시작 시 필수:** `docs/handoff/HANDOFF.md`를 먼저 읽는다.

---

## 역할

| 도구 | 담당 |
|------|------|
| **Claude Code** | 설계·구현 — 세팅, API, 페이지, 도메인 로직 |
| **Cursor** | Task 완료 후 QA, 리뷰·리팩토링, 문서·devlog·PR 정리, handoff |
| **Google AI Studio** | 페이지별 디자인 목업 |
| **사람** | 기획·UX·아키텍처 판단 및 승인 |

### Cursor가 하는 일

1. Claude Code handoff 수신 후 **변경 파일 기준 QA**
2. **코드 리뷰** (타입 안정성, 중복, 불필요한 복잡도)
3. **devlog / PR 본문** 초안·축약
4. FAIL이면 **Claude Code로 handoff** 작성

### Cursor가 하지 않는 일

- 기획·UX·아키텍처를 임의로 결정하지 않는다 → 대안 제시 후 **사람 승인**
- Claude 구현 범위 밖으로 **기능을 확장**하지 않는다
- QA FAIL을 이유로 **큰 구현을 직접**하지 않는다 (작은 UI/문서 픽스는 예외)
- **커밋·PR·push**는 사람이 요청할 때만

### Notion 업데이트

- Cursor 작업 결과(QA 리포트, devlog, PR 정리 등)는 Cursor가 직접 Notion에 업데이트한다.
- Claude 작업분 Notion 업데이트는 Claude가 직접 한다. Cursor가 대신하지 않는다.
- 요청 시 Notion·문서 검수 및 레포↔Notion 불일치 리포트는 가능.

---

## 작업 흐름

1. 사람이 TODO에서 Task 범위 확정
2. Claude Code가 구현
3. Claude → Cursor handoff
4. Cursor QA → **PASS** / **PASS with notes** / **FAIL**
5. FAIL → Cursor → Claude handoff
6. PASS → 문서·PR 정리 (커밋/PR은 요청 시에만)

---

## QA 산출물

### 판정

| 판정 | 의미 |
|------|------|
| **PASS** | Task 범위 내 요구사항 충족, 블로커 없음 |
| **PASS with notes** | 통과하나 개선·후속 메모 있음 |
| **FAIL** | 블로커 또는 Task 미충족 — Claude 재작업 필요 |

### QA 리포트에 포함할 것

- 브랜치 / Task 범위
- 체크리스트 (기능·엣지·타입·UI 회귀)
- 파일별 이슈 (심각도: blocker / major / minor)
- 판정 + 근거
- FAIL이면 Claude handoff 초안

---

## handoff 형식

첫 줄:

- Cursor → Claude: `> **[Cursor → Claude Code]** handoff 프롬프트`
- Claude → Cursor: `> **[Claude Code → Cursor]** handoff`

본문에 포함할 것:

- 현재 브랜치
- 완료된 단계
- 이번 세션 범위
- 해도 됨 / 하지 말 것
- 참고 파일
- 기대 산출물

---

## 세션 시작·종료

채팅 메모리는 PC·세션마다 초기화된다. 맥락은 **`docs/handoff/HANDOFF.md` + git**으로 이어간다.

**새 세션 (필수 순서):**

1. `git pull`
2. **`docs/handoff/HANDOFF.md` 필독**
3. `CLAUDE.md` TODO / 현재 단계
4. 이 파일(`CURSOR.md`) 역할 확인
5. 필요 시 최근 git 변경

**세션 끝 (요청 시):** `HANDOFF.md` 「현재 상태」 갱신 → TODO 동기화 → commit → push

상세: [`docs/handoff/HANDOFF.md`](docs/handoff/HANDOFF.md)

---

## FE 컨텍스트

| 항목 | 내용 |
|------|------|
| 앱 경로 | `apps/web/` |
| 스택 | Next.js 16 + shadcn/ui + Tailwind + react-query v5 |
| API | `apps/web/src/lib/api.ts` |
| 인증 | Better Auth — `apps/web/src/lib/auth-client.ts` |
| 실서비스 | `/dashboard`, `/account-book`, `/settings` … |
| 데모 | `/demo/*` (하드코딩 UI) |
| 모바일/데스크탑 | `lg` 기준 CSS 분리 (`desktop/` · `mobile/`) |

Next.js 버전별 API는 training data와 다를 수 있다. `apps/web/AGENTS.md` 및 `node_modules/next/dist/docs/`를 우선한다.

---

## 리뷰 체크 포인트

- Task 범위 준수 여부 (범위 밖 변경 여부)
- 타입 안전성 / any 남용
- react-query 키·캐시 무효화 일관성
- 데모(`/demo`)와 실서비스 로직 혼입
- shadcn/기존 패턴과의 일관성
- 불필요한 추상화·중복 컴포넌트

---

## 관련 문서

| 문서 | 용도 |
|------|------|
| `docs/handoff/HANDOFF.md` | PC·세션 전환 맥락 (필독) |
| `CLAUDE.md` | 프로젝트 맥락, TODO, 현재 단계 (Claude Code 기준) |
| `.cursor/rules/` | Cursor 세션에 항상 주입되는 규칙 |
| `.cursor/mcp.json` | Notion MCP (OAuth) 설정 |

### Notion 문서

| 문서 | URL |
|------|-----|
| 본문 | https://app.notion.com/p/Inote-money-35ab5151f22f8048b08cdc6ee8c38253 |
| 개발 일지 | https://app.notion.com/p/devlog-de6909091d054042a9b39ee1ebc7283b |
| 기획 | https://app.notion.com/p/planning-22c408bcf32b47829e78d95eabad51a6 |
| 회고 | https://app.notion.com/p/retrospective-a72cbb70cff940d89727e8fa8212e41d |
| QA | https://app.notion.com/p/QA-391b5151f22f802a9127c2114e09bae5 |

Notion 읽기/쓰기는 MCP 연결(OAuth) 후에만 가능. 설정: Cursor Settings → MCP → `notion` → Connect / Authenticate.
