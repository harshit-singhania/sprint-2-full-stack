# Slide Outline — RentalSphere (Code Showcase)
*6 slides · hackathon · judged on CODE & PRODUCT · 6-person team · structure only*

---

## Slide 1 — Title / Overview
**Title:** RentalSphere — Vehicle Rental Management System
**Key points:**
- Full-stack platform simulating a real-world rental business end-to-end
- Enterprise security: JWT, Email-OTP, role-based + audit logging
- Spring Boot + Angular + MySQL, built by a 6-person team
**Must-show data:** Java 17 · Spring Boot 3.x · 10 modules · 8 core tables · 3 API tiers

---

## Slide 2 — Architecture & Enterprise Security
**Title:** Secured End to End
**Key points:**
- Layered: Angular → REST → Controller → Service → Repository → MySQL
- Stateless JWT through a Spring Security filter chain (JwtFilter)
- Email-OTP verification, BCrypt, method-level + role-based authorization
**Must-show data:** AccessDenied handler + AuthenticationEntryPoint · Global exception handling · Audit logging of user/admin/system events. Package layout: common/config/controller/dto/exception/model/repository/service.

---

## Slide 3 — Core Workflow: The Rental Lifecycle
**Title:** A Gated Rental Lifecycle
**Key points:**
- Not one click — a multi-stage flow with admin approval
- Business rules enforced in code (availability, license, no overlaps)
- Transparent billing with a fixed formula
**Must-show data (flow diagram):** Register → Verify OTP → Book → Return → Bill → Request payment → **Admin approval** → Invoice → Completed. Billing: `Final = Rental + Late + Damage + GST (18%)`.

---

## Slide 4 — Modules in Depth
**Title:** More Than CRUD
**Key points:**
- Notifications: user events, admin events, and broadcasts
- Email engine (Spring Mail) across auth, booking, billing, payment, support
- Support desk: 6 categories, status tracking, admin responses
**Must-show data:** 8 core tables (USERS, VEHICLES, BOOKINGS, BILLS, PAYMENTS, NOTIFICATIONS, SUPPORT_TICKETS, AUDIT_LOGS) · Audit logs track user/admin/system events.

---

## Slide 5 — API & Access Model
**Title:** Three Tiers of Access
**Key points:**
- Public: auth + vehicle browsing, open to everyone
- Protected (USER): bookings, billing, payment, notifications, support
- Admin-only: full management surface behind /admin/**
**Must-show data:** `Authorization: Bearer <JWT>` · Roles: USER / ADMIN · Live docs at Swagger UI `/swagger-ui/index.html`.

---

## Slide 6 — Status, Testing & Roadmap
**Title:** Shipped, Tested, and Scaling
**Key points:**
- Core modules complete: auth, vehicles, bookings, returns, billing, payments, notifications, tickets, audit
- Validated with Postman + Swagger; run locally in two commands
- Roadmap: PDF invoices, Razorpay/Stripe, WebSocket, Docker, AWS
**Must-show data / CTA:** `mvn spring-boot:run` (:8080) · `ng serve` (:4200). Honest scope: payments approval-simulated, Docker/gateway on roadmap. Team RentalSphere (6).
