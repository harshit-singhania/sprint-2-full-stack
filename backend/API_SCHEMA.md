# Used Car Management API Schema

Base URL:

```text
http://localhost:8081
```

Protected endpoints require:

```http
X-Session-Token: <sessionToken>
```

Generic error response:

```json
{
  "message": "Error message"
}
```

## Current Architecture

- Roles are `ADMIN` and `USER`.
- Only one `ADMIN` account can be registered.
- A `USER` can list cars for sale and buy cars.
- A `USER` cannot buy their own listed car.
- New or edited car listings require admin approval before becoming available.
- Purchase orders require admin approval first, then seller approval.
- Support tickets support two-way chat between ticket owner and admin.

Backward-compatible routes containing `/buyer` and `/seller` still exist, but frontend should prefer `/user` routes where available.

## Enums

```text
Role: ADMIN, USER
ApprovalStatus: PENDING_ADMIN_APPROVAL, APPROVED, REJECTED
OrderStatus: PENDING_ADMIN_APPROVAL, PENDING_SELLER_APPROVAL, APPROVED, REJECTED, CANCELLED
PaymentStatus: SUCCESS, FAILED
TicketStatus: OPEN, CLOSED
```

## Validation Rules

```text
Path/query IDs: positive number
name: alphabetic words in Title Case, e.g. "Rahul Sharma"
phoneNumber: Indian 10 digit mobile number starting with 6, 7, 8, or 9
role: ADMIN or USER
```

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
  "seller": {
    "id": 2,
    "username": "seller1",
    "name": "Vikram Singh",
    "phoneNumber": "9123456789",
    "email": "seller@example.com",
    "role": "USER"
  }
}
```

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

### PurchaseOrder

```json
{
  "id": 1,
  "buyer": {
    "id": 3,
    "username": "buyer1",
    "name": "Amit Kumar",
    "phoneNumber": "9876501234",
    "email": "buyer@example.com",
    "role": "USER"
  },
  "seller": {
    "id": 2,
    "username": "seller1",
    "name": "Vikram Singh",
    "phoneNumber": "9123456789",
    "email": "seller@example.com",
    "role": "USER"
  },
  "car": {
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
    "seller": {
      "id": 2,
      "username": "seller1",
      "name": "Vikram Singh",
      "phoneNumber": "9123456789",
      "email": "seller@example.com",
      "role": "USER"
    }
  },
  "payment": {
    "id": "8ce5f5c8-0c82-4c8b-b606-62ebcfeb0972",
    "status": "SUCCESS",
    "amount": 850000,
    "method": "UPI",
    "gatewayName": "SIMULATED_GATEWAY",
    "gatewayTransactionId": "txn_0b2e43c2-bb07-4db4-b6b1-6930fb581e61",
    "failureReason": null,
    "paidAt": "2026-06-06T21:00:00"
  },
  "status": "PENDING_ADMIN_APPROVAL",
  "fraudAlert": false,
  "createdAt": "2026-06-06T21:00:00"
}
```

### SupportTicket

```json
{
  "id": 1,
  "buyer": {
    "id": 3,
    "username": "buyer1",
    "name": "Amit Kumar",
    "phoneNumber": "9876501234",
    "email": "buyer@example.com",
    "role": "USER"
  },
  "subject": "Payment issue",
  "description": "Money deducted but order not created",
  "status": "OPEN",
  "createdAt": "2026-06-06T21:00:00",
  "responses": [
    {
      "id": 1,
      "sender": {
        "id": 1,
        "username": "admin",
        "name": "Admin User",
        "phoneNumber": "9000000000",
        "email": "admin@example.com",
        "role": "ADMIN"
      },
      "message": "We are checking this.",
      "respondedAt": "2026-06-06T21:05:00"
    }
  ]
}
```

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
  "password": "rahul123",
  "role": "USER"
}
```

Admin input:

```json
{
  "username": "admin",
  "name": "Admin User",
  "phoneNumber": "9000000000",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "ADMIN"
}
```

Output:

```json
{
  "message": "Registration successful. Please login to start a session."
}
```

### Login

```http
POST /api/auth/login
```

Access: public

Input:

```json
{
  "username": "rahul1",
  "password": "rahul123"
}
```

Output:

```json
{
  "message": "Login successful",
  "sessionToken": "session-token-value",
  "role": "USER"
}
```

### Logout

```http
POST /api/auth/logout
```

Access: logged-in user

Input: no body

Output:

```json
{
  "message": "Logout successful"
}
```

## Cars

### Add Car Listing

```http
POST /api/cars
```

Access: `USER`

Input:

```json
{
  "make": "Honda",
  "model": "City",
  "year": 2021,
  "price": 850000,
  "mileage": 25000,
  "color": "White",
  "available": true
}
```

Output:

```json
{
  "id": 1,
  "make": "Honda",
  "model": "City",
  "year": 2021,
  "price": 850000,
  "mileage": 25000,
  "color": "White",
  "available": false,
  "approvalStatus": "PENDING_ADMIN_APPROVAL",
  "viewCount": 0,
  "seller": {
    "id": 2,
    "username": "seller1",
    "name": "Vikram Singh",
    "phoneNumber": "9123456789",
    "email": "seller@example.com",
    "role": "USER"
  }
}
```

Frontend note: even if `available` is sent as `true`, new user listings are stored as unavailable until admin approval.

### Update Car Listing

```http
PUT /api/cars/{carId}
```

Access: owning `USER` or `ADMIN`

Input:

```json
{
  "make": "Honda",
  "model": "City ZX",
  "year": 2021,
  "price": 825000,
  "mileage": 26000,
  "color": "White",
  "available": true
}
```

Output: `Car`

Frontend note: user edits move the listing back to `PENDING_ADMIN_APPROVAL`.

### Delete Car

```http
DELETE /api/cars/{carId}
```

Access: owning `USER` or `ADMIN`

Output:

```json
{
  "message": "Car deleted successfully"
}
```

### Browse Approved Available Cars

```http
GET /api/cars/available
```

Access: logged-in user

Frontend note: for normal `USER` sessions this list contains only approved, available cars listed by other users, so the current user will not see their own cars as purchase options. `ADMIN` sessions see all approved available cars.

Output:

```json
[
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
    "seller": {
      "id": 2,
      "username": "seller1",
      "name": "Vikram Singh",
      "phoneNumber": "9123456789",
      "email": "seller@example.com",
      "role": "USER"
    }
  }
]
```

### View Car Details

```http
GET /api/cars/{carId}
```

Access: logged-in user

Output: `Car`

Frontend note: unapproved cars are visible only to admin or the listing owner.

### Recent Views

```http
GET /api/cars/recent
```

Access: logged-in user

Output:

```json
[
  {
    "id": 1,
    "user": {
      "id": 3,
      "username": "buyer1",
      "name": "Amit Kumar",
      "phoneNumber": "9876501234",
      "email": "buyer@example.com",
      "role": "USER"
    },
    "car": {},
    "sessionToken": "session-token-value",
    "viewedAt": "2026-06-06T21:00:00"
  }
]
```

### Compare Cars

```http
GET /api/cars/compare?firstCarId=1&secondCarId=2
```

Access: logged-in user

Output:

```json
[
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
    "seller": {}
  },
  {
    "id": 2,
    "make": "Hyundai",
    "model": "Creta",
    "year": 2022,
    "price": 1150000,
    "mileage": 18000,
    "color": "Black",
    "available": true,
    "approvalStatus": "APPROVED",
    "viewCount": 7,
    "seller": {}
  }
]
```

### Popular Cars

```http
GET /api/cars/popular
```

Access: logged-in user

Output: array of `Car`

## Admin Approvals

### Pending Car Listings

```http
GET /api/admin/cars/pending
```

Access: `ADMIN`

Output: array of `Car` where `approvalStatus` is `PENDING_ADMIN_APPROVAL`

### Approve Car Listing

```http
POST /api/admin/cars/{carId}/approve
```

Access: `ADMIN`

Output: `Car` with:

```json
{
  "available": true,
  "approvalStatus": "APPROVED"
}
```

### Reject Car Listing

```http
POST /api/admin/cars/{carId}/reject
```

Access: `ADMIN`

Output: `Car` with:

```json
{
  "available": false,
  "approvalStatus": "REJECTED"
}
```

### Pending Purchase Orders For Admin

```http
GET /api/admin/orders/pending
```

Access: `ADMIN`

Output: array of `PurchaseOrder` where `status` is `PENDING_ADMIN_APPROVAL`

### Admin Approve Purchase Order

```http
POST /api/admin/orders/{orderId}/approve
```

Access: `ADMIN`

Output: `PurchaseOrder` with:

```json
{
  "status": "PENDING_SELLER_APPROVAL"
}
```

### Admin Reject Purchase Order

```http
POST /api/admin/orders/{orderId}/reject
```

Access: `ADMIN`

Output: `PurchaseOrder` with:

```json
{
  "status": "REJECTED"
}
```

## Purchase And Sales

### Purchase Car

Preferred route:

```http
POST /api/user/cars/{carId}/purchase
```

Backward-compatible route:

```http
POST /api/buyer/cars/{carId}/purchase
```

Access: `USER`

Input:

```json
{
  "paymentMethod": "UPI",
  "paymentToken": "pay_demo_token"
}
```

Alternative compatibility input:

```json
{
  "paymentMethod": "UPI",
  "paymentSuccessful": true
}
```

Payment failure test input:

```json
{
  "paymentMethod": "UPI",
  "paymentToken": "fail_demo_token"
}
```

Success output: `PurchaseOrder` with status `PENDING_ADMIN_APPROVAL`

Failure output:

```json
{
  "message": "Payment failed. Purchase flow cancelled. Payment ID: payment-id"
}
```

Frontend note: users cannot purchase their own car listing.

### My Orders

```http
GET /api/orders/my
```

Access: logged-in user

Output:

```json
[
  {
    "id": 1,
    "buyer": {},
    "seller": {},
    "car": {},
    "payment": {},
    "status": "PENDING_ADMIN_APPROVAL",
    "fraudAlert": false,
    "createdAt": "2026-06-06T21:00:00"
  }
]
```

For `USER`, this includes both orders they bought and orders for cars they are selling.

### Pending Sales For User

Preferred route:

```http
GET /api/user/sales/pending
```

Backward-compatible route:

```http
GET /api/seller/orders/pending
```

Access: `USER`

Output: array of `PurchaseOrder` where `status` is `PENDING_SELLER_APPROVAL`

### User Approve Sale

Preferred route:

```http
POST /api/user/sales/{orderId}/approve
```

Backward-compatible route:

```http
POST /api/seller/orders/{orderId}/approve
```

Access: selling `USER`

Output: `PurchaseOrder` with:

```json
{
  "status": "APPROVED"
}
```

Frontend note: approving a sale marks the car unavailable.

### User Reject Sale

Preferred route:

```http
POST /api/user/sales/{orderId}/reject
```

Backward-compatible route:

```http
POST /api/seller/orders/{orderId}/reject
```

Access: selling `USER`

Output: `PurchaseOrder` with:

```json
{
  "status": "REJECTED"
}
```

## Dashboards

### User Dashboard

Preferred route:

```http
GET /api/user/dashboard
```

Backward-compatible route:

```http
GET /api/seller/dashboard
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

### Admin Dashboard

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

### Admin All Orders

```http
GET /api/admin/orders
```

Access: `ADMIN`

Output when orders exist: array of `PurchaseOrder`

Output when empty:

```json
{
  "message": "No orders found"
}
```

## Wishlist

Preferred base route:

```text
/api/user/wishlist
```

Backward-compatible base route:

```text
/api/buyer/wishlist
```

### Add To Wishlist

```http
POST /api/user/wishlist/{carId}
```

Access: `USER`

Input: no body

Output:

```json
{
  "id": 1,
  "buyer": {},
  "car": {}
}
```

Frontend note: only approved available cars can be added.

### View Wishlist

```http
GET /api/user/wishlist
```

Access: `USER`

Output:

```json
[
  {
    "id": 1,
    "buyer": {},
    "car": {}
  }
]
```

### Remove From Wishlist

```http
DELETE /api/user/wishlist/{carId}
```

Access: `USER`

Output:

```json
{
  "message": "Wishlist item removed"
}
```

## Feedback

### Submit Feedback

```http
POST /api/feedback
```

Access: logged-in user

Input:

```json
{
  "message": "Great platform"
}
```

Output:

```json
{
  "message": "Feedback submitted successfully"
}
```

### Admin Feedback List

```http
GET /api/feedback/admin
```

Access: `ADMIN`

Output when feedback exists:

```json
[
  {
    "id": 1,
    "user": {},
    "message": "Great platform",
    "createdAt": "2026-06-06T21:00:00"
  }
]
```

Output when empty:

```json
{
  "message": "No feedback found"
}
```

## Support Tickets

### Create Support Ticket

Preferred route:

```http
POST /api/user/support-tickets
```

Backward-compatible route:

```http
POST /api/buyer/support-tickets
```

Access: `USER`

Input:

```json
{
  "subject": "Payment issue",
  "description": "Money deducted but order not created"
}
```

Output: `SupportTicket`

### My Support Tickets

Preferred route:

```http
GET /api/user/support-tickets
```

Backward-compatible route:

```http
GET /api/buyer/support-tickets
```

Access: `USER`

Output: array of `SupportTicket`

### Admin Support Tickets

```http
GET /api/admin/support-tickets
```

Access: `ADMIN`

Output when tickets exist: array of `SupportTicket`

Output when empty:

```json
{
  "message": "No support tickets found"
}
```

### Admin Update Ticket Status Or Reply

```http
PATCH /api/admin/support-tickets/{ticketId}
```

Access: `ADMIN`

Input:

```json
{
  "status": "CLOSED",
  "response": "Issue resolved"
}
```

Output: `SupportTicket`

Frontend note: `status` and `response` are both optional, but at least one should be sent for a useful update.

### Add Ticket Chat Message

```http
POST /api/support-tickets/{ticketId}/messages
```

Access: ticket owner `USER` or `ADMIN`

Input:

```json
{
  "message": "Can you share an update?"
}
```

Output: `SupportTicket` with updated `responses`

## Frontend Flow Summary

1. Register first admin with role `ADMIN`.
2. Register all normal accounts with role `USER`.
3. Login and store `sessionToken`.
4. Send `X-Session-Token` on protected endpoints.
5. User creates car listing with `/api/cars`.
6. Admin approves listing with `/api/admin/cars/{carId}/approve`.
7. Other users browse approved cars with `/api/cars/available`.
8. User purchases with `/api/user/cars/{carId}/purchase`.
9. Admin approves purchase with `/api/admin/orders/{orderId}/approve`.
10. Selling user approves sale with `/api/user/sales/{orderId}/approve`.
11. Ticket owner/admin chat through `/api/support-tickets/{ticketId}/messages`.
