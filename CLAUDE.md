# 개인 자산관리 앱 — CLAUDE.md

> Claude Code 작업 시 이 파일을 기준으로 맥락을 유지합니다.
> 기능/스키마 확정될 때마다 업데이트합니다.

---

## 프로젝트 개요

개인 수입/지출, 투자 포트폴리오를 관리하는 웹/앱 서비스.
기획 ~ 개발 ~ 운영까지 전 과정을 AI 바이브코딩으로 진행.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| FE (Web) | Next.js + shadcn/ui + Tailwind CSS |
| FE (App) | React Native |
| BE | NestJS + Prisma |
| 인증 | Better Auth |
| DB | PostgreSQL |
| DevOps | Vercel (FE) + Railway (BE) + Supabase (DB) |

---

## 문서 관리

- 기획 문서 및 프로젝트 문서: [자산관리 프로그램 노션](https://www.notion.so/35ab5151f22f8048b08cdc6ee8c38253)

---

## 디자인 방향

- 스타일: 클린 미니멀 (토스, 뱅크샐러드 느낌)
- 톤: 밝은 톤
- 포인트 컬러: 초록
- UI 라이브러리: shadcn/ui + Tailwind CSS

---

## 기능 목록 (v0.1)

1. 대시보드
2. 수입/지출 관리
3. 가계부
4. 투자 기록
5. 포트폴리오
6. 월별 기록

---

## 화면 정의

→ 상세 화면 스펙은 [기획 문서](https://www.notion.so/22c408bcf32b47829e78d95eabad51a6) 참조

---

## 개발 방식

- 모든 코드 작업은 Claude Code + AI로만 진행
- CLAUDE.md를 프로젝트 맥락 기준 문서로 유지
- 기능/화면/스키마 확정 시 이 파일 업데이트

## UI 개발 워크플로우

1. **Claude** — 화면 기획 및 목업
2. **Claude Code** — UI 코드 작성 및 BE 연결

## 레포 구조

```
inote-money/
├── CLAUDE.md
├── apps/
│   ├── web/          ← Next.js (실제 서비스)
│   └── app/          ← React Native
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
| BE | Railway | NestJS 무료 플랜 |
| DB | Supabase 또는 Neon | PostgreSQL 무료 플랜 |
| 도메인 | Vercel 서브도메인 | 추후 Cloudflare 도메인 연결 가능 |

- AWS 사용 안 함 (프리티어 1년 후 과금)
- 여러 사이드 프로젝트 모두 동일 기준으로 운영
- Claude를 제외한 모든 서비스 무료 플랜 기준

---

## 미결정 항목

- [x] 대시보드 화면 — 데모 구현 완료, 실서비스 스펙 미정
- [ ] 수입/지출 관리 화면 정의
- [ ] 금융 지식 화면 정의
- [ ] 미니게임 (캐시플로우) 화면 정의
- [ ] DB 스키마
- [ ] AWS 인프라 구성
- [x] 인증 방식 — Better Auth (소셜 로그인, Next.js 16 + Prisma 지원)
- [ ] 앱 배포 여부 (App Store / Play Store)

## 데모 구현 완료 화면 목록

| 경로 | 화면 | 상태 |
|------|------|------|
| `/demo/dashboard` | 자산 관리 대시보드 | ✅ 완료 |
| `/demo/dashboard/setup` | 내 정보 설정 | ✅ 완료 |
| `/demo/account-book` | 가계부 (달력/주차별/전체) | ✅ 완료 |
| `/demo/stocks` | 주식 (국내+해외+환율) | ✅ 완료 |
| `/demo/settings` | 설정 (프로필+다크모드) | ✅ 완료 |
| `/demo/financial-knowledge` | 금융 지식 | 🚧 준비 중 |
| `/demo/mini-game` | 미니게임 | 🚧 준비 중 |

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

### Claude Code 바로 전달 가능 (기획 완료)

- [x] 가계부 화면 — 달력 / 주차별 / 전체 로그 뷰 (구현 완료)
- [x] 대시보드 — 내 정보 카드 / 주간 리뷰 / 월간 요약 (구현 완료)
- [x] 내 정보 설정 — 월급·적금·고정지출·날짜 입력 (구현 완료)
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

## 현재 단계

`/demo` 주식 페이지까지 구현 완료. 국내/해외 주식 2섹션, Naver 금융 API + Lightweight Charts (국내), TradingView iframe (해외) 적용.

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
