# Used Car Buy & Sell Marketplace

A full-stack marketplace for buying and selling used cars. The backend is a Spring Boot monolith and the frontend is an Angular app.

## What’s Included

- User registration and login with session tokens
- Car listing, approval, browsing, wishlist, and purchase flow
- Admin dashboard and moderation tools
- Feedback and support ticket workflows
- Swagger UI and Postman integration coverage

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.3.5, Spring Data JPA, Apache Derby, BCrypt
- **Frontend:** Angular 17, Angular Material
- **Docs/Testing:** Swagger/OpenAPI, Postman/Newman
- **Runtime:** Docker + Docker Compose

## Demo Accounts

Demo data is seeded automatically on startup (see [Demo data seeding](#demo-data-seeding)), so these accounts are ready to log in with out of the box:

| Role | Username | Password | Use it to demo |
|---|---|---|---|
| **Admin** | `demoadmin` | `Demo@1234x` | Approve listings/orders, moderation, admin dashboard |
| **Buyer** | `demouser` | `Demo@1234` | Browse, wishlist, and purchase cars |
| **Seller** | `demoseller` | `Demo@1234` | Owns the pre-seeded, approved car listings |

> The seller (`demoseller`) comes with 8 approved listings, so `/browse` is populated immediately for any account. Note the admin password ends in `x`.

## Run With Docker

The Docker setup builds the backend and frontend into a single app container.

```bash
docker compose up --build
```

Then open:

- App: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

The Docker compose file enables demo data seeding, including demo users, cars, support tickets, and admin replies.

## Run Without Docker

### 1) Start the backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080` by default.

### 2) Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm start
```

Angular serves on `http://localhost:4200` by default.

If port `4200` is busy, use:

```bash
npm start -- --port 4300
```

The frontend is already configured to call the backend at `http://localhost:8080`.

### Demo data seeding

Seeding is **enabled by default** (Docker and local), so the demo accounts above, their support tickets, and the approved car listings are created on first startup. Seeding is idempotent and preserves existing data.

To disable it, set:

```bash
DEMO_SEED=false
```

and then start the backend.

## Useful URLs

- Frontend app: `http://localhost:4200` or `http://localhost:4300`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

## Backend Commands

Run these from `backend/`:

```bash
mvn spring-boot:run
mvn clean package
java -jar target/used-car-management-0.0.1-SNAPSHOT.jar
mvn test
```

## API Notes

- Protected endpoints require `X-Session-Token: <token>`
- Authentication uses custom session tokens, not JWT
- Responses use a shared JSON error format via the global exception handler

## Environment Variables

Key backend variables:

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:derby:usedcarsdb;create=true` | Datasource URL |
| `DB_USERNAME` / `DB_PASSWORD` | empty | DB credentials |
| `DB_DRIVER` | `org.apache.derby.iapi.jdbc.AutoloadedDriver` | JDBC driver |
| `SESSION_EXPIRATION_MINUTES` | `120` | Session TTL |
| `NOTIFICATION_EMAIL_ENABLED` | `false` | Email toggle |
| `PORT` | `8080` | Server port |
| `JPA_DDL_AUTO` | `update` | Hibernate schema mode |

See `backend/.env.example` for the full list.

## Integration Testing

Newman collection and environment files are included at the repo root:

- `postman_collections.json`
- `postman_environment.json`

Run them against the backend to validate the end-to-end API flow.

## Notes

- `frontend/` is an Angular app and uses `http://localhost:8080` as its API base URL.
- The Docker image bundles both backend and frontend into one runnable container.
- The demo data seeder is enabled by default; disable it with `DEMO_SEED=false`.
