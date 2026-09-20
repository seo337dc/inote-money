# inote-money 학습/결정 기록

> `inote-server`(공통 백엔드)에서 있었던 일 중, `inote-money`에서 실서비스 붙일 때
> 반드시 다시 확인해야 하는 것들을 남겨두는 문서.

---

## TODO — Google 로그인 에러 fallback이 지금은 `inote` 전용으로 고정되어 있음

**배경**: `inote`에서 "구글 로그인 완료 → 뒤로가기 → 같은 계정 다시 선택"을 하면, better-auth가
이미 소비되어 삭제된 OAuth `state` 값을 재사용하게 되어 `state_mismatch` 에러가 남. 이 특정
에러는 better-auth 내부적으로 "어느 앱에서 로그인을 시작했는지" 정보(`errorCallbackURL`)를
복구할 방법이 없어서(state 기록 자체가 지워졌기 때문), 클라이언트가 아무리 `errorCallbackURL`을
정확히 넘겨도 무시되고 서버의 전역 fallback으로 떨어짐.

**지금 해둔 조치** (`inote-server/src/auth/auth.ts`):
```typescript
onAPIError: {
  errorURL: process.env.AUTH_ERROR_FALLBACK_URL ?? 'http://localhost:3011/login',
},
```
→ 이 fallback을 **`inote`의 로그인 페이지 하나로 고정**해뒀음. 첫 로그인은 이미 성공한
상태라 세션이 살아있어서, `inote` 로그인 페이지에 이미 있는 "세션 있으면 홈으로" 로직 덕분에
사실상 문제없이 넘어감.

**`inote-money`에서 실서비스 붙일 때 확인/처리해야 할 것**:
- `inote-money`에서 구글 로그인 중 같은 상황(뒤로가기 후 재시도)이 발생하면, 지금 설정대로는
  `inote-money`가 아니라 **`inote`의 로그인 화면으로 떨어짐** (로그인은 이미 돼있어서 깨지진
  않지만, 엉뚱한 서비스 화면으로 이동하게 됨)
- 제대로 고치려면: 로그인 시작 시점(`/sign-in/social` 호출)에 "이 요청이 어느 앱에서
  왔는지"를 **삭제되지 않는 별도 쿠키**로 남겨두고, `onAPIError`의 fallback에서 그 쿠키를 보고
  분기하도록 구현 필요 (better-auth 기본 기능만으로는 안 되고, 커스텀 로직 추가해야 함)
- 지금은 `inote-money`가 실사용 전이라 우선순위를 낮춰서 보류함 — **실서비스 전환 전에 반드시
  재검토할 것**

**관련 커밋**: `inote-server` — `fix: OAuth state 재사용 시 에러 fallback을 inote 로그인 페이지로 지정`
