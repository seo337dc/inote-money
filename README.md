# 💰 iNote Money

> 개인 수입·지출, 투자 포트폴리오를 한 곳에서 관리하는 자산관리 웹/앱 서비스

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

---

## ✨ 주요 기능

| 기능 | 설명 | 상태 |
|------|------|------|
| 🔐 로그인 | Google 소셜 로그인 (Better Auth) | ✅ 완료 |
| 📊 자산 대시보드 | 월급·적금·고정지출 요약, 주간/월간 리뷰 | ✅ 완료 |
| 📒 가계부 | 달력·주차별·전체 로그 뷰, 지출 CRUD | 🚧 BE 연동 예정 |
| 📈 주식 | 국내(Naver API) · 해외(TradingView) 차트, 환율 | 🚧 BE 연동 예정 |
| ⚙️ 설정 | 프로필 편집, 다크모드 토글 | 🚧 BE 연동 예정 |
| 🎓 금융 지식 | 금융 개념 학습 콘텐츠 | 🚧 예정 |
| 🎮 미니게임 | 캐시 플로우 기반 재무 게임 | 🚧 예정 |

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| FE (Web) | Next.js 16 · TypeScript · Tailwind CSS v4 · shadcn/ui |
| FE (App) | React Native _(예정)_ |
| BE | NestJS · Prisma |
| 인증 | Better Auth (Google 소셜 로그인) |
| DB | PostgreSQL (Neon) |
| 외부 API | Naver 금융 (국내 주가) · TradingView (해외 차트) · open.er-api.com (환율) |
| 배포 | Vercel (FE) · Render (BE) |

---

## 📁 레포 구조

```
inote-money/
├── apps/
│   ├── web/          ← Next.js 웹 서비스
│   └── app/          ← React Native 앱 (예정)
├── packages/         ← 공통 모듈 (예정)
├── CLAUDE.md         ← AI 작업 컨텍스트 기준 문서
└── TODO.md           ← 작업 리스트
```

---

## 🚀 로컬 실행

```bash
cd apps/web
npm install
```

`.env.local` 파일 생성:

```bash
NEXT_PUBLIC_API_URL=https://inote-server-5a63.onrender.com
```

개발 서버 실행:

```bash
npm run dev
```

---

## 🎨 디자인 방향

- **레퍼런스**: 토스, 뱅크샐러드
- **톤**: 밝은 톤, 클린 미니멀
- **포인트 컬러**: 초록 (`green-500`)
- **다크모드**: 지원 (localStorage 영구 보관)
- **반응형**: 모바일 / 태블릿 / 데스크탑 전 구간 대응

---

## 📝 개발 방식

> 기획 ~ 개발 ~ 운영 전 과정을 **AI 바이브코딩**으로 진행

- 모든 코드 작업은 Claude Code + AI로 진행
- `CLAUDE.md` — AI에게 전달하는 프로젝트 컨텍스트 기준 문서
- `TODO.md` — 작업 리스트

---

## 🔗 링크

- GitHub: [seo337dc/inote-money](https://github.com/seo337dc/inote-money)
- BE 서버: [inote-server](https://github.com/seo337dc/inote-server)
- Notion: [기획 문서](https://www.notion.so/35ab5151f22f8048b08cdc6ee8c38253)
- 배포 URL: _(Vercel 배포 예정)_
