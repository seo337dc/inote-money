# backend — iNote Money API Server

> iNote Money 백엔드 API — NestJS + Prisma _(예정)_

---

## 상태

🚧 **개발 예정**

프론트엔드 데모 화면 완성 후 백엔드 개발을 시작할 예정입니다.

---

## 예정 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | NestJS |
| ORM | Prisma |
| DB | PostgreSQL (Supabase 또는 Neon) |
| 인증 | Better Auth |
| 배포 | Railway 무료 플랜 |

---

## 예정 API 목록

### 인증
- `POST /auth/signup`
- `POST /auth/signin`
- `POST /auth/signout`

### 가계부
- `GET /expenses` — 월별 지출 목록
- `POST /expenses` — 지출 추가
- `PATCH /expenses/:id` — 지출 수정
- `DELETE /expenses/:id` — 지출 삭제

### 자산 설정
- `GET /settings` — 내 정보 조회
- `PUT /settings` — 내 정보 저장

### 주식
- `GET /stocks` — 보유 종목 목록
- `POST /stocks` — 종목 추가
- `PATCH /stocks/:id` — 종목 수정
- `DELETE /stocks/:id` — 종목 삭제

---

## 로컬 실행 (예정)

```bash
npm install
npm run start:dev
```

기본 포트: `http://localhost:3000`
