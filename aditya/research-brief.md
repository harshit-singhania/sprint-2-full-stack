# Codebase Brief — RentalSphere (Vehicle Rental Management System)
*For a hackathon deck judged on CODE & PRODUCT. No external market data — factual inventory from the project docs.*

**Compiled:** 2026-06-07 · **Team:** 6 (Team RentalSphere) · **Slides:** 6
**Sources:** `aditya/readme.md`, `aditya/more-info.md` (plaintext copy of same content).
⚠️ **Caveat:** Only the project README/spec is present in this folder — figures describe the documented design, not verified against source. Frame accordingly.

---

## At a glance (from the spec)
- Full-stack **Vehicle Rental** platform — Spring Boot + Angular, MySQL
- **10 feature modules:** Auth, Profile, Vehicle, Booking, Return, Billing, Payment, Notification, Support, Audit
- **8 core tables:** USERS, VEHICLES, BOOKINGS, BILLS, PAYMENTS, NOTIFICATIONS, SUPPORT_TICKETS, AUDIT_LOGS
- **15-item stack** · **3 API access tiers** (public / user / admin) · **2 roles** (USER, ADMIN)
- **6 contributors:** Ajoy Mondal, Bikram Dey, Aditya Vishal Tiwari, Rajashri Adhikari, Sameer Kumar Padhi, Rupsha Sarkar

---

## THEME 1 — What it is (product)
Simulates a real-world vehicle-rental business end-to-end.
- **User:** register + Email-OTP verify → browse/search/filter vehicles → book → return → view bill → request payment → download invoice; raise support tickets; get notifications.
- **Admin:** manage vehicles, validate returns + late charges, generate bills, approve/reject payments, resolve tickets, broadcast notifications, monitor audit logs.

Stack: **Java 17 · Spring Boot 3.x · Spring MVC · Spring Security · JWT · BCrypt · Spring Data JPA · MySQL · Angular · Maven · Lombok · Spring Mail · Jakarta Validation · Swagger/OpenAPI · Postman.**

---

## THEME 2 — Architecture & enterprise security (the differentiator)
Layered: Angular → Spring Boot REST → Controller → Service → Repository → MySQL.
Package layout: `common / config / controller / dto / exception / model(+enums) / repository / service`.
**Security is the headline:**
- **JWT authentication, stateless sessions**, Spring Security **filter chain** (`JwtFilter`)
- **Email-OTP** verification on registration + **forgot-password OTP** flow
- **BCrypt** hashing · **role-based** + **method-level** security
- Custom **AccessDenied handling** + **AuthenticationEntryPoint**
- **Global exception handling** + **Audit logging** of user/admin/system events

---

## THEME 3 — The rental lifecycle (core workflow / state machine)
A gated lifecycle, not a single click:
`Register → Verify OTP → Login → Browse → Book → Return → Bill generated → Request payment → Admin approval → Download invoice → Completed`
Business rules enforced in code:
- **Vehicle:** unique reg number, must be active + available, maintenance vehicles unbookable
- **Booking:** valid license required, start < end, duplicate + overlapping bookings blocked
- **Billing formula:** `Final = Rental + Late charges + Damage charges + GST (18%)`
- **Payment:** bill required first → admin approval → transaction ID generated

---

## THEME 4 — Modules in depth (what judges grep for)
- **Notification system:** user events (booking/return/bill/payment/ticket), admin events (new booking, payment/return request, ticket), **broadcast** (maintenance, promos, announcements, alerts).
- **Email system (Spring Mail):** auth OTP/verification, booking confirm/cancel, bill/invoice ready, payment approved/rejected, ticket created/updated.
- **Support tickets:** 6 categories (Booking, Payment, Vehicle, Complaint, Feedback, Other), status tracking, admin responses.
- **Audit logs:** track user activities, admin activities, system events.

---

## THEME 5 — API & access model (security surface)
Three explicit tiers:
- **Public:** `/api/v1/auth/**`, `/api/v1/vehicles/**`
- **Protected (USER):** `/users`, `/bookings`, `/payment`, `/billing`, `/notifications`, `/support`
- **Admin only:** `/api/v1/admin/**`
Auth header: `Authorization: Bearer <JWT>`. Docs live at Swagger UI `/swagger-ui/index.html`.

---

## THEME 6 — Status, testing & roadmap
- **Shipped (✅ per README):** JWT + OTP auth, vehicle CRUD + search + availability, booking create/history/cancel, return validation, bill + GST, payment approval, user/admin notifications, ticket management, audit logs.
- **Tested with:** Postman + Swagger UI.
- **Run:** backend `mvn spring-boot:run` (:8080) · frontend `npm install && ng serve` (:4200).
- **Roadmap:** PDF invoices, Razorpay/Stripe, WebSocket notifications, Docker, AWS, mobile app, analytics dashboard, image upload, i18n.
- **Honest gaps to own:** payments are approval-simulated (no gateway yet), no Docker/containerization yet, MySQL single-DB — all on the roadmap.
