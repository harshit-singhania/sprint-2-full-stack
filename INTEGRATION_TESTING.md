# Integration Testing — Used Car Marketplace

End-to-end integration suite driven by **`postman_collections.json`**. Because the Angular frontend
(`frontend/src/app/core/services/*`) is a thin HTTP client over the Spring Boot API, this single
collection is the integration contract for **both** tiers: every endpoint a frontend service calls is
exercised here with response assertions.

## Prerequisites

1. Backend running on `http://localhost:8080`:
   ```bash
   cd backend && mvn spring-boot:run
   ```
2. Node + Newman (CLI runner for Postman):
   ```bash
   npm install -g newman newman-reporter-htmlextra
   ```

## Run the backend integration suite

```bash
newman run postman_collections.json \
  -e postman_environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export newman-report.html
```

The collection is **sequential and self-chaining**: tokens, `carId`, `orderId`, and `ticketId` are
captured from earlier responses and reused. Seller/buyer usernames are auto-generated per run
(`seller_<ts>`, `buyer_<ts>`) so the suite is re-runnable. The admin account uses the demo singleton
(`demoadmin`); its registration step tolerates "already exists".

## What it covers

| Folder | Flow |
|---|---|
| 00 Auth & Setup | register (admin/seller/buyer), login, invalid-phone + bad-password negatives |
| 01 Car Listing | create (+unauth/invalid-year negatives), update, my-cars |
| 02 Admin Approval | RBAC negative, pending list, approve cars |
| 03 Browse & Discovery | available, details, recent, popular, compare |
| 04 Wishlist | add, view, remove |
| 05 Purchase Flow | self-purchase negative, purchase → admin approve → seller approve → my-orders |
| 06 Feedback | submit, admin list |
| 07 Support Tickets | create, list (user/admin), chat message, admin update+close |
| 08 Dashboards | admin dashboard, admin all-orders |
| 09 Teardown | logout + post-logout token-rejection negative |

The full multi-step approval lifecycle is asserted by status transitions:
`PENDING_ADMIN_APPROVAL → PENDING_SELLER_APPROVAL → APPROVED`.

## Frontend service → covered endpoint matrix

Every method below is validated by the request in the matching folder, so a green Newman run means the
frontend's HTTP contract holds.

| Angular service.method | Endpoint | Suite folder |
|---|---|---|
| `AuthService.register/login/logout` | `/api/auth/*` | 00 |
| `CarService.createCar/updateCar/deleteCar` | `POST/PUT/DELETE /api/cars[/{id}]` | 01 |
| `CarService.getMyCars` | `/api/cars/my` | 01 |
| `CarService.getAvailableCars` | `/api/cars/available` | 03 |
| `CarService.getCarById` | `/api/cars/{id}` | 03 |
| `CarService.getRecentCars` | `/api/cars/recent` | 03 |
| `CarService.getPopularCars` | `/api/cars/popular` | 03 |
| `CarService.compareCars` | `/api/cars/compare` | 03 |
| `WishlistService.add/get/remove` | `/api/user/wishlist[/{id}]` | 04 |
| `OrderService.purchase` | `/api/user/cars/{id}/purchase` | 05 |
| `OrderService.getMyOrders` | `/api/user/orders` | 05 |
| `AdminService.pendingCars/approveCar/rejectCar` | `/api/admin/cars/*` | 02 |
| `AdminService.pendingOrders/approveOrder` | `/api/admin/orders/*` | 05 |
| seller sales approve/reject | `/api/user/sales/*` | 05 |
| `FeedbackService.submit` / admin list | `/api/feedback`, `/api/feedback/admin` | 06 |
| `TicketService.create/getMine/reply` | `/api/user/support-tickets`, `/api/support-tickets/{id}/messages` | 07 |
| admin tickets + update | `/api/admin/support-tickets[/{id}]` | 07 |
| `AdminService.dashboard` | `/api/admin/dashboard` | 08 |

## Frontend unit/integration tests (Angular)

Component-level integration tests run via Karma against mocked HTTP using the same contract:

```bash
cd frontend && npm test
```

Keep frontend `HttpTestingController` expectations aligned with the URLs in the matrix above; the
Postman suite is the source of truth for the live contract.
