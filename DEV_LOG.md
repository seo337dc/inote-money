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

### FE
- [ ] `/demo` 가계부 — 달력 ↔ 리스트 뷰 탭 전환
  - 리스트 뷰: 날짜별 그룹핑 + 항목 나열 + 일별 합계
  - 달력은 월간 흐름 파악용 / 리스트는 입력·조회용
- [ ] `/demo` 대시보드 화면 구현
- [ ] `/demo` 수입/지출 관리 화면 구현
- [ ] `/demo` 투자 기록 화면 구현
- [ ] `/demo` 포트폴리오 화면 구현
- [ ] `/demo` 월별 기록 화면 구현
- [ ] 하단 탭 네비게이션 (화면 간 이동)

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
