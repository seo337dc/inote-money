# iNote Money — 로딩 UI 참고 문서

> 다른 기기에서 확인할 때 이 문서로 빠르게 컨텍스트를 복원하세요.  
> 실제 코드 경로: `apps/web/src/app/test/loading/`

---

## 개요

Render 무료 플랜의 콜드 스타트 대응 + 앱 진입 시 로딩 경험 개선을 위해 로딩 UI를 먼저 설계하고 확인할 수 있는 테스트 페이지를 만들었다.  
실제 프로덕션에 쓸 로딩을 결정하기 전에 여러 스타일을 인터랙티브하게 비교하는 용도.

---

## 확인 URL

| 환경 | URL |
|------|-----|
| 로컬 | `http://localhost:3000/test/loading` |
| 프로덕션 | `https://<vercel-domain>/test/loading` |

---

## 페이지 구조

```
/test/loading
├── page.tsx                ← 메인 오케스트레이터 (상태, 타이머, AnimatePresence)
├── types.ts                ← LoaderConfig, LoaderStyle, Transaction 타입
└── components/
    ├── LoadingScreens.tsx  ← 4가지 로딩 스타일 (style prop으로 분기)
    ├── Customizer.tsx      ← 다크 컨트롤 패널 (스타일/색상/속도 조작)
    └── Dashboard.tsx       ← 로딩 후 보여주는 더미 대시보드
```

### page.tsx 동작 흐름

```
진입 → isLoading=true → progress 타이머 시작 (랜덤 step, 100ms 간격)
                       → message 타이머 시작 (2000ms 간격)
      → progress >= 100 → autoDismiss면 dismissDelay 후 isLoading=false
      → AnimatePresence exit 애니메이션 (blur + scale + y)
      → Dashboard + Customizer 등장
```

---

## 로딩 스타일 4가지

### 1. Glassmorphic Ledger (`style: 'glassmorphic'`)
- **배경**: 흰 배경 `#f8fafc`, 주 컬러의 ambient glow (blur-120px, 6% opacity)
- **파티클**: 이모지(`🪙 📝 📊 💳 ✨ 💸`) 15개가 아래→위로 부유
- **메인 요소**: 원형 SVG 링 게이지 (progress 연동) + 중앙에 `Coins` 아이콘 (펄스)
- **하단**: 진행 % 뱃지 (바운스 애니) + 선형 바 + 테크 스탯 (PING, VER 등)
- **상단**: `AES-256 SECURED LEDGER` 뱃지
- **분위기**: 세련된 하이테크, 금융 앱 느낌

### 2. Minimal Memo Book (`style: 'minimal-memo'`)
- **배경**: 스톤/크림 `#fafaf9`, 도트 그리드 패턴 오버레이
- **메인 요소**: 메모장 3장이 겹쳐있고, 맨 앞 장이 Y축으로 회전 플립 (2.5s 반복)
- **메모장 내부**: 선 3개 (마지막 줄은 주 컬러 반투명) + ₩ 마크 + PenTool 아이콘
- **타이포**: 세리프 이탤릭체 브랜드명
- **분위기**: 아날로그, 가계부, 노트 감성

### 3. Cyber Neon Terminal (`style: 'cyber-neon'`)
- **배경**: 연한 슬레이트 `slate-50`, 격자 라인 패턴
- **스캔 라인**: 주 컬러 2px 선이 0vh→100vh 무한 반복 (4s)
- **코너 마크**: 4 모서리에 L자형 주 컬러 테두리
- **세그먼트 바**: 20칸 블록, 진행에 따라 켜지며 glow 효과
- **콘솔 로그**: 다크 터미널 박스 (`slate-900`), progress 진행에 따라 로그 순차 등장
- **분위기**: 레트로 사이버펑크, 개발자 느낌

### 4. Organic Emerald Blob (`style: 'organic-flow'`)
- **배경**: `#f0fdf4` (초록 계열 아이보리)
- **배경 오브**: 에메랄드/틸 대형 블러 원 2개가 부드럽게 이동
- **메인 요소**: 주 컬러 morph blob (border-radius 4값이 계속 변함) + 내부 TrendingUp 아이콘
- **외곽**: 펄스 링 (scale 1→1.3, opacity 0.6→0)
- **진행**: 하단 플로팅 뱃지 (위아래 bounce 4px)
- **분위기**: 자연스럽고 편안한, 마인드풀 자산관리

---

## Customizer 컨트롤 패널

다크 테마 컨트롤 패널. 로딩이 끝난 후 화면 상단에 등장.

| 컨트롤 | 옵션 |
|--------|------|
| 스타일 선택 | 4가지 (위 참고) |
| 브랜드 컬러 | emerald / indigo / rose / amber / sky |
| 로딩 속도 | 0.5x ~ 3.0x (0.5 단위 슬라이더) |
| 파티클 ON/OFF | glassmorphic 스타일에서만 유효 |
| Auto-dismiss ON/OFF | 100% 도달 시 자동으로 대시보드 진입 |
| 메시지 목록 편집 | 추가/삭제/초기화 |
| 로딩 재시작 버튼 | 언제든 다시 시뮬레이션 |

**Code 탭**: 복사 가능한 React 컴포넌트 코드 (Glassmorphic 기준 스니펫)

---

## 기술 스택 & 의존성

```json
{
  "motion/react": "framer-motion 계열 (motion 패키지)",
  "lucide-react": "Coins, FileText, Sparkles, TrendingUp, Lock, PieChart 등",
  "tailwindcss": "유틸리티 CSS"
}
```

> `framer-motion`이 아닌 `motion` 패키지 사용 주의  
> import: `import { motion, AnimatePresence } from 'motion/react'`

---

## 컬러 매핑 (primaryColor → hex)

| 이름 | hex |
|------|-----|
| emerald | `#10b981` |
| indigo | `#6366f1` |
| rose | `#f43f5e` |
| amber | `#f59e0b` |
| sky | `#0ea5e9` |

---

## 실 프로덕션 연결 — ServerWakeProvider

로딩 스타일을 결정한 후 `ServerWakeProvider.tsx`에 실제 적용.  
현재 적용된 버전은 이 테스트 페이지의 스타일과 별개로 심플하게 구현되어 있음.

**파일**: `apps/web/src/components/ServerWakeProvider.tsx`

```
진입 → localhost? → 바로 통과
     → 프로덕션? → BE /health ping
                 → 1s 내 응답 없으면 "서버 접속을 확인하는 중이에요..." 표시
                 → 응답 오면 children 렌더
```

**현재 로딩 UI**: 💰 로고 + 이름 + 3점 바운스 애니메이션 (초록)  
→ 추후 여기에 위 4가지 스타일 중 하나를 이식할 수 있음

---

## 작업 로그

### 2026-07-03

| 시간 | 작업 |
|------|------|
| 오전 | `inote-money-loader` Vite 앱을 `/test/loading` 페이지로 완전 이식 |
| 오전 | `LoadingScreens.tsx` — 4가지 스타일 (glassmorphic / minimal-memo / cyber-neon / organic-flow) |
| 오전 | `Customizer.tsx` — 다크 컨트롤 패널 이식 |
| 오전 | `Dashboard.tsx` — 더미 대시보드 이식 |
| 오전 | `page.tsx` — 로딩 시뮬레이션 엔진 + AnimatePresence |
| 오후 | 미니멀 2안 (`LoadingScreenLight` — Toss 스타일) 제거 결정 및 삭제 |
| 오후 | `proposal` 상태, 2안 관련 버튼 모두 제거, `LoadingScreenLight.tsx` 파일 삭제 |

**최종 결론**: 1안 4스타일만 유지. 2안(Toss 스타일 단순 스피너)은 필요 없음.

---

## 원본 소스 위치

`inote-money-loader`는 별도 Vite 프로젝트로 존재.

```
/Users/seodongchan/Desktop/side-project/inote-money-loader/
├── src/
│   ├── App.tsx         ← page.tsx의 원본
│   ├── types.ts
│   └── components/
│       ├── LoadingScreens.tsx
│       ├── LoadingScreenLight.tsx  (삭제됨 — 2안)
│       ├── Customizer.tsx
│       └── Dashboard.tsx
```

> 원본 Vite 앱은 유지. `/test/loading`은 Next.js App Router용으로 포팅한 버전.  
> 차이점: `'use client'` 추가, 이미지 경로 제거 (`src=""` + onError 이모지 폴백)

---

## 다음 단계 (미결)

- [ ] 4가지 스타일 중 실서비스 로딩으로 쓸 1개 최종 결정
- [ ] 결정 후 `ServerWakeProvider.tsx`에 이식
- [ ] 로딩 → 실제 세션 확인 완료 → 대시보드 진입 플로우와 연결
