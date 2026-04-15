# GUSA — 한국 교육 교재 이커머스 플랫폼

## 프로젝트 개요

**GUSA**는 초·중·고등학교 교과서 및 교육 교재를 판매하는 풀스택 이커머스 플랫폼입니다.

| 항목 | 내용 |
|------|------|
| 분류 | B2C 교육 교재 쇼핑몰 |
| 대상 | 초등학생 / 중학생 / 고등학생 학부모 및 교사 |
| 구성 | Spring Boot 백엔드 + React 프론트엔드 |

### 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | Java 21, Spring Boot 4.0.4, Spring Security, JPA (Hibernate), H2 Database |
| 프론트엔드 | React 19, TypeScript, Vite, React Router v7, Axios |
| 인증 | JWT (Access Token 1시간 / Refresh Token 7일) |
| 캐싱 | Caffeine Cache |
| 빌드 | Gradle (백엔드), npm (프론트엔드) |

---

## 프로젝트 구조

```
gusa/
├── apex/          # Spring Boot 백엔드
└── gusaFront/     # React 프론트엔드
```

---

## 구현된 기능 목록

### 1. 사용자 인증 (Auth)

**회원가입**
- 3단계 폼 (약관 동의 → 정보 입력 → 완료)
- 핸드폰 번호 OTP 인증 (Caffeine Cache 5분 TTL)
- 다음 우편번호 API를 통한 주소 검색
- 비밀번호 확인 검증
- 아이디 / 전화번호 중복 검사

**로그인 / 로그아웃**
- 일반 사용자 로그인 (`/auth/login`)
- 관리자 전용 로그인 (`/auth/admin/login`)
- JWT Access Token + Refresh Token 발급
- 401 응답 시 자동 토큰 갱신 (Axios 인터셉터)
- 갱신 실패 시 로그인 페이지로 리다이렉트

**보안**
- BCrypt 비밀번호 암호화
- CORS 설정 (localhost:3000, localhost:8081 허용)
- HSTS, X-Frame-Options(DENY), nosniff 헤더 적용
- 역할 기반 접근 제어 (`ROLE_USER`, `ROLE_ADMIN`)

---

### 2. 상품 (Products)

**사용자**
- 전체 상품 목록 조회 및 검색
  - 과목별 필터 (국어, 수학, 영어, 과학, 사회, 역사, 탐구)
  - 학년별 필터 (초등, 중등, 고등)
  - 신상품(`isNew`) / 배지(`hasBadge`) 필터
  - 키워드 검색 + 페이지네이션 (기본 12개)
- 상품 상세 페이지 (도서 정보, 목차, 저자, 출판사, ISBN 등)

**관리자**
- 상품 생성 / 수정 / 삭제
- 상품 이미지 업로드 (multipart, 10MB 제한)
- 검색·필터 + 페이지네이션 (10개)

**상품 Entity 주요 필드**

| 필드 | 설명 |
|------|------|
| title | 교재명 |
| subject | 과목 |
| grade | 학교급 (초등/중등/고등) |
| price / originalPrice | 판매가 / 정가 |
| author / publisher | 저자 / 출판사 |
| isbn | ISBN |
| description | 도서 소개 |
| tableOfContents | 목차 |
| badge / isNew | 특이 뱃지 여부 / 신상품 여부 |
| imageUrl | 썸네일 이미지 경로 |

---

### 3. 장바구니 (Cart)

- 상품 추가 / 수량 변경 / 삭제 / 전체 비우기
- localStorage에 영구 보존 (새로고침 유지)
- 할인율 표시 (정가 vs 판매가)
- 총 금액 자동 계산
- 장바구니 아이콘에 수량 배지 표시

---

### 4. 주문 (Orders)

**주문 생성**
- 회원 주문 (`POST /orders`)
- 비회원 게스트 주문 (`POST /orders/guest`)
- 배송 정보 입력 (수령인, 주소, 배송 메모)
- 보내는 사람 / 받는 사람 정보 분리 또는 동일 설정

**배송비 정책**
- 주문 금액 3만원 미만 → 배송비 3,000원
- 주문 금액 3만원 이상 → 무료 배송

**주문 상태**

```
PENDING → PAID → SHIPPING → DELIVERED
                    ↓
                 CANCELED
```

**사용자**
- 내 주문 목록 조회 (마이페이지)
- 주문 상세 보기
- 주문 취소

**관리자**
- 전체 주문 목록 (검색, 상태 필터, 페이지네이션)
- 주문 상태 변경
- 주문 상세 조회

---

### 5. 결제 (Payments)

**결제 방법 선택**
- PG 결제 (신용카드 등)
- 무통장 입금 (계좌 이체)

**PG 결제 연동 (Factory Pattern)**

| PG사 | API | 인증 방식 | 비고 |
|------|-----|-----------|------|
| 토스페이먼츠 | api.tosspayments.com/v1 | Basic Auth (Secret Key) | 핀테크 |
| 카카오페이 | kapi.kakao.com/v1/payment | Bearer (Admin Key) | 모바일 결제 |
| KG이니시스 | PortOne V2 경유 | Bearer (PortOne Secret) | 국내 1위 PG |
| 나이스페이 | PortOne V2 경유 | Bearer | 기업 안정성 |
| 네이버페이 | PortOne V2 경유 | Bearer | 쇼핑 생태계 |

**결제 흐름**
1. 프론트에서 PG사 선택 후 결제 진행
2. 백엔드에 paymentId, orderId, amount 전송
3. 백엔드에서 해당 PG사 API 호출 (confirm)
4. 금액 일치 검증 (위변조 방지)
5. DB에 결제 내역 저장 (DONE / CANCELED / FAILED)
6. 주문 상태를 PAID로 업데이트
7. 결제 완료 페이지로 이동

**결제 취소**
- `POST /payments/{paymentId}/cancel`

---

### 6. 관리자 (Admin)

접근 경로: `/admin/*` (ROLE_ADMIN 필요)

#### 대시보드
- 월별 매출 현황 차트 (초등 / 중등 / 고등 학년별)
- 통계 카드 (방문자, 로그인, 주문, 매출)
- SVG 라인 차트

#### 회원 관리
- 전체 회원 목록 (키워드, 학교급, 활성화 상태 필터)
- 회원 추가 / 수정 / 삭제
- 계정 활성화/비활성화 토글
- 페이지네이션 (10 / 20 / 50개)

#### 주문 관리
- 전체 주문 목록 (키워드, 상태 필터)
- 주문 상태 변경 (드롭다운)
- 페이지네이션

#### 상품 관리
- 전체 상품 목록 (키워드, 과목, 학교급 필터)
- 상품 추가 / 수정 / 삭제
- 이미지 업로드 (미리보기 포함)
- 페이지네이션 (10개)

#### 설정 (탭 방식)
- **PG 설정 탭** — PG사별 API 키, 시크릿, 가맹점 ID, 모드(테스트/운영) 설정
- **은행 설정 탭** — 무통장 입금용 계좌 정보 설정 (은행명, 계좌번호, 예금주, 입금 안내 메시지)

---

### 7. 마이페이지

- 내 프로필 조회 (이름, 이메일, 전화번호, 주소)
- 프로필 수정
- 내 주문 내역 조회 및 상세 보기

---

## 데이터베이스 스키마

| 테이블 | 설명 |
|--------|------|
| `users` | 회원 정보 (userId, 비밀번호, 이름, 이메일, 전화번호, 주소, 역할, 학교급) |
| `products` | 상품 정보 (제목, 과목, 학교급, 가격, 저자, 출판사, ISBN 등) |
| `orders` | 주문 헤더 (주문번호, 사용자ID, 상태, 금액, 배송 정보) |
| `order_items` | 주문 상세 (주문FK, 상품ID, 수량, 단가, 합계) |
| `payments` | 결제 내역 (paymentId, orderId, 금액, 상태, PG사) |
| `pg_settings` | PG사별 설정 (API 키, 시크릿, 가맹점ID, 모드) |
| `bank_settings` | 무통장 계좌 정보 (은행명, 계좌번호, 예금주) |

---

## API 엔드포인트 요약

### 공개 (인증 불필요)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/auth/login` | 로그인 |
| POST | `/auth/admin/login` | 관리자 로그인 |
| POST | `/auth/signup` | 회원가입 |
| POST | `/auth/refresh` | 토큰 갱신 |
| POST | `/auth/send-code` | OTP 발송 |
| POST | `/auth/verify-code` | OTP 검증 |
| GET | `/products` | 상품 목록 |
| GET | `/products/{id}` | 상품 상세 |
| GET | `/products/search` | 상품 검색 |
| GET | `/bank-setting` | 무통장 계좌 조회 |
| POST | `/orders/guest` | 비회원 주문 |

### 인증 필요 (ROLE_USER 이상)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/users/me` | 내 프로필 조회 |
| PUT | `/users/me` | 내 프로필 수정 |
| POST | `/orders` | 주문 생성 |
| GET | `/orders/my` | 내 주문 목록 |
| GET | `/orders/{orderId}` | 주문 상세 |
| POST | `/orders/{orderId}/cancel` | 주문 취소 |
| POST | `/payments/confirm` | 결제 승인 |
| GET | `/payments/my` | 내 결제 목록 |

### 관리자 전용 (ROLE_ADMIN)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/admin/users` | 회원 목록 |
| PUT | `/admin/users/{id}` | 회원 수정 |
| DELETE | `/admin/users/{id}` | 회원 삭제 |
| POST | `/products` | 상품 등록 |
| PUT | `/products/{id}` | 상품 수정 |
| DELETE | `/products/{id}` | 상품 삭제 |
| POST | `/products/{id}/image` | 이미지 업로드 |
| GET | `/admin/orders` | 주문 목록 |
| PUT | `/admin/orders/{orderId}/status` | 주문 상태 변경 |
| GET | `/admin/pg-settings` | PG 설정 목록 |
| POST | `/admin/pg-settings` | PG 설정 저장 |
| GET | `/admin/bank-setting` | 은행 설정 조회 |
| PUT | `/admin/bank-setting` | 은행 설정 저장 |

---

## 프론트엔드 라우팅

### 공개 페이지

| 경로 | 설명 |
|------|------|
| `/` | 메인 페이지 |
| `/login` | 로그인 |
| `/signup` | 약관 동의 |
| `/signup/form` | 회원가입 폼 |
| `/books` | 상품 목록 |
| `/books/:id` | 상품 상세 |
| `/cart` | 장바구니 |
| `/checkout` | 결제 |
| `/order/complete` | 주문 완료 |
| `/mypage` | 마이페이지 |
| `/admin/login` | 관리자 로그인 |

### 관리자 페이지 (보호됨)

| 경로 | 설명 |
|------|------|
| `/admin/dashboard` | 대시보드 |
| `/admin/members` | 회원 관리 |
| `/admin/orders` | 주문 관리 |
| `/admin/products` | 상품 관리 |
| `/admin/boards` | 게시판 관리 (예정) |
| `/admin/settings/shop` | 결제 / 계좌 설정 |

---

## 오류 처리 (ErrorCode)

모든 API는 `ApiResponse<T>` 형식으로 응답합니다:

```json
{
  "status": 200,
  "message": "success",
  "data": { ... }
}
```

주요 에러 코드:

| 분류 | 에러 코드 |
|------|-----------|
| 인증 | INVALID_CREDENTIALS, INVALID_REFRESH_TOKEN |
| 사용자 | USER_NOT_FOUND, DUPLICATE_USER_ID, DUPLICATE_PHONE, INVALID_PASSWORD |
| OTP | INVALID_VERIFICATION_CODE, VERIFICATION_CODE_EXPIRED |
| 결제 | PAYMENT_FAILED, PAYMENT_NOT_FOUND, PAYMENT_AMOUNT_MISMATCH, UNSUPPORTED_PG_PROVIDER |
| 상품 | PRODUCT_NOT_FOUND |
| 주문 | ORDER_NOT_FOUND, ORDER_ALREADY_CANCELED, ORDER_CANCEL_NOT_ALLOWED, ORDER_STATUS_INVALID_TRANSITION |
| 접근 | ACCESS_DENIED |

---

## 개발 환경 설정

### 기본 계정 (dev 프로파일)

| 구분 | 아이디 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin | admin1234 |
| 테스트 사용자 | test | test1234 |

### 환경 변수

| 변수 | 설명 |
|------|------|
| `JWT_SECRET` | JWT 서명 키 |
| `PG_TOSS_SECRET_KEY` | 토스페이먼츠 시크릿 키 |
| `PG_KAKAO_ADMIN_KEY` | 카카오페이 어드민 키 |
| `PG_PORTONE_SECRET` | 포트원 API 시크릿 |
| `VITE_API_URL` | 백엔드 API URL (프론트엔드) |

---

*최종 업데이트: 2026-04-15*
