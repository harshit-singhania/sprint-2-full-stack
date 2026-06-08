# 🚀 RentalSphere - Vehicle Rental Management System

<p align="center">
  <img src="https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=java" />
  <img src="https://img.shields.io/badge/SpringBoot-3.x-green?style=for-the-badge&logo=springboot" />
  <img src="https://img.shields.io/badge/Spring-Security-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/JWT-Authentication-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/MySQL-Database-blue?style=for-the-badge&logo=mysql" />
  <img src="https://img.shields.io/badge/Angular-Frontend-DD0031?style=for-the-badge&logo=angular" />
</p>

<p align="center">
  <b>Enterprise-Level Vehicle Rental Management Platform</b>
</p>

---

## 📌 Project Overview

RentalSphere is a Full-Stack Vehicle Rental Management System designed to simulate a real-world vehicle rental business workflow.

The platform enables users to:

- Register and verify accounts using Email OTP
- Browse and book vehicles
- Track booking status
- Return rented vehicles
- View generated bills
- Request payments
- Raise support tickets
- Receive notifications

Administrators can:

- Manage vehicles
- Validate returns
- Generate bills
- Approve or reject payments
- Resolve support tickets
- Broadcast notifications
- Monitor audit logs

The backend follows enterprise-level architecture and security standards using Spring Boot, Spring Security, JWT Authentication, Role-Based Authorization, Global Exception Handling, and Audit Logging.

---

# 🏗️ System Architecture

```text
Angular Frontend
        │
        ▼
 Spring Boot REST APIs
        │
        ▼
 Controller Layer
        │
        ▼
   Service Layer
        │
        ▼
 Repository Layer
        │
        ▼
      MySQL
```

---

# ✨ Key Features

## 👤 User Features

### Authentication
- User Registration
- Email OTP Verification
- Secure Login
- Forgot Password OTP
- JWT Authentication
- BCrypt Password Encryption

### Profile Management
- View Profile
- Update Password
- Update Mobile Number
- Update Address
- Update Driving License

### Vehicle Services
- View Vehicles
- Search Vehicles
- Filter Vehicles
- Check Vehicle Availability
- View Availability Calendar

### Booking Services
- Create Booking
- View Booking History
- View Booking Details
- Cancel Booking
- Track Booking Status

### Return Services
- Return Vehicle
- View Return Status

### Billing Services
- View Bill
- View Invoice
- Download Final Invoice

### Payment Services
- Request Payment
- Track Payment Status
- View Transaction Details

### Notifications
- Booking Notifications
- Billing Notifications
- Payment Notifications
- Support Ticket Notifications

### Support
- Create Support Ticket
- Track Ticket Status
- View Admin Responses

---

## 👨‍💼 Admin Features

### Vehicle Management
- Add Vehicle
- Update Vehicle
- Delete Vehicle
- Manage Vehicle Availability

### Booking Management
- Monitor Bookings
- Manage Booking Lifecycle

### Return Validation
- Validate Vehicle Returns
- Review Return Requests
- Calculate Late Charges

### Billing Management
- Generate Bills
- Apply Taxes
- Add Damage Charges
- Generate Final Invoice

### Payment Management
- Approve Payments
- Reject Payments
- Generate Transaction IDs

### Notification Management
- Send User Notifications
- Broadcast Notifications
- System Announcements

### Support Management
- View Tickets
- Update Ticket Status
- Resolve Tickets
- Respond To Users

### Audit Monitoring
- Track User Activities
- Track Admin Activities
- Monitor System Events

---

# 🔔 Notification System

RentalSphere includes a complete notification management module.

### User Notifications
- Booking Created
- Booking Cancelled
- Vehicle Returned
- Bill Generated
- Payment Approved
- Payment Rejected
- Ticket Updates

### Admin Notifications
- New Booking
- Payment Request
- Vehicle Return Request
- Support Ticket Created

### Broadcast Notifications
- Maintenance Updates
- Promotional Messages
- Service Announcements
- System Alerts

---

# 🎫 Support Ticket System

### User Side
- Create Tickets
- Select Ticket Category
- Track Status
- Receive Responses

### Admin Side
- View Tickets
- Update Status
- Resolve Issues
- Communicate With Users

### Supported Categories
- Booking
- Payment
- Vehicle
- Complaint
- Feedback
- Other

---

# 📧 Email Notification System

### Authentication Emails
- Registration OTP
- Email Verification
- Forgot Password OTP

### Booking Emails
- Booking Confirmation
- Booking Cancellation

### Billing Emails
- Bill Generated
- Invoice Ready

### Payment Emails
- Payment Approved
- Payment Rejected

### Support Emails
- Ticket Created
- Ticket Updated

---

# 🧱 Technology Stack

| Technology | Purpose |
|------------|----------|
| Java 17 | Core Programming |
| Spring Boot | Backend Framework |
| Spring MVC | REST API Development |
| Spring Security | Authentication & Authorization |
| JWT | Token Authentication |
| BCrypt | Password Encryption |
| Spring Data JPA | ORM |
| MySQL | Database |
| Angular | Frontend |
| Maven | Dependency Management |
| Lombok | Boilerplate Reduction |
| Spring Mail | Email Notifications |
| Jakarta Validation | Input Validation |
| Swagger/OpenAPI | API Documentation |
| Postman | API Testing |

---

# 🔐 Security Features

RentalSphere uses enterprise-grade security mechanisms.

### Security Modules

- JWT Authentication
- Stateless Sessions
- Spring Security Filter Chain
- BCrypt Password Encryption
- Email OTP Verification
- Forgot Password OTP Flow
- Role-Based Authorization
- Method-Level Security
- Access Denied Handling
- Authentication Entry Point

### Roles

```text
USER
ADMIN
```

---

# 🔑 Authentication Flow

```text
User Login
    │
    ▼
Credentials Verified
    │
    ▼
JWT Token Generated
    │
    ▼
Stored On Client
    │
    ▼
Authorization Header
    │
    ▼
JwtFilter Validation
    │
    ▼
Spring Security Context
    │
    ▼
Protected APIs Accessible
```

### Authorization Header

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

# 📡 API Access Rules

### Public APIs

```text
/api/v1/auth/**
/api/v1/vehicles/**
```

### Protected User APIs

```text
/api/v1/users/**
/api/v1/bookings/**
/api/v1/payment/**
/api/v1/billing/**
/api/v1/notifications/**
/api/v1/support/**
```

### Admin APIs

```text
/api/v1/admin/**
```

Only ADMIN users can access admin endpoints.

---

# 📂 Project Structure

```text
src/main/java/com/rentalsphere/backend
│
├── common
├── config
├── controller
├── dto
├── exception
├── model
│   └── enums
├── repository
├── service
└── resources
```

---

# 🗄️ Database Modules

### Core Tables

- USERS
- VEHICLES
- BOOKINGS
- BILLS
- PAYMENTS
- NOTIFICATIONS
- SUPPORT_TICKETS
- AUDIT_LOGS

### Entity Relationships

```text
User
 ├── Bookings
 ├── Notifications
 ├── Support Tickets
 └── Audit Logs

Vehicle
 └── Bookings

Booking
 ├── Bill
 └── Payment
```

---

# 🧠 Business Rules

### Vehicle Rules

- Registration Number Must Be Unique
- Vehicle Must Be Active
- Vehicle Must Be Available
- Maintenance Vehicles Cannot Be Booked

### Booking Rules

- User Must Have Valid License
- Start Date Must Be Before End Date
- Duplicate Bookings Prevented
- Overlapping Bookings Blocked

### Billing Rules

```text
Final Amount =
Rental Cost
+ Late Charges
+ Damage Charges
+ GST (18%)
```

### Payment Rules

- Bill Required Before Payment
- Admin Approval Required
- Transaction ID Generated After Approval

---

# 🔄 User Workflow

```text
Register
   │
Verify Email OTP
   │
Login
   │
Browse Vehicles
   │
Create Booking
   │
Return Vehicle
   │
Bill Generated
   │
Request Payment
   │
Admin Approval
   │
Download Invoice
   │
Booking Completed
```

---

# 👨‍💼 Admin Workflow

```text
Admin Login
   │
Manage Vehicles
   │
Monitor Bookings
   │
Validate Returns
   │
Generate Bills
   │
Approve Payments
   │
Resolve Tickets
   │
Broadcast Notifications
   │
Monitor Audit Logs
```

---

# 🧪 Testing

### API Testing Tools

- Postman
- Swagger UI

Swagger URL:

```text
http://localhost:8080/swagger-ui/index.html
```

---

# 🚀 Deployment

## Backend

```bash
git clone https://github.com/ajoymondal077/RentalSphere.git

cd RentalSphere

mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

---

## Frontend

```bash
npm install

ng serve
```

Frontend:

```text
http://localhost:4200
```

---

# 📊 Current Project Status

## Backend

### Authentication
✅ JWT Authentication

✅ Email OTP Verification

✅ Forgot Password OTP

✅ Role-Based Security

### Vehicle Module
✅ CRUD Operations

✅ Vehicle Search

✅ Availability Tracking

### Booking Module
✅ Create Booking

✅ Booking History

✅ Booking Cancellation

### Return Module
✅ Return Validation

### Billing Module
✅ Bill Generation

✅ GST Calculation

### Payment Module
✅ Approval Workflow

### Notification Module
✅ User Notifications

✅ Admin Notifications

### Support Module
✅ Ticket Management

### Audit Logs
✅ Activity Tracking

---

# 🔮 Future Enhancements

- PDF Invoice Generation
- Razorpay Integration
- Stripe Integration
- WebSocket Notifications
- Docker Support
- AWS Deployment
- Mobile Application
- Analytics Dashboard
- Vehicle Image Upload
- Multi-Language Support

---

# 👨‍💻 Contributors

### Team RentalSphere

- Ajoy Mondal
- Bikram Dey
- Aditya Vishal Tiwari
- Rajashri Adhikari
- Sameer Kumar Padhi
- Rupsha Sarkar

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

---

<p align="center">
  Made with ❤️ by Team RentalSphere
</p>