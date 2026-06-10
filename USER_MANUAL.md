# TrustLot - Used Car Marketplace User Manual

**Version 1.0**  
**Date: June 2026**

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Getting Started](#getting-started)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Buyer's Guide](#buyers-guide)
6. [Seller's Guide](#sellers-guide)
7. [Admin Guide](#admin-guide)
8. [Common Features](#common-features)
9. [Support & Feedback](#support--feedback)
10. [API Reference & Error Handling](#api-reference--error-handling)

---

## 1. Introduction

Welcome to **TrustLot**, a comprehensive full-stack used car buying and selling marketplace. This manual provides complete guidance for all users—buyers, sellers, and administrators—covering registration, navigation, feature usage, and troubleshooting.

### Key Features:
- **Secure Authentication** with session-based access control
- **Multi-role Support** for buyers, sellers, and administrators
- **Complete Purchase Lifecycle** with admin and seller approval flows
- **Wishlist Management** to save favorite cars
- **Seller Ratings** for buyer confidence
- **Support Ticket System** for issue resolution
- **Admin Dashboard** with real-time analytics

---

## 2. System Overview

### Architecture

TrustLot is built on a modern full-stack architecture:

- **Backend:** Spring Boot 3.3.5, Java 17
- **Database:** Apache Derby (file-based) or MySQL (configurable)
- **Authentication:** Custom session tokens (120-minute expiry)
- **API:** RESTful endpoints with JSON request/response
- **Base URL:** `http://localhost:8080` (development)

### Core Concepts

| Concept | Description |
|---------|-------------|
| **User** | Can act as both buyer and seller simultaneously |
| **Admin** | System administrator (only one allowed) |
| **Car Listing** | Requires admin approval before public visibility |
| **Purchase Order** | Two-step approval: Admin → Seller |
| **Session Token** | Authentication key for protected endpoints |

---

## 3. Getting Started

### 3.1 Registration

**Endpoint:** `POST /api/auth/register`

#### Step 1: Fill Registration Form

```json
{
  "username": "rahul1",
  "name": "Rahul Sharma",
  "phoneNumber": "9876543210",
  "email": "rahul@example.com",
  "password": "rahulsecure1234",
  "role": "USER"
}
```

#### Validation Rules:

- **Username:** Must be unique
- **Name:** Title case (e.g., "John Doe")
- **Phone:** Indian 10-digit number starting with 6-9
- **Email:** Optional but recommended (must be unique if provided)
- **Password:** Minimum 10 characters (alphanumeric + special chars recommended)
- **Role:** Either `USER` or `ADMIN`

#### Important Notes:

- First registered ADMIN becomes the system administrator
- Only one ADMIN account allowed; subsequent ADMIN registrations are rejected
- Users can both buy and sell using a single `USER` account

#### Success Response:

```json
{
  "message": "Registration successful. Please login to start a session."
}
```

---

### 3.2 Login

**Endpoint:** `POST /api/auth/login`

#### Step 1: Enter Credentials

```json
{
  "username": "rahul1",
  "password": "rahulsecure1234"
}
```

#### Success Response:

```json
{
  "message": "Login successful",
  "sessionToken": "abc123def456ghi789jkl",
  "role": "USER"
}
```

#### Step 2: Store Session Token

- Save the `sessionToken` in your application
- Include it as `X-Session-Token` header on all protected requests
- Sessions expire after 120 minutes of inactivity

#### Example Protected Request:

```http
GET /api/cars/available
X-Session-Token: abc123def456ghi789jkl
```

### 3.3 Logout

**Endpoint:** `POST /api/auth/logout`

```json
{
  "message": "Logout successful"
}
```

---

## 4. User Roles & Permissions

### 4.1 User (USER) Role

**Dual Capability Model:** A single USER account functions as both buyer and seller.

#### Permissions:

| Action | Allowed |
|--------|---------|
| List cars for sale | ✅ Yes |
| Browse other cars | ✅ Yes |
| Purchase cars | ✅ Yes |
| Review sellers | ✅ Yes |
| Create support tickets | ✅ Yes |
| Add to wishlist | ✅ Yes |
| Access seller dashboard | ✅ Yes |

#### Restrictions:

- Cannot purchase own listed cars
- Cannot list cars without admin approval
- Cannot modify other users' listings

### 4.2 Admin (ADMIN) Role

**System Administrator:** Controls moderation, approvals, and platform analytics.

#### Permissions:

| Action | Allowed |
|--------|---------|
| Approve/reject car listings | ✅ Yes |
| Approve/reject purchase orders | ✅ Yes |
| Manage users (edit details) | ✅ Yes |
| View all orders and cars | ✅ Yes |
| Access analytics dashboard | ✅ Yes |
| View and respond to support tickets | ✅ Yes |
| View all user feedback | ✅ Yes |

#### System Limitations:

- Only one ADMIN per system
- Cannot transfer ADMIN role
- Cannot delete records (soft delete only via rejection)

---

## 5. Buyer's Guide

### 5.1 Browsing Cars

**Endpoint:** `GET /api/cars/available`

#### View Available Listings

Buyers see all approved and available cars (excluding their own listings).

Each car listing includes:

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
  "condition": "GOOD",
  "fuelType": "PETROL",
  "transmission": "MANUAL",
  "bodyType": "SEDAN",
  "numberOfOwners": 1,
  "engineCc": 1497,
  "insured": true,
  "pucValid": true,
  "viewCount": 4,
  "seller": {
    "id": 2,
    "username": "seller1",
    "name": "Vikram Singh"
  },
  "createdAt": "2026-06-01T10:00:00"
}
```

### 5.2 Car Details & Comparison

**View Details:** `GET /api/cars/{carId}`

- Each view increments the car's popularity counter
- Recorded in your "Recent Views" for future reference

**Compare Cars:** `GET /api/cars/compare?firstCarId=1&secondCarId=2`

- Returns detailed specs for side-by-side comparison
- Includes all condition fields (fuel type, transmission, etc.)
- Helpful for making purchase decisions

**Popular Cars:** `GET /api/cars/popular`

- Top 5 most viewed cars in the system
- Updated in real-time based on view counts

### 5.3 Making a Purchase

**Endpoint:** `POST /api/user/cars/{carId}/purchase`

#### Step 1: Initiate Purchase

```json
{
  "paymentMethod": "UPI",
  "paymentToken": "pay_demo_token"
}
```

**Payment Methods Supported:**
- UPI
- Credit Card
- Debit Card
- Net Banking
- Wallet

#### Step 2: Payment Processing

- Simulated payment gateway processes your transaction
- Use `paymentToken: "fail_anything"` to test payment failures
- Successful payment creates order in `PENDING_ADMIN_APPROVAL` state

#### Success Response:

```json
{
  "id": 1,
  "buyer": {
    "id": 3,
    "username": "buyer1",
    "name": "Amit Kumar"
  },
  "car": {
    "id": 1,
    "make": "Honda",
    "model": "City"
  },
  "payment": {
    "status": "SUCCESS",
    "amount": 850000,
    "method": "UPI"
  },
  "status": "PENDING_ADMIN_APPROVAL",
  "fraudAlert": false,
  "createdAt": "2026-06-06T21:00:00"
}
```

#### Failure Response:

```json
{
  "message": "Payment failed. Purchase flow cancelled. Payment ID: <paymentId>"
}
```

### 5.4 Purchase Workflow

The purchase follows a **two-step approval process**:

```
Step 1: Buyer Purchases
  ↓
Step 2: Admin Reviews & Approves (PENDING_ADMIN_APPROVAL)
  ↓
Step 3: Seller Reviews & Approves (PENDING_SELLER_APPROVAL)
  ↓
Step 4: Purchase Complete (APPROVED)
```

### 5.5 My Orders

**Endpoint:** `GET /api/orders/my`

View all orders where you are the buyer or seller:

```json
[
  {
    "id": 1,
    "buyer": { "id": 3, "username": "buyer1" },
    "seller": { "id": 2, "username": "seller1" },
    "car": { "id": 1, "make": "Honda", "model": "City" },
    "status": "APPROVED",
    "createdAt": "2026-06-06T21:00:00"
  }
]
```

### 5.6 Download Receipt

**Endpoint:** `GET /api/orders/{orderId}/receipt`

Detailed receipt includes:

```json
{
  "orderId": 1,
  "receiptNumber": "RCP-1-2026-06-06",
  "buyerName": "Amit Kumar",
  "buyerEmail": "buyer@example.com",
  "sellerName": "Vikram Singh",
  "carMake": "Honda",
  "carModel": "City",
  "amount": 850000,
  "paymentStatus": "SUCCESS",
  "orderStatus": "APPROVED",
  "generatedAt": "2026-06-10T09:45:00"
}
```

---

## 6. Seller's Guide

### 6.1 List Your Car

**Endpoint:** `POST /api/cars`

#### Complete Listing Form:

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
  "description": "Single owner, full service history, accident-free"
}
```

#### Condition Options:

- `EXCELLENT` - Like new condition
- `GOOD` - Well maintained
- `FAIR` - Some wear and tear
- `POOR` - Significant damage/repairs needed

#### Fuel Types:

- `PETROL`, `DIESEL`, `ELECTRIC`, `HYBRID`, `CNG`, `LPG`

#### Transmission Types:

- `MANUAL`, `AUTOMATIC`, `CVT`, `AMT`

#### Listing Status:

- New listings start as `PENDING_ADMIN_APPROVAL`
- Not visible to buyers until approved
- Cannot be edited until approval

### 6.2 Manage Listings

**Endpoint:** `PUT /api/cars/{carId}`

Update listing details:

```json
{
  "price": 825000,
  "mileage": 26000,
  "description": "Updated service records available"
}
```

**Note:** Non-admin edits reset approval status to `PENDING_ADMIN_APPROVAL`

**Delete Listing:** `DELETE /api/cars/{carId}`

### 6.3 Seller Dashboard

**Endpoint:** `GET /api/user/dashboard`

View your business metrics:

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

### 6.4 Pending Sales Approval

**Endpoint:** `GET /api/user/sales/pending`

View orders awaiting your approval:

```json
[
  {
    "id": 5,
    "buyer": { "id": 3, "username": "buyer1" },
    "car": { "id": 1, "make": "Honda", "model": "City" },
    "payment": { "status": "SUCCESS", "amount": 850000 },
    "status": "PENDING_SELLER_APPROVAL"
  }
]
```

### 6.5 Approve/Reject Sales

**Approve Sale:** `POST /api/user/sales/{orderId}/approve`

```json
{
  "message": "Sale approved",
  "status": "APPROVED"
}
```

- Car becomes permanently unavailable
- Purchase is finalized
- Buyer can download receipt

**Reject Sale:** `POST /api/user/sales/{orderId}/reject`

```json
{
  "message": "Sale rejected",
  "status": "REJECTED"
}
```

- Car returns to available status
- Buyer is notified

---

## 7. Admin Guide

### 7.1 Admin Dashboard

**Endpoint:** `GET /api/admin/dashboard`

High-level platform statistics:

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
  "fraudAlerts": 0,
  "openTickets": 3,
  "closedTickets": 5,
  "totalRevenue": 6500000
}
```

### 7.2 Analytics & Charts

**Endpoint:** `GET /api/admin/dashboard/graph`

5 datasets for platform analytics (last 30 days):

```json
{
  "ordersPerDay": [
    { "date": "2026-05-12", "count": 2 }
  ],
  "revenuePerDay": [
    { "date": "2026-05-12", "revenue": 1700000 }
  ],
  "carsListedPerDay": [
    { "date": "2026-05-12", "count": 3 }
  ],
  "orderStatusBreakdown": [
    { "status": "PENDING_ADMIN_APPROVAL", "count": 4 },
    { "status": "APPROVED", "count": 8 }
  ],
  "carApprovalBreakdown": [
    { "status": "PENDING_ADMIN_APPROVAL", "count": 4 },
    { "status": "APPROVED", "count": 20 }
  ]
}
```

### 7.3 Car Moderation

**Pending Listings:** `GET /api/admin/cars/pending`

**Approve Car:** `POST /api/admin/cars/{carId}/approve`

```json
{
  "approvalStatus": "APPROVED",
  "available": true
}
```

**Reject Car:** `POST /api/admin/cars/{carId}/reject`

```json
{
  "approvalStatus": "REJECTED",
  "available": false
}
```

### 7.4 Order Management

**All Orders:** `GET /api/admin/orders`

**Pending Orders:** `GET /api/admin/orders/pending`

**Approve Order:** `POST /api/admin/orders/{orderId}/approve`

Moves to seller approval stage

**Reject Order:** `POST /api/admin/orders/{orderId}/reject`

Cancels purchase

### 7.5 User Management

**List Users:** `GET /api/admin/users`

**Get User:** `GET /api/admin/users/{userId}`

**Edit User:** `PATCH /api/admin/users/{userId}`

```json
{
  "name": "Rahul Kumar",
  "phoneNumber": "9876543211",
  "email": "newemail@example.com",
  "newPassword": "newpassure123456"
}
```

---

## 8. Common Features

### 8.1 Wishlist

**Add to Wishlist:** `POST /api/user/wishlist/{carId}`

- Only approved, available cars allowed
- Duplicate additions are idempotent

**View Wishlist:** `GET /api/user/wishlist`

```json
[
  {
    "id": 1,
    "car": { "id": 1, "make": "Honda", "model": "City" }
  }
]
```

**Remove from Wishlist:** `DELETE /api/user/wishlist/{carId}`

### 8.2 Seller Reviews

**Submit Review:** `POST /api/reviews/sellers/{sellerId}`

```json
{
  "rating": 4,
  "comment": "Smooth transaction, car in great condition"
}
```

- Rating: 1-5 (required)
- Comment: Optional (max 1000 characters)
- Only eligible after APPROVED purchase
- Updates existing review (upsert)

**View Reviews:** `GET /api/reviews/sellers/{sellerId}`

**Average Rating:** `GET /api/reviews/sellers/{sellerId}/average`

```json
{
  "sellerId": 2,
  "averageRating": 4.3
}
```

### 8.3 Recent Views

**Endpoint:** `GET /api/cars/recent`

Last 10 cars you viewed in current session:

```json
[
  {
    "id": 5,
    "car": { "id": 1, "make": "Honda", "model": "City" },
    "viewedAt": "2026-06-06T21:00:00"
  }
]
```

---

## 9. Support & Feedback

### 9.1 Support Tickets

**Create Ticket:** `POST /api/user/support-tickets`

```json
{
  "subject": "Payment issue",
  "description": "Money deducted but order not created"
}
```

**My Tickets:** `GET /api/user/support-tickets`

**Add Message:** `POST /api/user/support-tickets/{ticketId}/messages`

```json
{
  "message": "Any update on this?"
}
```

**Admin View Tickets:** `GET /api/admin/support-tickets`

**Admin Update Ticket:** `PATCH /api/admin/support-tickets/{ticketId}`

```json
{
  "status": "CLOSED",
  "response": "Issue has been resolved."
}
```

### 9.2 Feedback

**Submit Feedback:** `POST /api/feedback`

```json
{
  "message": "Great platform, smooth experience"
}
```

**Admin View Feedback:** `GET /api/feedback/admin`

---

## 10. API Reference & Error Handling

### 10.1 HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | Success | Car retrieved |
| `201` | Created | Order created |
| `400` | Bad Request | Invalid input |
| `401` | Unauthorized | Missing session token |
| `403` | Forbidden | Not authorized for action |
| `404` | Not Found | Car ID doesn't exist |
| `409` | Conflict | Duplicate username |
| `500` | Server Error | Database error |

### 10.2 Error Response Format

All errors return:

```json
{
  "message": "Error description"
}
```

### 10.3 Common Validation Errors

| Scenario | Error | Fix |
|----------|-------|-----|
| Short password | "password must be at least 10 characters" | Use 10+ chars |
| Invalid phone | "phoneNumber must be 10 digits starting with 6-9" | Use valid Indian number |
| Duplicate username | "username already exists" | Choose unique name |
| Non-unique email | "email already in use" | Use different email |
| Buying own car | "Cannot purchase your own listing" | Purchase from other seller |
| Unapproved car | "Car is not approved" | Wait for admin approval |
| Invalid rating | "rating must be between 1 and 5" | Use 1-5 scale |

### 10.4 Authentication Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Missing X-Session-Token | No auth header | Add token to request |
| Invalid session token | Wrong/expired token | Login again |
| Session expired | Token older than 120 min | Login to get new token |
| Insufficient permissions | Role doesn't allow action | Use correct account type |

### 10.5 Business Rule Violations

| Rule | Error | Details |
|------|-------|---------|
| Car availability | "Car is not available" | Already sold |
| Admin uniqueness | "Only one admin allowed" | Admin exists |
| Seller reviews | "Not eligible to review" | No approved purchases |
| Fraud detection | "fraudAlert: true" | >3 total purchases |

---

## Quick Reference

### Account Credentials (Demo)

```
Admin Account:
  Username: demoadmin
  Password: Demo@1234x

User Account:
  Username: demouser
  Password: Demo@1234
```

### Key Endpoints Summary

| Feature | Method | Endpoint |
|---------|--------|----------|
| Register | POST | /api/auth/register |
| Login | POST | /api/auth/login |
| Browse Cars | GET | /api/cars/available |
| List Car | POST | /api/cars |
| Purchase | POST | /api/user/cars/{id}/purchase |
| Approve Order | POST | /api/admin/orders/{id}/approve |
| Approve Sale | POST | /api/user/sales/{id}/approve |
| My Orders | GET | /api/orders/my |
| Admin Dashboard | GET | /api/admin/dashboard |
| Support Ticket | POST | /api/user/support-tickets |

---

**Document Version:** 1.0  
**Last Updated:** June 10, 2026  
**Contact:** support@trustlot.com

For additional support, please create a support ticket through the application.
