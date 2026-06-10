# Used Car Management API Schema

Base URL:

```text
http://localhost:8080
```

> Production / deployed base URL: configure via `PORT` environment variable.

Protected endpoints require:

```http
X-Session-Token: <sessionToken>
```

Generic error response (all 4xx / 5xx):

```json
{ "message": "Error message" }
```

## HTTP Status Code Reference

| Status | When |
|---|---|
| `200` | Success |
| `400` | Invalid input / business rule violation |
| `401` | Missing or expired `X-Session-Token` header |
| `403` | Valid session but insufficient role or ownership |
| `404` | Requested resource not found |
| `409` | Duplicate value (username, email, phone, second admin) |
| `500` | Unexpected server error |

> Omitting the `X-Session-Token` header entirely returns `401 {"message":"Login required"}`.  
> Sending an expired or invalid token returns `401 {"message":"Invalid or expired session"}`.

---

## Architecture Notes

- Roles are `ADMIN` and `USER`. Only one `ADMIN` account can exist.
- A `USER` can both list cars for sale **and** buy cars — same role, different contexts.
- A `USER` cannot buy their own listed car.
- New or edited car listings require admin approval before becoming publicly visible.
- Purchase orders go through a two-step approval: **Admin → Seller**.
- Support tickets support two-way chat between the ticket owner and admin.
- Backward-compatible `/buyer/` and `/seller/` path aliases still work; prefer `/user/` routes.
- Password must be **at least 10 characters** on registration and admin password reset.

---

## Enums

```text
Role:           ADMIN, USER
ApprovalStatus: PENDING_ADMIN_APPROVAL, APPROVED, REJECTED
OrderStatus:    PENDING_ADMIN_APPROVAL, PENDING_SELLER_APPROVAL, APPROVED, REJECTED, CANCELLED
PaymentStatus:  SUCCESS, FAILED
TicketStatus:   OPEN, CLOSED
CarCondition:   EXCELLENT, GOOD, FAIR, POOR
FuelType:       PETROL, DIESEL, ELECTRIC, HYBRID, CNG, LPG
TransmissionType: MANUAL, AUTOMATIC, CVT, AMT
```

---

## Validation Rules

```text
Path/query IDs : positive integer
password       : minimum 10 characters
name           : Title Case words, e.g. "Rahul Sharma"
phoneNumber    : Indian 10-digit mobile starting with 6–9
role           : ADMIN or USER (case-insensitive)
car year       : 1900–2100
car price      : > 0.00
car mileage    : ≥ 0
car numberOfOwners : ≥ 1
car engineCc   : ≥ 50 (if provided)
car description: ≤ 2000 characters
review rating  : 1–5
review comment : ≤ 1000 characters
```

---

## Common Models

### AppUser

```json
{
  "id": 1,
  "username": "rahul1",
  "name": "Rahul Sharma",
  "phoneNumber": "9876543210",
  "email": "rahul@example.com",
  "role": "USER"
}
```

> `passwordHash` and session fields are never returned.

---

### Car

```json
{
  "id": 1,
  "make": "Honda",
  "model": "City",
  "year": 2021,
  "price": 850000,
  "mileage": 25000,
  "color": "White",
  "available": true,
  "approvalStatus": "APPROVED",
  "viewCount": 4,
  "seller": { "id": 2, "username": "seller1", "name": "Vikram Singh", "role": "USER" },
  "condition": "GOOD",
  "fuelType": "PETROL",
  "transmission": "MANUAL",
  "bodyType": "SEDAN",
  "numberOfOwners": 1,
  "engineCc": 1497,
  "insured": true,
  "pucValid": true,
  "description": "Single owner, full service history",
  "createdAt": "2026-06-01T10:00:00"
}
```

---

### Payment

```json
{
  "id": "8ce5f5c8-0c82-4c8b-b606-62ebcfeb0972",
  "status": "SUCCESS",
  "amount": 850000,
  "method": "UPI",
  "gatewayName": "SIMULATED_GATEWAY",
  "gatewayTransactionId": "txn_0b2e43c2-bb07-4db4-b6b1-6930fb581e61",
  "failureReason": null,
  "paidAt": "2026-06-06T21:00:00"
}
```

---

### PurchaseOrder

```json
{
  "id": 1,
  "buyer":   { "id": 3, "username": "buyer1",  "name": "Amit Kumar",   "role": "USER" },
  "seller":  { "id": 2, "username": "seller1", "name": "Vikram Singh", "role": "USER" },
  "car":     { "id": 1, "make": "Honda", "model": "City", "..." : "..." },
  "payment": { "id": "...", "status": "SUCCESS", "amount": 850000, "method": "UPI" },
  "status": "PENDING_ADMIN_APPROVAL",
  "fraudAlert": false,
  "createdAt": "2026-06-06T21:00:00"
}
```

---

### ReceiptResponse

```json
{
  "orderId": 1,
  "receiptNumber": "RCP-1-2026-06-06",
  "buyerName": "Amit Kumar",
  "buyerUsername": "buyer1",
  "buyerEmail": "buyer@example.com",
  "buyerPhone": "9876501234",
  "sellerName": "Vikram Singh",
  "sellerUsername": "seller1",
  "sellerEmail": "seller@example.com",
  "carId": 1,
  "carMake": "Honda",
  "carModel": "City",
  "carYear": 2021,
  "carColor": "White",
  "carMileage": 25000,
  "paymentId": "8ce5f5c8-...",
  "amount": 850000,
  "paymentMethod": "UPI",
  "gatewayTransactionId": "txn_...",
  "paymentStatus": "SUCCESS",
  "orderStatus": "APPROVED",
  "orderDate": "2026-06-06T21:00:00",
  "generatedAt": "2026-06-10T09:45:00"
}
```

---

### SupportTicket

```json
{
  "id": 1,
  "buyer": { "id": 3, "username": "buyer1", "name": "Amit Kumar", "role": "USER" },
  "subject": "Payment issue",
  "description": "Money deducted but order not created",
  "status": "OPEN",
  "createdAt": "2026-06-06T21:00:00",
  "responses": [
    {
      "id": 1,
      "sender": { "id": 1, "username": "admin", "name": "Admin User", "role": "ADMIN" },
      "message": "We are checking this.",
      "respondedAt": "2026-06-06T21:05:00"
    }
  ]
}
```

---

### SellerReview

```json
{
  "id": 1,
  "reviewer": { "id": 3, "username": "buyer1", "name": "Amit Kumar", "role": "USER" },
  "seller":   { "id": 2, "username": "seller1", "name": "Vikram Singh", "role": "USER" },
  "rating": 4,
  "comment": "Smooth transaction, car in great condition",
  "createdAt": "2026-06-07T10:00:00"
}
```

---

### DashboardGraphResponse

```json
{
  "ordersPerDay": [
    { "date": "2026-05-12", "count": 2 },
    { "date": "2026-05-13", "count": 0 }
  ],
  "revenuePerDay": [
    { "date": "2026-05-12", "revenue": 1700000 },
    { "date": "2026-05-13", "revenue": 0 }
  ],
  "carsListedPerDay": [
    { "date": "2026-05-12", "count": 3 }
  ],
  "orderStatusBreakdown": [
    { "status": "PENDING_ADMIN_APPROVAL", "count": 4 },
    { "status": "PENDING_SELLER_APPROVAL", "count": 2 },
    { "status": "APPROVED", "count": 8 },
    { "status": "REJECTED", "count": 1 },
    { "status": "CANCELLED", "count": 0 }
  ],
  "carApprovalBreakdown": [
    { "status": "PENDING_ADMIN_APPROVAL", "count": 4 },
    { "status": "APPROVED", "count": 20 },
    { "status": "REJECTED", "count": 2 }
  ]
}
```

> All daily series are pre-filled for the last 30 days — days with no activity return `count: 0` / `revenue: 0`, so the frontend always receives a complete 30-point series.

---

## Authentication

### Register

```http
POST /api/auth/register
```

Access: public

Input:

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

> `password` must be **at least 10 characters**.  
> `email` is optional.  
> Only one ADMIN may be registered; subsequent ADMIN registrations return `409`.

Output:

```json
{ "message": "Registration successful. Please login to start a session." }
```

---

### Login

```http
POST /api/auth/login
```

Access: public

Input:

```json
{ "username": "rahul1", "password": "rahulsecure1" }
```

Output:

```json
{
  "message": "Login successful",
  "sessionToken": "<token>",
  "role": "USER"
}
```

> Store `sessionToken` and send it as `X-Session-Token` on every protected request.  
> Sessions expire after 120 minutes by default (configurable via `SESSION_EXPIRATION_MINUTES`).

---

### Logout

```http
POST /api/auth/logout
```

Access: logged-in user

Input: no body

Output:

```json
{ "message": "Logout successful" }
```

---

## Cars

### Add Car Listing

```http
POST /api/cars
```

Access: `USER`

Input (all condition fields are optional — defaults shown):

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

> `available` field in the body is ignored for non-admin users — new listings are always created as `available: false` pending admin approval.

Output:

```json
{
  "message": "Your car listing has been submitted successfully and is pending admin approval.",
  "car": { "...": "full Car object with approvalStatus: PENDING_ADMIN_APPROVAL" }
}
```

---

### Update Car Listing

```http
PUT /api/cars/{carId}
```

Access: owning `USER` or `ADMIN`

Input: same shape as Add Car (all condition fields optional)

Output: `Car`

> Non-admin edits reset the listing to `PENDING_ADMIN_APPROVAL` and `available: false`.  
> Admin edits may set `available` directly.

---

### Delete Car

```http
DELETE /api/cars/{carId}
```

Access: owning `USER` or `ADMIN`

Output:

```json
{ "message": "Car deleted successfully" }
```

---

### Browse Approved Available Cars

```http
GET /api/cars/available
```

Access: logged-in user

Output: array of `Car`

> `USER` sessions exclude the caller's own listings.  
> `ADMIN` sessions see all approved available cars.

---

### View Car Details

```http
GET /api/cars/{carId}
```

Access: logged-in user

Output: `Car`

> Each call increments `viewCount` and records a `RecentView` entry for the session.  
> Unapproved cars are visible only to the listing owner or ADMIN.

---

### Recent Views (Current Session)

```http
GET /api/cars/recent
```

Access: logged-in user

Output: last 10 `RecentView` entries for the current session, newest first

```json
[
  {
    "id": 5,
    "user": { "id": 3, "username": "buyer1" },
    "car": { "id": 1, "make": "Honda", "model": "City" },
    "viewedAt": "2026-06-06T21:00:00"
  }
]
```

---

### Compare Two Cars

```http
GET /api/cars/compare?firstCarId=1&secondCarId=2
```

Access: logged-in user

Output: array of two `Car` objects (all fields including condition fields)

> The response includes all condition fields (`condition`, `fuelType`, `transmission`, `bodyType`, `numberOfOwners`, `engineCc`, `insured`, `pucValid`, `description`) to support a full side-by-side comparison table.

---

### Popular Cars

```http
GET /api/cars/popular
```

Access: logged-in user

Output: top 5 `Car` objects ordered by `viewCount` descending

---

## Admin — Car Moderation

### Pending Car Listings

```http
GET /api/admin/cars/pending
```

Access: `ADMIN`

Output: array of `Car` where `approvalStatus` is `PENDING_ADMIN_APPROVAL`

---

### Approve Car Listing

```http
POST /api/admin/cars/{carId}/approve
```

Access: `ADMIN`

Output: `Car` with `available: true`, `approvalStatus: "APPROVED"`

---

### Reject Car Listing

```http
POST /api/admin/cars/{carId}/reject
```

Access: `ADMIN`

Output: `Car` with `available: false`, `approvalStatus: "REJECTED"`

---

## Admin — Orders

### All Orders

```http
GET /api/admin/orders
```

Access: `ADMIN`

Output: array of `PurchaseOrder`, or `{ "message": "No orders found" }` if empty

---

### Pending Orders (Admin Approval Queue)

```http
GET /api/admin/orders/pending
```

Access: `ADMIN`

Output: array of `PurchaseOrder` where `status` is `PENDING_ADMIN_APPROVAL`

---

### Admin Approve Order

```http
POST /api/admin/orders/{orderId}/approve
```

Access: `ADMIN`

Output: `PurchaseOrder` with `status: "PENDING_SELLER_APPROVAL"`

---

### Admin Reject Order

```http
POST /api/admin/orders/{orderId}/reject
```

Access: `ADMIN`

Output: `PurchaseOrder` with `status: "REJECTED"`

---

### Download Receipt (Admin)

```http
GET /api/admin/orders/{orderId}/receipt
```

Access: `ADMIN`

Output: `ReceiptResponse`

> Admin can pull a receipt for any order regardless of status.

---

## Admin — Dashboard

### Summary Stats

```http
GET /api/admin/dashboard
```

Access: `ADMIN`

Output:

```json
{
  "totalUsers": 20,
  "admins": 1,
  "users": 19,
  "totalCars": 30,
  "availableCars": 22,
  "soldCars": 8,
  "pendingCarApprovals": 4,
  "rejectedCars": 1,
  "totalOrders": 15,
  "pendingAdminOrders": 4,
  "pendingOrders": 2,
  "approvedOrders": 8,
  "rejectedOrders": 2,
  "cancelledOrders": 1,
  "fraudAlerts": 0,
  "openTickets": 3,
  "closedTickets": 5,
  "totalRevenue": 6500000
}
```

---

### Graph / Chart Data

```http
GET /api/admin/dashboard/graph
```

Access: `ADMIN`

Output: `DashboardGraphResponse` — see model above

> Contains 5 datasets for the frontend to render:
> - Line/bar: orders per day (last 30 days)
> - Line/bar: revenue per day (last 30 days, APPROVED orders only)
> - Line/bar: cars listed per day (last 30 days)
> - Pie/donut: order status breakdown (all-time)
> - Pie/donut: car approval status breakdown (all-time)

---

## Admin — User Management

### List All Users

```http
GET /api/admin/users
```

Access: `ADMIN`

Output: array of `AppUser`

---

### Get User By ID

```http
GET /api/admin/users/{userId}
```

Access: `ADMIN`

Output: `AppUser`

---

### Edit User Details

```http
PATCH /api/admin/users/{userId}
```

Access: `ADMIN`

Input (all fields optional — send only what needs changing):

```json
{
  "name": "Rahul Kumar",
  "phoneNumber": "9876543211",
  "email": "newemail@example.com",
  "newPassword": "newpassword1"
}
```

> `newPassword` must be at least 10 characters if provided.  
> Changing `phoneNumber` or `email` returns `409` if the value is already taken by another user.  
> If `newPassword` is set, the target user's active session is invalidated — they must log in again.

Output: updated `AppUser`

---

## Purchase & Sales

### Purchase Car

```http
POST /api/user/cars/{carId}/purchase
POST /api/buyer/cars/{carId}/purchase   (alias)
```

Access: `USER`

Input — modern token mode:

```json
{ "paymentMethod": "UPI", "paymentToken": "pay_demo_token" }
```

Input — legacy boolean mode:

```json
{ "paymentMethod": "UPI", "paymentSuccessful": true }
```

Test payment failure:

```json
{ "paymentMethod": "UPI", "paymentToken": "fail_anything" }
```

> `paymentToken` starting with `"fail"` (case-insensitive) always fails.

Success output: `PurchaseOrder` with `status: "PENDING_ADMIN_APPROVAL"`

Failure output:

```json
{ "message": "Payment failed. Purchase flow cancelled. Payment ID: <paymentId>" }
```

> Constraints: car must be approved + available; buyer cannot be the car's seller.  
> On success the car is immediately marked unavailable to prevent duplicate purchases.  
> Orders where the buyer has > 3 total purchases are auto-flagged with `fraudAlert: true`.

---

### My Orders

```http
GET /api/orders/my
```

Access: logged-in user

Output: array of `PurchaseOrder`

> `USER` receives all orders where they are the buyer **or** the seller.  
> `ADMIN` receives all orders.

---

### Get Order Receipt

```http
GET /api/orders/{orderId}/receipt
```

Access: buyer of the order, seller of the order, or `ADMIN`

Output: `ReceiptResponse`

> Returns `403` if the caller is not the buyer, seller, or an admin.

---

### Pending Sales (Seller Queue)

```http
GET /api/user/sales/pending
GET /api/seller/orders/pending   (alias)
```

Access: `USER`

Output: array of `PurchaseOrder` where `status` is `PENDING_SELLER_APPROVAL` and the caller is the seller

---

### Seller Approve Sale

```http
POST /api/user/sales/{orderId}/approve
POST /api/seller/orders/{orderId}/approve   (alias)
```

Access: selling `USER`

Output: `PurchaseOrder` with `status: "APPROVED"`

> Confirms the sale and marks the car permanently unavailable.

---

### Seller Reject Sale

```http
POST /api/user/sales/{orderId}/reject
POST /api/seller/orders/{orderId}/reject   (alias)
```

Access: selling `USER`

Output: `PurchaseOrder` with `status: "REJECTED"`

---

## Dashboards

### User / Seller Dashboard

```http
GET /api/user/dashboard
GET /api/seller/dashboard   (alias)
```

Access: `USER`

Output:

```json
{
  "totalListings": 10,
  "availableListings": 7,
  "soldListings": 3,
  "pendingListings": 2,
  "rejectedListings": 1,
  "pendingAdminOrders": 1,
  "pendingApprovals": 2,
  "approvedOrders": 3,
  "rejectedOrders": 1,
  "fraudAlerts": 0,
  "totalRevenue": 2500000
}
```

---

## Wishlist

Base routes (both work):

```
/api/user/wishlist
/api/buyer/wishlist   (alias)
```

### Add To Wishlist

```http
POST /api/user/wishlist/{carId}
```

Access: `USER`

Input: no body

Output: `WishlistItem`

```json
{ "id": 1, "buyer": { "..." }, "car": { "..." } }
```

> Only approved, available cars can be added. Duplicate adds are idempotent — returns existing item.

---

### View Wishlist

```http
GET /api/user/wishlist
```

Access: `USER`

Output: array of `WishlistItem`

---

### Remove From Wishlist

```http
DELETE /api/user/wishlist/{carId}
```

Access: `USER`

Output:

```json
{ "message": "Wishlist item removed" }
```

---

## Feedback

### Submit Feedback

```http
POST /api/feedback
```

Access: logged-in user

Input:

```json
{ "message": "Great platform, smooth experience" }
```

Output:

```json
{ "message": "Feedback submitted successfully" }
```

---

### Admin View All Feedback

```http
GET /api/feedback/admin
```

Access: `ADMIN`

Output: array of `Feedback`, or `{ "message": "No feedback found" }` if empty

```json
[
  {
    "id": 1,
    "user": { "id": 3, "username": "buyer1" },
    "message": "Great platform",
    "createdAt": "2026-06-06T21:00:00"
  }
]
```

---

## Support Tickets

### Create Ticket

```http
POST /api/user/support-tickets
POST /api/buyer/support-tickets   (alias)
```

Access: `USER`

Input:

```json
{ "subject": "Payment issue", "description": "Money deducted but order not created" }
```

Output: `SupportTicket`

---

### My Tickets

```http
GET /api/user/support-tickets
GET /api/buyer/support-tickets   (alias)
```

Access: `USER`

Output: array of `SupportTicket` belonging to the caller

---

### Admin — All Tickets

```http
GET /api/admin/support-tickets
```

Access: `ADMIN`

Output: array of all `SupportTicket`, or `{ "message": "No support tickets found" }` if empty

---

### Admin — Update Ticket

```http
PATCH /api/admin/support-tickets/{ticketId}
```

Access: `ADMIN`

Input (both fields optional):

```json
{ "status": "CLOSED", "response": "Issue has been resolved." }
```

Output: updated `SupportTicket`

---

### Add Message To Ticket

```http
POST /api/user/support-tickets/{ticketId}/messages
POST /api/buyer/support-tickets/{ticketId}/messages   (alias)
```

Access: ticket owner (`USER`) or `ADMIN`

Input:

```json
{ "message": "Any update on this?" }
```

Output: `SupportTicket` with updated `responses` list

---

## Seller Reviews

> Reviews let buyers rate sellers after a completed (APPROVED) purchase.

### Submit or Update Review

```http
POST /api/reviews/sellers/{sellerId}
```

Access: `USER` who has at least one `APPROVED` purchase from the target seller

Input:

```json
{ "rating": 4, "comment": "Smooth transaction, car in great condition" }
```

> `rating` is required (1–5). `comment` is optional (max 1000 chars).  
> If the caller has already reviewed this seller, the existing review is updated (upsert).  
> A user cannot review themselves.

Output: `SellerReview`

---

### Get Reviews For Seller

```http
GET /api/reviews/sellers/{sellerId}
```

Access: logged-in user

Output: array of `SellerReview`

---

### Get Average Rating For Seller

```http
GET /api/reviews/sellers/{sellerId}/average
```

Access: logged-in user

Output:

```json
{ "sellerId": 2, "averageRating": 4.3 }
```

> Returns `0.0` if the seller has no reviews yet.

---

## Frontend Flow Summary

```
1.  Register admin account (role: ADMIN) — only one allowed.
2.  Register user accounts (role: USER) for buyers and sellers.
3.  Login → receive sessionToken → store it.
4.  Send X-Session-Token header on all protected requests.

── Car listing lifecycle ──────────────────────────────────────────
5.  USER posts car via POST /api/cars  (gets PENDING_ADMIN_APPROVAL response).
6.  ADMIN views pending via GET /api/admin/cars/pending.
7.  ADMIN approves via POST /api/admin/cars/{id}/approve  → car goes live.
8.  Other USERs browse via GET /api/cars/available.
9.  USERs compare via GET /api/cars/compare?firstCarId=&secondCarId=
    (response includes all condition fields for side-by-side table).

── Purchase lifecycle ─────────────────────────────────────────────
10. Buyer posts purchase via POST /api/user/cars/{id}/purchase.
11. ADMIN reviews via GET /api/admin/orders/pending.
12. ADMIN approves via POST /api/admin/orders/{id}/approve.
13. Seller reviews via GET /api/user/sales/pending.
14. Seller approves via POST /api/user/sales/{id}/approve → order APPROVED.
15. Buyer/Seller download receipt via GET /api/orders/{id}/receipt.
    ADMIN can download any receipt via GET /api/admin/orders/{id}/receipt.

── Support ────────────────────────────────────────────────────────
16. USER creates ticket via POST /api/user/support-tickets.
17. USER and ADMIN exchange messages via POST /api/user/support-tickets/{id}/messages.
18. ADMIN closes ticket via PATCH /api/admin/support-tickets/{id}.

── Reviews ────────────────────────────────────────────────────────
19. After purchase APPROVED, buyer reviews seller via POST /api/reviews/sellers/{sellerId}.
20. Anyone can view seller reviews via GET /api/reviews/sellers/{sellerId}.

── Admin tools ────────────────────────────────────────────────────
21. Admin views platform stats via GET /api/admin/dashboard.
22. Admin loads chart data via GET /api/admin/dashboard/graph.
23. Admin edits user details via PATCH /api/admin/users/{userId}.
```
