# Slide Outline — Used Car Marketplace (Code Showcase)
*6 slides · hackathon · judged on CODE & PRODUCT · 6-person team · structure only, prose generated at build*

---

## Slide 1 — Title / Overview
**Title:** TrustLot — A Full-Stack Used-Car Marketplace
**Key points:**
- Full-stack buy & sell platform: Spring Boot backend + Angular SPA, built by 6
- A trust-first marketplace: every listing and every sale is moderated in code
- One-command Docker run — backend + frontend in a single container
**Must-show data:** Java 17 · Spring Boot 3.3.5 · Angular 17 · 36 REST endpoints · 7 domains

---

## Slide 2 — System Architecture
**Title:** Layered by Design
**Key points:**
- Strict layering: Controller → Service (interface) → Impl → Repository → Model
- DTO layer decouples API contracts from JPA entities; uniform errors via GlobalExceptionHandler
- Cross-cutting concerns isolated: AOP LoggingAspect, CORS/OpenAPI config, env-driven setup
**Must-show data (diagram):** Angular SPA → REST `:8080` → 7 Controllers → 8 Services → 8 Repositories → Derby/MySQL. Patterns: Layered · DTO · Dependency Inversion · Strategy · AOP.

---

## Slide 3 — Core Feature: Multi-Step Approval Workflow
**Title:** Trust Enforced in Code
**Key points:**
- 3-party handshake — no silent transactions, every state change is explicit
- Modeled as state machines via enums: ApprovalStatus, OrderStatus, PaymentStatus
- Roles built in: Buyer / Seller / Admin
**Must-show data (flow diagram):** Seller lists → **Admin approves listing** → Buyer buys → **Admin approves order** → **Seller approves sale** → Complete. Payment tracked separately (PaymentStatus + SimulatedPaymentGateway).

---

## Slide 4 — Backend Engineering Depth
**Title:** Under the Hood
**Key points:**
- Auth without JWT, by choice: server-side session tokens (X-Session-Token), BCrypt, role guards, 120-min TTL
- Swappable payments: PaymentGateway interface + SimulatedPaymentGateway (Strategy) — drop in a real processor
- Decoupled NotificationService, RecentView tracking, full support-ticket threads
**Must-show data:** 36 endpoints (17 GET · 15 POST · 2 DELETE · 1 PUT · 1 PATCH) · live Swagger/OpenAPI docs · 14 entities, 5 enums, 11 DTOs.

---

## Slide 5 — Product Surface (Frontend & Features)
**Title:** One Product, Three Experiences
**Key points:**
- Buyer: browse, compare, wishlist, purchase, track orders, support tickets
- Seller: list & edit cars, approve sales, seller dashboard
- Admin: moderate listings & orders, manage users, dashboard analytics, ticket desk
**Must-show data:** Angular 17 standalone components · ~20 feature areas · Angular Material · role-aware routing.

---

## Slide 6 — Engineering Quality & Demo
**Title:** Built to Run & Prove
**Key points:**
- `docker compose up --build` → full app on `:8080`; DemoDataSeeder loads demo users/cars/tickets
- Integration tested end-to-end with Postman + Newman; live API docs via Swagger
- 12-factor config: swap Derby↔MySQL, session TTL, email, port via env
**Must-show data / CTA:** Demo accounts ready (demoadmin / demouser / demoseller). Honest scope: Newman integration over JUnit, simulated payments — deliberate hackathon tradeoffs. Live demo now.
