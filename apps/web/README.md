# apps/web — iNote Money Web

> iNote Money 웹 서비스 — Next.js 16 + TypeScript + Tailwind CSS v4

---

## 🚀 실행

```bash
npm install
npm run dev -- --port 3100
```

| URL | 설명 |
|-----|------|
| `http://localhost:3100` | 홈 (랜딩) |
| `http://localhost:3100/demo` | 데모 메인 (`/demo/dashboard` 리다이렉트) |
| `http://localhost:3100/demo/dashboard` | 자산 관리 대시보드 |
| `http://localhost:3100/demo/account-book` | 가계부 |
| `http://localhost:3100/demo/stocks` | 주식 |
| `http://localhost:3100/demo/settings` | 설정 |

---

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   └── stock/[ticker]/     ← Naver 금융 CORS 프록시 (국내 주가 OHLCV)
│   ├── demo/
│   │   ├── layout.tsx          ← 공통 네비게이션 (사이드바 + 모바일 탭바)
│   │   ├── dark-mode.tsx       ← DarkModeProvider + useDarkMode 훅
│   │   ├── dashboard/
│   │   │   ├── page.tsx        ← 자산 관리 대시보드
│   │   │   └── setup/          ← 내 정보 설정
│   │   ├── account-book/
│   │   │   ├── page.tsx
│   │   │   ├── data.ts         ← 더미 데이터 + 타입 정의
│   │   │   └── components/     ← SummaryCards, LedgerCalendar, DayDetailModal 등
│   │   ├── stocks/
│   │   │   ├── page.tsx        ← 주식 메인 (국내/해외 2섹션)
│   │   │   └── components/
│   │   │       └── KoreanStockChart.tsx  ← Lightweight Charts v5 캔들스틱
│   │   ├── settings/           ← 프로필 + 다크모드
│   │   ├── financial-knowledge/
│   │   └── mini-game/
│   └── page.tsx                ← 홈 랜딩
└── lib/
    └── utils.ts
```

---

## 🧩 주요 기술 결정

### 다크모드
- Tailwind v4 `@custom-variant dark (&:is(.dark *))` 방식
- 루트 `div`에 `dark` 클래스 조건부 적용 (React Context)
- `localStorage(inote-dark)` 영구 보관

### 반응형 레이아웃
- 브레이크포인트 `lg (1024px)` 기준
- 데스크탑: 좌측 고정 사이드바 (`w-56`)
- 모바일: 하단 탭바 (6개 항목)

### 주식 차트
| 섹션 | 데이터 소스 | 차트 라이브러리 |
|------|------------|----------------|
| 국내 주식/ETF | Naver 금융 (`fchart.stock.naver.com`) → Next.js API Route 프록시 | Lightweight Charts v5 |
| 해외 주식 | TradingView iframe embed | TradingView (외부) |

### 환율
- `open.er-api.com` — 무료, API 키 불필요
- USD/KRW · 100엔/KRW · EUR/KRW

### localStorage 키 목록
| 키 | 내용 |
|----|------|
| `inote-settings` | 월급·적금·고정지출·날짜 정보 |
| `inote-dark` | 다크모드 on/off |
| `inote-profile` | 프로필 (이름·직업·소개) |
| `inote-stocks` | 보유 종목 목록 |
| `inote-week-reviews` | 주간 리뷰 별점·텍스트 |
| `inote-month-reviews` | 월간 리뷰 별점·텍스트 |

---

## ⚙️ 환경

```
Node.js  >= 18
Next.js  16.x (App Router)
```

### 주요 패키지

```json
"lightweight-charts": "^5.2.0"
```

---

## 📌 shadcn/ui 주의사항

이 프로젝트의 shadcn는 `@base-ui/react` 기반(`base-nova` 스타일)이라
일반 shadcn과 API가 다릅니다.

- `Button` 컴포넌트에 `asChild` prop **없음**
- Link를 버튼처럼 쓸 때: `<Link className={cn(buttonVariants({ ... }))}>`
