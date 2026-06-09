# Used Car Marketplace — Capstone Project

A full-stack web application for listing, moderating, browsing, and purchasing
used cars. The system is a **Spring Boot monolith** (REST API + persistence)
paired with an **Angular single-page application**, packaged so that the built
frontend is served as static assets from the backend in a single container.

This README documents how the system is built and how the pieces fit together.
For the exhaustive endpoint-by-endpoint contract see
[`backend/API_SCHEMA.md`](backend/API_SCHEMA.md).

---

## 1. Architecture

```
                    Browser (Angular SPA)
                            │  HTTP + JSON
                            │  X-Session-Token header
                            ▼
        ┌───────────────────────────────────────────┐
        │            Spring Boot application          │
        │                                             │
        │  Controller  →  Service (interface)         │
        │      │              │                       │
        │      │              ▼                       │
        │      │         Service impl  ──► Repository │
        │      │              │              │ (JPA)  │
        │   DTOs          cross-cutting       ▼       │
        │                 · LoggingAspect   Entities  │
        │                 · GlobalException   │       │
        │                 · Cors / OpenAPI    ▼       │
        │                 · Notification   Apache     │
        │                 · PaymentGateway  Derby DB  │
        └───────────────────────────────────────────┘
```

- **Two-tier.** The Angular app talks to the backend exclusively over a JSON
  REST API. There is no server-side rendering.
- **Stateless transport, stateful sessions.** Auth uses opaque session tokens
  (not JWT) sent in the `X-Session-Token` header; session state lives in the
  database (see [§4](#4-authentication--sessions)).
- **Single deployable.** The Docker image builds the Angular bundle and copies
  it into the backend's static resources, so one JVM process serves both the API
  (`/api/**`) and the SPA.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Backend runtime | Java 17, Spring Boot 3.3.5 |
| Web / API | `spring-boot-starter-web`, SpringDoc OpenAPI (Swagger UI) |
| Persistence | Spring Data JPA (Hibernate), Apache Derby (embedded, file-based) |
| Security primitives | BCrypt password hashing (`spring-security-crypto`), SHA-256 token hashing |
| Cross-cutting | Spring AOP (logging), `spring-boot-starter-validation`, `spring-boot-starter-mail` |
| Frontend | Angular 17 (standalone components), RxJS 7, TypeScript 5.4 |
| Frontend UI | Angular CDK/Material (deps), Phosphor Icons, Geist fonts, custom SCSS design system |
| Tooling | Maven, Angular CLI, Docker (multi-stage build) |

> The build also declares H2 (test scope) for an in-memory test database; the
> repository currently ships no backend test sources.

---

## 3. Repository Layout

```
.
├── backend/                         # Spring Boot application
│   ├── src/main/java/com/example/usedcars/
│   │   ├── controller/              # REST endpoints (one per domain)
│   │   ├── service/                 # Service interfaces
│   │   │   └── impl/                # Service implementations
│   │   ├── repository/             # Spring Data JPA repositories
│   │   ├── model/                   # JPA entities + enums
│   │   ├── dto/                     # Request/response payloads
│   │   ├── config/                  # Cors, OpenAPI, AOP logging, demo seeder
│   │   ├── exception/               # ApiException + GlobalExceptionHandler
│   │   └── UsedCarManagementApplication.java
│   ├── src/main/resources/application.properties
│   ├── API_SCHEMA.md                # Full REST contract
│   └── pom.xml
├── frontend/                        # Angular SPA
│   └── src/app/
│       ├── core/                    # services, guards, interceptors, models, utils
│       ├── features/                # routed feature components (lazy-loaded)
│       ├── shared/                  # reusable UI components
│       └── shells/                  # user-shell / admin-shell layouts
├── Dockerfile                       # Multi-stage: build backend + frontend → one image
├── docker-compose.yml
├── postman_collections.json         # Newman/Postman integration suite
└── postman_environment.json
```

---

## 4. Authentication & Sessions

Authentication is implemented with **custom opaque session tokens**, not JWT.

**Login / token issuance** (`AuthServiceImpl`, `SessionTokenService`):

1. Credentials are verified with BCrypt against the stored `passwordHash`.
2. A 256-bit random token is generated (`SecureRandom`, Base64-URL encoded).
3. The token's **SHA-256 hash** is stored on the user row
   (`activeSessionTokenHash`, unique) along with `activeSessionExpiresAt =
   now + SESSION_EXPIRATION_MINUTES` (default 120).
4. The **raw token is returned once** to the client; only the hash is persisted.

**Single active session per user.** Each login overwrites the stored token hash
and expiry, so a new login invalidates any previous session for that account.
Logout nulls both fields.

**Request authentication** (`SessionServiceImpl`):

- Protected endpoints read the `X-Session-Token` request header.
- The service hashes the presented token and looks up the user by
  `activeSessionTokenHash`; a missing match or an expired
  `activeSessionExpiresAt` yields `401 Invalid or expired session`.

**Authorization.** `Role` is `ADMIN` or `USER`. Service helpers
`requireUser` / `requireRole` / `requireAnyRole` enforce role at the service
boundary. A regular `USER` acts as both buyer and seller depending on the
action.

**Admin bootstrap.** Registration normally creates a `USER`. Registering with
role `ADMIN` is allowed **only while no admin exists** (`countByRole(ADMIN) == 0`);
afterwards it returns `409 Admin user already exists`. Username, phone number,
and email are each unique. Passwords must be at least 10 characters.

---

## 5. Domain Model

JPA entities under `model/`. Relationships:

| Entity | Key fields | Relationships |
|---|---|---|
| `AppUser` | `username`*, `name`, `phoneNumber`*, `email`*, `passwordHash`, `role`, `activeSessionTokenHash`*, `activeSessionExpiresAt` | seller of many `Car`; buyer/seller of many `PurchaseOrder` |
| `Car` | `make`, `model`, `year`, `price`, `mileage`, `color`, `available`, `approvalStatus`, `viewCount` | `@ManyToOne` `seller` |
| `PurchaseOrder` | `status`, `fraudAlert`, `createdAt` | `@ManyToOne` `buyer`, `seller`, `car`; `@OneToOne` `payment` |
| `Payment` | `id` (UUID), `status`, `amount`, `method`, `gatewayName`, `gatewayTransactionId`, `failureReason`, `paidAt` | `@OneToOne` back-ref to order |
| `WishlistItem` | — | `@ManyToOne` `buyer`, `car` |
| `Feedback` | `message`, `createdAt` | `@ManyToOne` `user` |
| `SupportTicket` | `subject`, `description`, `status`, `createdAt` | `@ManyToOne` `buyer`; `@OneToMany` `responses` |
| `TicketResponse` | `message`, `respondedAt` | `@ManyToOne` `ticket`, `sender` |
| `RecentView` | `sessionToken`, `viewedAt` | `@ManyToOne` `user`, `car` |

`*` = unique column.

**Enums** (`@Enumerated(EnumType.STRING)`):

- `Role` — `ADMIN`, `USER`
- `ApprovalStatus` (car listing) — `PENDING_ADMIN_APPROVAL`, `APPROVED`, `REJECTED`
- `OrderStatus` — `PENDING_ADMIN_APPROVAL`, `PENDING_SELLER_APPROVAL`, `APPROVED`, `REJECTED`, `CANCELLED`
- `PaymentStatus` — `SUCCESS`, `FAILED`
- `TicketStatus` — `OPEN`, `CLOSED`

---

## 6. Core Workflows

### 6.1 Listing lifecycle

```
Seller creates car ──► ApprovalStatus.PENDING_ADMIN_APPROVAL
                          │
        Admin approve ──► APPROVED ──► eligible for /browse
        Admin reject  ──► REJECTED
```

`GET /api/cars/available` returns only cars that are `APPROVED`, `available =
true`, **and not owned by the requesting user** (admins see all approved
listings). Viewing a non-approved car is forbidden unless you are its seller or
an admin; each successful view increments `viewCount` and records a `RecentView`.

**Deletion.** Sellers and admins can delete car listings. Related `WishlistItem` 
and `RecentView` records are automatically removed. Cars with existing 
`PurchaseOrder` records cannot be deleted (orders are historical records).

### 6.2 Purchase / order lifecycle

A purchase runs payment first, then a two-stage approval (admin, then seller):

```
Buyer purchases car
   │  payment processed by PaymentGateway
   ├─ payment FAILED  ──► 400, no order created
   └─ payment SUCCESS ──► PurchaseOrder created: OrderStatus.PENDING_ADMIN_APPROVAL
                              │   (fraudAlert flagged if this is the buyer's 4th+ order)
            Admin approve ──► PENDING_SELLER_APPROVAL
            Admin reject  ──► REJECTED
                              │
            Seller approve ─► APPROVED  ──► car.available = false (sale closed)
            Seller reject  ─► REJECTED
```

- **Payment** is handled by `SimulatedPaymentGateway` (`PaymentGateway`
  interface): a payment token beginning with `fail` is declined; otherwise the
  charge succeeds and a `txn_<uuid>` transaction id is recorded. Every attempt
  persists a `Payment` row linked 1:1 to the order.
- **Fraud heuristic.** `fraudAlert` is set when a buyer exceeds 3 orders
  (`countByBuyer + 1 > 3`); it is an advisory flag surfaced to admins, not a
  hard block.

### 6.3 Support tickets & feedback

Buyers open `SupportTicket`s and exchange `TicketResponse` messages with admins;
admins can change ticket `status` (`OPEN`/`CLOSED`). Users can also submit
free-text `Feedback` that admins read.

---

## 7. Backend Design Notes

- **Layering.** `controller → service interface → service impl → repository`.
  Controllers are thin: they read the token header, validate input
  (`@Valid`, `@Positive`), and delegate. DTOs (`dto/`) decouple request/response
  shapes from entities.
- **Error handling.** `GlobalExceptionHandler` (`@RestControllerAdvice`) maps
  `ApiException` and validation errors to a uniform JSON body, so the frontend
  gets consistent `{ "message": ... }` responses with correct HTTP status codes.
- **Cross-cutting logging.** `LoggingAspect` wraps all `controller..*` and
  `service..*` methods with an `@Around` advice (execution timing) and
  `@AfterThrowing` advice (exception logging).
- **CORS.** `CorsConfig` allows `http://localhost:4200` / `127.0.0.1:4200` for
  all `/api/**` methods with credentials.
- **Notifications.** `NotificationService` emits email on events (registration,
  purchase request) **only when `NOTIFICATION_EMAIL_ENABLED=true`**; otherwise it
  logs the intended message. SMTP is configured via env vars.
- **Persistence.** `spring.jpa.open-in-view=false`; service methods that need
  lazy associations initialize them explicitly within the transaction. Schema is
  managed by Hibernate (`ddl-auto=update`).
- **API docs.** Swagger UI at `/swagger-ui.html`, OpenAPI JSON at `/v3/api-docs`.

---

## 8. REST API Summary

All paths are under the server root; all endpoints except register/login require
`X-Session-Token`. Several buyer/seller routes are exposed under both `/buyer/*`
and `/user/*` (and `/seller/*`/`/user/*`) aliases.

| Area | Method & Path | Notes |
|---|---|---|
| Auth | `POST /api/auth/register` | create account (admin only if none exists) |
| Auth | `POST /api/auth/login` | returns session token |
| Auth | `POST /api/auth/logout` | invalidates session |
| Cars | `POST /api/cars` · `PUT /api/cars/{id}` · `DELETE /api/cars/{id}` | seller CRUD on own listings |
| Cars | `GET /api/cars/my` | caller's listings |
| Cars | `GET /api/cars/available` | approved, available, not-owned |
| Cars | `GET /api/cars/{id}` | detail (records a view) |
| Cars | `GET /api/cars/recent` · `GET /api/cars/popular` | recent views / top by `viewCount` |
| Cars | `GET /api/cars/compare?firstCarId=&secondCarId=` | side-by-side compare |
| Wishlist | `POST` / `DELETE /api/user/wishlist/{carId}` · `GET /api/user/wishlist` | (`/buyer/*` alias) |
| Purchase | `POST /api/user/cars/{carId}/purchase` | run payment + create order |
| Purchase | `GET /api/orders/my` | caller's orders |
| Purchase | `GET /api/user/sales/pending` | seller's orders awaiting approval |
| Purchase | `GET /api/user/dashboard` | seller dashboard stats |
| Purchase | `POST /api/user/sales/{orderId}/approve` · `/reject` | seller decision |
| Support | `POST` / `GET /api/user/support-tickets` | open / list tickets |
| Support | `POST /api/support-tickets/{id}/messages` | add a message |
| Feedback | `POST /api/feedback` | submit feedback |
| Admin | `GET /api/admin/dashboard` | aggregate stats |
| Admin | `GET /api/admin/users` | list all users |
| Admin | `GET /api/admin/cars/pending` · `POST /api/admin/cars/{id}/approve` · `/reject` | moderate listings |
| Admin | `PUT /api/admin/cars/{id}` | edit car listing details |
| Admin | `GET /api/admin/orders` · `GET /api/admin/orders/pending` · `POST /api/admin/orders/{id}/approve` · `/reject` | moderate orders |
| Admin | `PUT /api/admin/users/{id}` | edit user details (username, name, phone, email, role) |
| Admin | `GET /api/admin/support-tickets` · `PATCH /api/admin/support-tickets/{id}` | manage tickets |
| Admin | `GET /api/feedback/admin` | read feedback |

See [`backend/API_SCHEMA.md`](backend/API_SCHEMA.md) for request/response bodies.

---

## 9. Frontend Architecture

- **Angular 17 standalone components** — no `NgModule`s; routes use
  `loadComponent` for lazy loading (`app.routes.ts`).
- **Layout shells.** `shells/user-shell` and `shells/admin-shell` wrap the two
  route groups with their respective navigation chrome.
- **Routing & guards.** The authenticated route group is protected by
  `AuthGuard` (redirects to `/login`); the `/admin/**` group additionally
  requires `AdminGuard` (redirects non-admins to `/browse`). Unknown routes
  render a `NotFound` component.
- **HTTP interceptor.** A functional interceptor reads `session_token` from
  `localStorage`, attaches it as `X-Session-Token` on every request, and clears
  it on a `401` response.
- **Domain services** (`core/services/`): `auth`, `car`, `order`, `wishlist`,
  `ticket`, `feedback`, `admin` — each wraps the corresponding API area.
- **Config.** API base URL comes from `src/environments/environment.ts`
  (`apiBaseUrl: http://localhost:8080`).
- **Styling.** A custom dark design system driven by CSS variables in
  `styles.scss` (surfaces, hairlines, accent, Geist typography); Phosphor icons
  for iconography.

Feature areas: `browse`, `car-detail` (+ `purchase-dialog`), `my-listings`
(`list-car`/`edit-car`), `my-orders` (+ `order-detail`), `wishlist`, `compare`,
`tickets`, `auth` (`login`/`register`), and the `admin/*` screens (dashboard,
pending cars, pending orders, users, feedback, tickets). Admin screens include
inline editing for users and car listings via modal dialogs.

---

## 10. Configuration

Backend configuration is environment-driven (`application.properties`). Key
variables (full list in `backend/.env.example`):

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:derby:usedcarsdb;create=true` | JDBC datasource URL |
| `DB_DRIVER` | Derby autoloaded driver | JDBC driver class |
| `DB_USERNAME` / `DB_PASSWORD` | empty | DB credentials |
| `JPA_DDL_AUTO` | `update` | Hibernate schema mode |
| `JPA_SHOW_SQL` / `JPA_FORMAT_SQL` | `false` | SQL logging |
| `SESSION_EXPIRATION_MINUTES` | `120` | Session TTL |
| `NOTIFICATION_EMAIL_ENABLED` | `false` | Toggle real email sending |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USERNAME` / `SMTP_PASSWORD` | localhost:1025 | SMTP transport |
| `DEMO_SEED` | `true` | Toggle demo data seeding |
| `PORT` | `8080` | HTTP port |

**Database.** Defaults to embedded Apache Derby (a `usedcarsdb/` directory is
created on first run). Point `DB_*` at MySQL/PostgreSQL to use an external
database; the schema is created/updated by Hibernate.

---

## 11. Demo Data & Accounts

`DemoDataSeeder` (a `CommandLineRunner`) runs on startup when
`app.demo.seed-support-tickets` is true. Seeding is **enabled by default**
(`DEMO_SEED=true`), idempotent, and preserves existing rows. It creates the
three accounts below, seed support tickets, and **8 approved listings** owned by
`demoseller` so `/browse` is populated immediately.

| Role | Username | Password | Used for |
|---|---|---|---|
| Admin | `demoadmin` | `Demo@1234x` | approvals, moderation, admin dashboard |
| Buyer | `demouser` | `Demo@12345` | browse, wishlist, purchase |
| Seller | `demoseller` | `Demo@12345` | owns the seeded approved listings |

> The admin password ends in `x`. Disable seeding with `DEMO_SEED=false`.

---

## 12. Running the Project

### Option A — Docker (single container)

The multi-stage `Dockerfile` builds the backend JAR and the Angular bundle, then
serves both from one JVM. `docker-compose.yml` wires a persistent Derby volume
and enables demo seeding.

```bash
docker compose up --build
```

- App: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### Option B — Local (two processes)

**Backend** (port 8080):

```bash
cd backend
mvn spring-boot:run
```

**Frontend** (port 4200) in a second terminal:

```bash
cd frontend
npm install
npm start            # ng serve; use `-- --port 4300` if 4200 is busy
```

The dev frontend calls the backend at `http://localhost:8080` (allowed by CORS).

---

## 13. Build & Packaging

```bash
# Backend: produce a runnable JAR
cd backend
mvn clean package
java -jar target/used-car-management-0.0.1-SNAPSHOT.jar

# Frontend: production bundle (output: frontend/dist/used-cars-frontend/browser)
cd frontend
npm run build
```

In the Docker image the frontend bundle is copied into the backend's static
resources, so the JAR alone serves the SPA at `/` and the API at `/api/**`.

---

## 14. Integration Testing

A Postman/Newman suite at the repo root exercises the end-to-end API flow
(register → login → list → approve → purchase → approve):

- `postman_collections.json`
- `postman_environment.json`

Run it against a running backend with the Newman CLI. Additional notes live in
[`INTEGRATION_TESTING.md`](INTEGRATION_TESTING.md).

---

## 15. Further Documentation

| Document | Contents |
|---|---|
| [`backend/API_SCHEMA.md`](backend/API_SCHEMA.md) | Full REST contract (requests/responses) |
| [`backend/README.md`](backend/README.md) | Backend-specific notes |
| [`backend/IDE_ENV_SETUP.md`](backend/IDE_ENV_SETUP.md) | IDE / environment setup |
| [`INTEGRATION_TESTING.md`](INTEGRATION_TESTING.md) | API integration test guide |
