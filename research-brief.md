# Codebase Brief — Used Car Buy & Sell Marketplace
*For a hackathon deck judged on CODE & PRODUCT. No external market data — this is a factual inventory of what we built, pulled from the repo.*

**Compiled:** 2026-06-07 · **Team:** 6 · **Slides:** 6 · Sources: `README.md`, `AGENTS.md`, `backend/API_SCHEMA.md`, source tree.

---

## At a glance (real counts from the source tree)
- **7 REST controllers** — Auth, Car, Purchase, Wishlist, Feedback, SupportTicket, Admin
- **8 service interfaces + 8 impls** — clean interface/impl separation
- **8 JPA repositories** · **14 model classes** (incl. **5 enums**) · **11 DTOs**
- **36 REST endpoints** — 17 GET · 15 POST · 2 DELETE · 1 PUT · 1 PATCH
- **~20 Angular feature areas** across buyer / seller / admin
- Integration tested via **Postman + Newman** collection (no JUnit suite — honest)

---

## THEME 1 — What it is (product)
Full-stack used-car marketplace. Three actors from two roles:
- **Buyer** (USER): browse, compare, wishlist, purchase, track orders, raise support tickets
- **Seller** (USER): list cars, edit listings, approve sales, seller dashboard
- **Admin**: moderate listings/orders, manage users, handle tickets, dashboard analytics

Stack: **Java 17 · Spring Boot 3.3.5 · Spring Data JPA · Apache Derby (MySQL via env) · BCrypt · SpringDoc OpenAPI** | **Angular 17 + Angular Material** | **Docker Compose** single-container.

---

## THEME 2 — Architecture (the engineering story)
Layered Spring Boot **monolith**, strict separation:
`controller/` → `service/` (interface) → `service/impl/` → `repository/` → `model/`
- **DTO layer** (`dto/`) decouples API contracts from JPA entities
- **Global error handling**: `ApiException` + `GlobalExceptionHandler` → uniform JSON errors
- **Cross-cutting via AOP**: `LoggingAspect` logs across layers without polluting business code
- **Config isolation**: `CorsConfig`, `OpenApiConfig`, `DemoDataSeeder`
- Angular = **standalone-component SPA**, lazy feature areas, calls REST at `:8080`

**Design patterns to call out:** Layered architecture, DTO pattern, Dependency Inversion (interface/impl), Strategy (PaymentGateway), Aspect-Oriented logging, Global Exception Handler.

---

## THEME 3 — The killer feature: multi-step approval state machine
Trust enforced in code through **explicit enums acting as state machines**:
`ApprovalStatus`, `OrderStatus`, `PaymentStatus`, `TicketStatus`, `Role`.

Flow (no silent transactions):
1. Seller lists car → **Admin approves listing** (ApprovalStatus)
2. Buyer purchases → **Admin approves order** → **Seller approves sale** → complete (OrderStatus)
3. Payment tracked separately via `PaymentStatus` + `SimulatedPaymentGateway`

This 3-party handshake is the product's differentiator AND a clean engineering demonstration of state management.

---

## THEME 4 — Backend depth (what judges grep for)
- **Auth without JWT, by design:** server-side **session tokens** via `SessionTokenService` / `SessionServiceImpl`, `X-Session-Token` header, BCrypt-hashed passwords, 120-min expiry, role-based guards.
- **Payment abstraction:** `PaymentGateway` interface + `SimulatedPaymentGateway` impl (Strategy pattern) → swappable for a real processor, `Payment` entity + `PaymentRepository`.
- **Notifications:** `NotificationService` (email toggle via env), decoupled.
- **36 endpoints** documented live in **Swagger UI** (`/swagger-ui.html`).
- **Extras:** `RecentView` tracking, wishlist, feedback, full support-ticket thread (`SupportTicket` + `TicketResponse`).

---

## THEME 5 — Frontend & UX (product surface)
Angular 17 standalone components, ~20 feature areas:
- **Buyer:** browse, car-detail, **compare**, wishlist, my-orders + order-detail, purchase-dialog
- **Seller:** my-listings, list-car, edit-car
- **Admin:** dashboard, pending-cars, pending-orders, users, tickets, ticket-detail, feedback
- **Shared:** auth (login/register), tickets (create + detail), not-found
- Angular Material UI; role-aware routing; recently had a design revamp (`DESIGN-REVAMP.md`).

---

## THEME 6 — Engineering quality & how to run
- **One-command Docker:** `docker compose up --build` → bundles backend + Angular build into a single container on `:8080`.
- **Demo seeding:** `DemoDataSeeder` loads demo users, cars, tickets, admin replies (accounts: `demoadmin` / `demouser` / `demoseller`, all `Demo@1234`).
- **Integration testing:** Postman collection + **Newman** (`postman_collections.json`) validates the end-to-end API flow.
- **Live API docs:** Swagger/OpenAPI auto-generated.
- **Config via env:** DB swap (Derby↔MySQL), session TTL, email toggle, port — 12-factor friendly.

**Honest gaps to own if asked:** no JUnit unit-test suite (rely on Newman integration), single-DB monolith, simulated payments. These are scoped tradeoffs for a hackathon build.
