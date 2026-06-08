RentalSphere - Vehicle Rental Management System
     

Enterprise-Level Vehicle Rental Management Platform

📌 Project Overview
RentalSphere is a Full-Stack Vehicle Rental Management System designed to simulate a real-world vehicle rental business workflow.

The platform enables users to:

Register and verify accounts using Email OTP
Browse and book vehicles
Track booking status
Return rented vehicles
View generated bills
Request payments
Raise support tickets
Receive notifications
Administrators can:

Manage vehicles
Validate returns
Generate bills
Approve or reject payments
Resolve support tickets
Broadcast notifications
Monitor audit logs
The backend follows enterprise-level architecture and security standards using Spring Boot, Spring Security, JWT Authentication, Role-Based Authorization, Global Exception Handling, and Audit Logging.

🏗️ System Architecture
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
✨ Key Features
👤 User Features
Authentication
User Registration
Email OTP Verification
Secure Login
Forgot Password OTP
JWT Authentication
BCrypt Password Encryption
Profile Management
View Profile
Update Password
Update Mobile Number
Update Address
Update Driving License
Vehicle Services
View Vehicles
Search Vehicles
Filter Vehicles
Check Vehicle Availability
View Availability Calendar
Booking Services
Create Booking
View Booking History
View Booking Details
Cancel Booking
Track Booking Status
Return Services
Return Vehicle
View Return Status
Billing Services
View Bill
View Invoice
Download Final Invoice
Payment Services
Request Payment
Track Payment Status
View Transaction Details
Notifications
Booking Notifications
Billing Notifications
Payment Notifications
Support Ticket Notifications
Support
Create Support Ticket
Track Ticket Status
View Admin Responses
👨‍💼 Admin Features
Vehicle Management
Add Vehicle
Update Vehicle
Delete Vehicle
Manage Vehicle Availability
Booking Management
Monitor Bookings
Manage Booking Lifecycle
Return Validation
Validate Vehicle Returns
Review Return Requests
Calculate Late Charges
Billing Management
Generate Bills
Apply Taxes
Add Damage Charges
Generate Final Invoice
Payment Management
Approve Payments
Reject Payments
Generate Transaction IDs
Notification Management
Send User Notifications
Broadcast Notifications
System Announcements
Support Management
View Tickets
Update Ticket Status
Resolve Tickets
Respond To Users
Audit Monitoring
Track User Activities
Track Admin Activities
Monitor System Events
🔔 Notification System
RentalSphere includes a complete notification management module.

User Notifications
Booking Created
Booking Cancelled
Vehicle Returned
Bill Generated
Payment Approved
Payment Rejected
Ticket Updates
Admin Notifications
New Booking
Payment Request
Vehicle Return Request
Support Ticket Created
Broadcast Notifications
Maintenance Updates
Promotional Messages
Service Announcements
System Alerts
🎫 Support Ticket System
User Side
Create Tickets
Select Ticket Category
Track Status
Receive Responses
Admin Side
View Tickets
Update Status
Resolve Issues
Communicate With Users
Supported Categories
Booking
Payment
Vehicle
Complaint
Feedback
Other
📧 Email Notification System
Authentication Emails
Registration OTP
Email Verification
Forgot Password OTP
Booking Emails
Booking Confirmation
Booking Cancellation
Billing Emails
Bill Generated
Invoice Ready
Payment Emails
Payment Approved
Payment Rejected
Support Emails
Ticket Created
Ticket Updated
🧱 Technology Stack
Technology	Purpose
Java 17	Core Programming
Spring Boot	Backend Framework
Spring MVC	REST API Development
Spring Security	Authentication & Authorization
JWT	Token Authentication
BCrypt	Password Encryption
Spring Data JPA	ORM
MySQL	Database
Angular	Frontend
Maven	Dependency Management
Lombok	Boilerplate Reduction
Spring Mail	Email Notifications
Jakarta Validation	Input Validation
Swagger/OpenAPI	API Documentation
Postman	API Testing
🔐 Security Features
RentalSphere uses enterprise-grade security mechanisms.

Security Modules
JWT Authentication
Stateless Sessions
Spring Security Filter Chain
BCrypt Password Encryption
Email OTP Verification
Forgot Password OTP Flow
Role-Based Authorization
Method-Level Security
Access Denied Handling
Authentication Entry Point