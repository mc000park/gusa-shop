# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GUSA** is a full-stack Korean educational textbook e-commerce platform for selling elementary, middle, and high school teaching materials. It has two sub-projects:

- `apex/` — Spring Boot 4.0.4 backend (Java 21, Gradle)
- `gusaFront/` — React 19 + TypeScript frontend (Vite)

## Commands

### Frontend (`gusaFront/`)

```bash
npm run dev       # Start Vite dev server at http://localhost:5173
npm run build     # Type-check and build production bundle
npm run lint      # Run ESLint
npm run format    # Format with Prettier
npm run preview   # Preview production build
```

### Backend (`apex/`)

```bash
./gradlew bootRun   # Start Spring Boot server (default port 8080)
./gradlew build     # Compile and package
./gradlew test      # Run unit tests
./gradlew clean     # Clean build artifacts
```

## Architecture

### Backend — Domain-Driven Structure

`apex/src/main/java/com/gusa/apex/` is organized by domain, each with `controller/`, `service/`, `repository/`, `entity/`, and `dto/` sub-packages:

- **`auth/`** — Login, signup, phone verification (Caffeine-cached OTP codes). `AuthController` → `AuthService` + `PhoneVerificationService` + `CustomUserDetailService`.
- **`user/`** — User entity, CRUD. `User` fields: `userId`, `password`, `email`, `phoneNumber`, `address`, `role`.
- **`payment/`** — Payment processing with a pluggable PG (Payment Gateway) layer:
  - `PgClient` interface + `PgClientFactory` selects the right implementation at runtime.
  - Implementations: `TossPaymentsClient`, `KakaoPayClient`, `PortOneClient` (covers Inicis, Nicepay, Naver).
  - `Payment` entity tracks `orderId`, `amount`, `status` (DONE | CANCELED | FAILED), `pgProvider`.
- **`pgsetting/`** — `PgSetting` entity stores per-provider credentials (`apiKey`, `apiSecret`, `merchantId`, `mode`). Managed via admin UI.
- **`global/`** — Cross-cutting concerns:
  - `response/ApiResponse<T>` — all endpoints return `{ status, message, data }`.
  - `exception/GlobalExceptionHandler` + `ErrorCode` enum — centralized error handling.
  - `config/SecurityConfig` — JWT filter chain, CORS (allows `http://localhost:5173`).
  - `security/jwt/` — `JwtUtil` (generate/validate) + `JwtFilter` (request filter).

Database defaults to H2 with `hibernate.ddl-auto=update`. `application.properties` holds JWT secret, expiry (1 hour), PG credentials, HikariCP pool config, and file-based logging to `./log`.

### Frontend — Page/Component Structure

`gusaFront/src/` layout:

- **`api/`** — Axios instance in `axios.ts` with JWT bearer injection and automatic token refresh on 401. Domain-specific files: `auth.ts`, `pgSettings.ts`.
- **`utils/token.ts`** — Access/refresh token read/write via `localStorage`.
- **`routes/Router.tsx`** — Route definitions. `PrivateRoute.tsx` guards admin routes.
- **`pages/`** — One file per route. Admin pages live under `pages/admin/`.
- **`components/`** — `layout/` (Header, Footer, Layout), `admin/` (AdminSidebar, ConfirmModal), `common/` (ProductList, ProductItem).
- **`types/`** — TypeScript interfaces for API payloads (`auth.ts`, `product.ts`, `pgSetting.ts`).

**Routing:**
- Public: `/`, `/login`, `/signup`, `/books`, `/books/:id`
- Protected (admin): `/admin/dashboard`, `/admin/members`, `/admin/orders`, `/admin/products`, `/admin/boards`, `/admin/settings/pg`

No global state library — tokens in `localStorage`, server state via Axios calls.

React Compiler is enabled in `vite.config.ts` for automatic memoization.

## Key Conventions

- All API responses use `ApiResponse<T>` wrapper: `{ status, message, data }`.
- Errors are thrown as `CustomException(ErrorCode)` and handled by `GlobalExceptionHandler`.
- PG provider selection uses the Factory pattern — add new providers by implementing `PgClient` and registering in `PgClientFactory`.
- Frontend code is formatted with Prettier (`singleQuote: true`, `semi: true`, `printWidth: 80`). VSCode is configured to auto-format on save.
