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

## 의존성

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
