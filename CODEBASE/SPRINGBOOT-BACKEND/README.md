# Used Car Buy and Sell Management System — Backend

Spring Boot monolithic REST API for a used-car marketplace. Supports car listings, purchases, payments, seller reviews, receipts, wishlists, feedback, support tickets, and full admin management.

## Roles

| Role | Description |
|---|---|
| `ADMIN` | One per system. Approves listings and orders, manages users, views all data. |
| `USER` | Can act as both seller (lists cars) and buyer (purchases cars). |

Authentication uses a custom **stateful session token** — no JWT. After login, send the token on every protected request:

```http
X-Session-Token: <sessionToken>
```

Sessions expire after **120 minutes** by default.

---

## Tech Stack

- Java 17
- Spring Boot 3.3.5
- Spring Web, Spring Data JPA, Spring AOP, Spring Mail
- Apache Derby (embedded, file-based)
- Hibernate ORM 6
- Maven
- Jakarta Bean Validation
- BCrypt (`spring-security-crypto`)
- Swagger UI / OpenAPI (`springdoc-openapi`)

---

## Features

- Custom session token auth (SHA-256 hashed, stored in DB)
- Role-based access control enforced in the service layer
- Car listings with seller-declared condition fields (fuel type, transmission, body type, owners, engine, insurance, PUC)
- Car approval workflow — new listings require admin approval
- Purchase flow with simulated payment gateway
- Two-step order approval: Admin → Seller
- Fraud detection (auto-flag buyers with > 3 orders)
- Receipt generation for buyers, sellers, and admin
- Seller reviews (buyers who completed a purchase can rate sellers)
- Wishlist management
- Recent views per session (token-hash based, no raw token stored)
- Popular cars by view count
- Car comparison (side-by-side including all condition fields)
- Seller dashboard (listings, orders, revenue)
- Admin dashboard — stats + 30-day time-series graph data for charts
- Admin user management (list, get, edit, password reset)
- Feedback submission and admin review
- Support tickets with two-way chat (buyer ↔ admin)
- AOP logging (execution time on all controller/service methods)
- Email notifications (registration, purchase) — disabled by default

---

## Project Structure

```text
com.example.usedcars
├── config        # CORS, AOP logging, OpenAPI/Swagger
├── controller    # REST controllers (8 controllers)
├── dto           # Request/response records
├── exception     # ApiException + GlobalExceptionHandler
├── model         # JPA entities + enums
├── repository    # Spring Data JPA interfaces
└── service       # Interfaces + implementations
    └── impl
```

See `STRUCTURE.md` for the full file tree.

---

## Database

Apache Derby embedded — **no external DB needed**. The database folder `usedcarsdb/` is created automatically at the project root on first run.

```properties
spring.datasource.url=jdbc:derby:usedcarsdb;create=true
spring.datasource.driver-class-name=org.apache.derby.iapi.jdbc.AutoloadedDriver
spring.jpa.hibernate.ddl-auto=update
spring.sql.init.mode=never
```

To wipe and start fresh, stop the app and delete the `usedcarsdb/` folder.

---

## Environment Variables

All sensitive config is injected via environment variables with fallback defaults. Copy `.env.example` as your starting point.

| Variable | Default | Description |
|---|---|---|
| `SERVER_PORT` | `8080` | HTTP port |
| `DB_URL` | `jdbc:derby:usedcarsdb;create=true` | Datasource URL |
| `JPA_DDL_AUTO` | `update` | Hibernate DDL mode |
| `SESSION_EXPIRATION_MINUTES` | `120` | Session TTL |
| `NOTIFICATION_EMAIL_ENABLED` | `false` | Toggle email sending |
| `NOTIFICATION_EMAIL_FROM` | `no-reply@usedcars.local` | Sender address |
| `SMTP_HOST` | `localhost` | SMTP server |
| `SMTP_PORT` | `1025` | SMTP port |
| `SMTP_USERNAME` | _(empty)_ | SMTP auth user |
| `SMTP_PASSWORD` | _(empty)_ | SMTP auth password |
| `SMTP_AUTH` | `false` | Enable SMTP auth |
| `SMTP_STARTTLS` | `false` | Enable STARTTLS |
| `LOG_FILE` | `log.txt` | Log file path |

**IDE setup:** see `IDE_ENV_SETUP.md`.

---

## Running Locally

### Maven (any terminal)

```bash
mvn spring-boot:run
```

### IntelliJ IDEA

1. Open the project root.
2. Let IntelliJ import the Maven project.
3. Load env vars from `.env.intellij` in the run configuration  
   _(Run → Edit Configurations → Environment variables → paste the single-line value)_.
4. Run `UsedCarManagementApplication`.

### Eclipse

1. `File → Import → Maven → Existing Maven Projects`.
2. Load env vars from `.env.eclipse` in the run configuration.
3. Right-click `UsedCarManagementApplication.java → Run As → Spring Boot App`.

App starts on `http://localhost:8080` (or `SERVER_PORT` if overridden).

---

## API Documentation

Swagger UI (interactive):

```
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON:

```
http://localhost:8080/v3/api-docs
```

Full endpoint reference: see `API_SCHEMA.md`.

---

## Validation Rules

| Field | Rule |
|---|---|
| `password` | Minimum **10 characters** |
| `name` | Title Case words, e.g. `Rahul Sharma` |
| `phoneNumber` | Indian 10-digit mobile (starts 6–9) |
| `role` | `ADMIN` or `USER` |
| `car year` | 1900–2100 |
| `car price` | > 0.00 |
| `car mileage` | ≥ 0 |
| `review rating` | 1–5 |

---

## Quick API Reference

### Auth

| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Any logged-in |

### Cars

| Method | Path | Access |
|---|---|---|
| POST | `/api/cars` | USER |
| PUT | `/api/cars/{carId}` | Owner or ADMIN |
| DELETE | `/api/cars/{carId}` | Owner or ADMIN |
| GET | `/api/cars/available` | Any logged-in |
| GET | `/api/cars/{carId}` | Any logged-in |
| GET | `/api/cars/recent` | Any logged-in |
| GET | `/api/cars/compare?firstCarId=&secondCarId=` | Any logged-in |
| GET | `/api/cars/popular` | Any logged-in |

### Admin — Car Moderation

| Method | Path |
|---|---|
| GET | `/api/admin/cars/pending` |
| POST | `/api/admin/cars/{carId}/approve` |
| POST | `/api/admin/cars/{carId}/reject` |

### Purchase & Sales

| Method | Path | Access |
|---|---|---|
| POST | `/api/user/cars/{carId}/purchase` | USER |
| GET | `/api/orders/my` | Any logged-in |
| GET | `/api/orders/{orderId}/receipt` | Buyer / Seller / ADMIN |
| GET | `/api/user/sales/pending` | USER (seller) |
| POST | `/api/user/sales/{orderId}/approve` | Selling USER |
| POST | `/api/user/sales/{orderId}/reject` | Selling USER |

### Admin — Orders

| Method | Path |
|---|---|
| GET | `/api/admin/orders` |
| GET | `/api/admin/orders/pending` |
| POST | `/api/admin/orders/{orderId}/approve` |
| POST | `/api/admin/orders/{orderId}/reject` |
| GET | `/api/admin/orders/{orderId}/receipt` |

### Dashboards

| Method | Path | Access |
|---|---|---|
| GET | `/api/user/dashboard` | USER |
| GET | `/api/admin/dashboard` | ADMIN |
| GET | `/api/admin/dashboard/graph` | ADMIN |

### Admin — User Management

| Method | Path |
|---|---|
| GET | `/api/admin/users` |
| GET | `/api/admin/users/{userId}` |
| PATCH | `/api/admin/users/{userId}` |

### Seller Reviews

| Method | Path | Access |
|---|---|---|
| POST | `/api/reviews/sellers/{sellerId}` | USER (completed buyer) |
| GET | `/api/reviews/sellers/{sellerId}` | Any logged-in |
| GET | `/api/reviews/sellers/{sellerId}/average` | Any logged-in |

### Wishlist

| Method | Path | Access |
|---|---|---|
| POST | `/api/user/wishlist/{carId}` | USER |
| GET | `/api/user/wishlist` | USER |
| DELETE | `/api/user/wishlist/{carId}` | USER |

### Feedback

| Method | Path | Access |
|---|---|---|
| POST | `/api/feedback` | Any logged-in |
| GET | `/api/feedback/admin` | ADMIN |

### Support Tickets

| Method | Path | Access |
|---|---|---|
| POST | `/api/user/support-tickets` | USER |
| GET | `/api/user/support-tickets` | USER |
| POST | `/api/user/support-tickets/{ticketId}/messages` | Owner or ADMIN |
| GET | `/api/admin/support-tickets` | ADMIN |
| PATCH | `/api/admin/support-tickets/{ticketId}` | ADMIN |

> All `/buyer/` and `/seller/` paths are backward-compatible aliases for the `/user/` routes.

---

## Sample Request Bodies

### Register

```json
{
  "username": "rahul1",
  "name": "Rahul Sharma",
  "phoneNumber": "9876543210",
  "email": "rahul@example.com",
  "password": "rahulsecure1",
  "role": "USER"
}
```

### Login

```json
{ "username": "rahul1", "password": "rahulsecure1" }
```

### Add Car

```json
{
  "make": "Honda",
  "model": "City",
  "year": 2021,
  "price": 850000,
  "mileage": 25000,
  "color": "White",
  "condition": "GOOD",
  "fuelType": "PETROL",
  "transmission": "MANUAL",
  "bodyType": "SEDAN",
  "numberOfOwners": 1,
  "engineCc": 1497,
  "insured": true,
  "pucValid": true,
  "description": "Single owner, full service history"
}
```

### Purchase Car

```json
{ "paymentMethod": "UPI", "paymentToken": "pay_demo_token" }
```

> Use `"paymentToken": "fail_anything"` to simulate a declined payment.

### Submit Seller Review

```json
{ "rating": 4, "comment": "Smooth transaction, car as described." }
```

### Create Support Ticket

```json
{
  "subject": "Payment issue",
  "description": "Money deducted but order not created."
}
```

---

## Build & Deploy

### Package

```bash
mvn clean package
```

### Run JAR

```bash
java -jar target/used-car-management-0.0.1-SNAPSHOT.jar
```

### Run with overrides

```bash
java -jar target/used-car-management-0.0.1-SNAPSHOT.jar \
  --server.port=8081 \
  --app.session.expiration-minutes=60
```

---

## Notes

- `spring.jpa.open-in-view=false` — all DB access must happen inside `@Transactional` boundaries.
- `spring.jpa.hibernate.ddl-auto=update` — schema auto-updates on startup. Use `validate` + migrations in production.
- Passwords are BCrypt hashed. Session tokens are SHA-256 hashed before storage — raw tokens are never persisted.
- Only one ADMIN account can be registered per deployment.
- The `export-db.ps1` script exports the current Derby DB state to `src/main/resources/data-derby.sql`.
