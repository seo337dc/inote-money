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
| 현재 진행 단계 | FE `/demo` 프로토타입 개발 중 |
| 실행 포트 | `http://localhost:3100` |

---

## 로컬 실행 방법

```bash
# FE 개발 서버
cd apps/web
npm run dev -- --port 3100

# 접속
http://localhost:3100        # 홈
http://localhost:3100/demo   # 가계부 데모
```

---

## 작업 로그

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

### FE — 데모 화면

**완료**
- [x] 가계부 — 달력 / 주차별 / 전체 로그 뷰, CRUD
- [x] 가계부 전체 다크모드 적용
- [x] 대시보드 — 내 정보 카드 / 주간 리뷰 / 월간 요약
- [x] 내 정보 설정 — 월급·적금·고정지출·날짜 입력
- [x] 설정 — 프로필 + 다크모드
- [x] 주식 — 국내(Naver API + Lightweight Charts) / 해외(TradingView) / 환율

**진행 예정**
- [ ] 금융 지식 화면 구현
- [ ] 미니게임 (캐시 플로우) 화면 구현
- [ ] 대시보드 ↔ 가계부 데이터 연동
- [ ] 알림 배너 (자산 업데이트일 D-2~3)
- [ ] 주간/월간 상세 작성 모달

### BE
- [ ] NestJS 프로젝트 생성 (`backend/`)
- [ ] DB 스키마 설계 (Prisma + PostgreSQL)
- [ ] 가계부 API (CRUD)
- [ ] Better Auth 설정

### 인프라
- [ ] Supabase or Neon — PostgreSQL 세팅
- [ ] Vercel 배포 (FE)
- [ ] Railway 배포 (BE)

---

## 주요 기술 결정 사항

| 결정 | 내용 | 이유 |
|------|------|------|
| 인증 라이브러리 | Better Auth | Next.js 16 + Prisma 지원, next-auth 대체 |
| DB 호스팅 | Supabase or Neon | 무료 플랜 PostgreSQL |
| FE 배포 | Vercel | Next.js 무료 배포 |
| BE 배포 | Railway | NestJS 무료 플랜 |
| AWS | 사용 안 함 | 프리티어 1년 후 과금 |
| shadcn 스타일 | base-nova | 설치 시 자동 선택됨 (@base-ui/react 기반) |

---

## 알아두면 좋은 것들

- `shadcn/ui` Button이 `@base-ui/react/button` 기반이라 `asChild` prop 없음
  → Link를 버튼처럼 쓸 때: `<Link className={cn(buttonVariants({ ... }))}>` 패턴 사용
- 더미 데이터는 `src/app/demo/data.ts`의 `INITIAL_EXPENSES` 에 날짜별로 추가
- 카테고리 추가 시 `CATEGORIES` 배열과 `CATEGORY_BADGE` (DayDetailModal), `CATEGORY_COLORS` (page.tsx) 모두 업데이트 필요
