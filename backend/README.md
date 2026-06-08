# Used Car Buy and Sell Management System - Backend

Spring Boot monolithic backend for managing used car listings, buyer purchases, seller approvals, payments, feedback, and support tickets.

The system supports three roles:

- `ADMIN`
- `SELLER`
- `BUYER`

Authentication uses a custom database-backed session token. After login, protected API calls must send the token in the `X-Session-Token` request header.

## Tech Stack

- Java 17
- Spring Boot 3.3.5
- Spring Web
- Spring Data JPA
- Spring AOP
- Spring Mail
- Hibernate ORM
- MySQL
- Maven
- Bean Validation
- BCrypt password hashing using `spring-security-crypto`
- Swagger UI / OpenAPI using `springdoc-openapi`

## Main Packages

```text
com.example.usedcars
|-- config        # CORS and Swagger/OpenAPI configuration
|-- controller    # REST API controllers
|-- dto           # Request/response DTOs
|-- exception     # Custom API exception and global exception handler
|-- model         # JPA entities and enums
|-- repository    # Spring Data JPA repositories
`-- service       # Business logic and role/session validation
```

## Backend Modules

- User Management
- Authentication and Session Management
- Role-Based Access Control
- Car Listing Management
- Browse, Details, Recent Views, and Popular Cars
- Buyer Purchase Flow
- Payment Record Management
- Simulated Payment Gateway Integration
- Email Notification System
- AOP Logging
- Seller Approval / Rejection Flow
- Wishlist Management
- Order Tracking
- Seller Dashboard
- Admin Order Monitoring
- Admin Dashboard
- Car Comparison
- Feedback Management
- Support Ticket Management

## Database Configuration

Database settings are in:

```text
src/main/resources/application.properties
```

Current datasource format:

```properties
spring.datasource.url=jdbc:mysql://HOST:PORT/DATABASE?sslMode=REQUIRED
spring.datasource.username=USERNAME
spring.datasource.password=PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
```

For local MySQL, use something like:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/used_car_management?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root
```

## Email Notifications

Email sending is disabled by default. To enable it, configure SMTP settings through environment variables:

```properties
NOTIFICATION_EMAIL_ENABLED=true
NOTIFICATION_EMAIL_FROM=no-reply@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your_username
SMTP_PASSWORD=your_password
SMTP_AUTH=true
SMTP_STARTTLS=true
```

Notifications are sent when a user registers and when a buyer successfully creates a purchase order. Registration notifies the new user and admins with emails. Purchase notifies the seller and admins with emails.

## API Documentation

After running the backend, open Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON:

```text
http://localhost:8080/v3/api-docs
```

## Authentication Flow

1. Register a user.
2. Login with username and password.
3. Copy the returned `sessionToken`.
4. Send the token as:

```text
X-Session-Token: your-session-token
```

Registration does not create a session. Login creates one active session token for the user. Logging in again replaces the previous token.

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register user with username, password, and role |
| `POST` | `/api/auth/login` | Public | Login and receive session token |
| `POST` | `/api/auth/logout` | Logged-in user | Clear current active session |

### Car Management

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/cars` | Admin, Seller | Add a car listing |
| `PUT` | `/api/cars/{carId}` | Admin, owning Seller | Update car listing |
| `DELETE` | `/api/cars/{carId}` | Admin, owning Seller | Delete car listing |
| `GET` | `/api/cars/available` | Logged-in user | Browse available cars |
| `GET` | `/api/cars/{carId}` | Logged-in user | View car details and increment view count |
| `GET` | `/api/cars/recent` | Logged-in user | View recently viewed cars for current session |
| `GET` | `/api/cars/compare?firstCarId={id}&secondCarId={id}` | Logged-in user | Compare two cars |
| `GET` | `/api/cars/popular` | Logged-in user | View top 5 cars by view count |

### Buyer Purchase and Payments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/buyer/cars/{carId}/purchase` | Buyer | Make payment and create purchase order if payment succeeds |

Payment success creates an order with status:

```text
PENDING_SELLER_APPROVAL
```

Failed payment cancels the purchase flow. A fraud alert flag is set when buyer purchase count is greater than 3.
Payments are processed through a simulated gateway service. Send a `paymentToken` for the gateway flow; tokens starting with `fail` simulate a declined payment. The older `paymentSuccessful` flag is still accepted for compatibility.

### Seller Approval

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/seller/orders/pending` | Seller | View pending purchase requests for seller cars |
| `GET` | `/api/seller/dashboard` | Seller | View listing, order, revenue, and fraud summary |
| `POST` | `/api/seller/orders/{orderId}/approve` | Owning Seller | Approve order and mark car unavailable |
| `POST` | `/api/seller/orders/{orderId}/reject` | Owning Seller | Reject order and cancel request |

### Wishlist

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/buyer/wishlist/{carId}` | Buyer | Add car to wishlist |
| `GET` | `/api/buyer/wishlist` | Buyer | View buyer wishlist |
| `DELETE` | `/api/buyer/wishlist/{carId}` | Buyer | Remove car from wishlist |

### Orders

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/orders/my` | Logged-in user | View relevant orders for current user |
| `GET` | `/api/admin/orders` | Admin | View all orders |
| `GET` | `/api/admin/dashboard` | Admin | View platform-wide users, cars, orders, revenue, fraud, and ticket summary |

### Feedback

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/feedback` | Logged-in user | Submit feedback |
| `GET` | `/api/feedback/admin` | Admin | View all feedback |

### Support Tickets

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/buyer/support-tickets` | Buyer | Create support ticket |
| `GET` | `/api/buyer/support-tickets` | Buyer | View buyer support tickets |
| `GET` | `/api/admin/support-tickets` | Admin | View all support tickets |
| `PATCH` | `/api/admin/support-tickets/{ticketId}` | Admin | Update ticket status and add admin response |

## Sample Request Bodies

### Register

```json
{
  "username": "seller1",
  "email": "seller1@example.com",
  "password": "seller123",
  "role": "seller"
}
```

Allowed roles:

```text
admin, seller, buyer
```

### Login

```json
{
  "username": "seller1",
  "password": "seller123"
}
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
  "available": true
}
```

### Purchase Car

```json
{
  "paymentMethod": "UPI",
  "paymentToken": "pay_demo_token"
}
```

### Support Ticket

```json
{
  "subject": "Payment issue",
  "description": "Payment completed but order is not visible."
}
```

### Admin Ticket Update

```json
{
  "status": "CLOSED",
  "response": "Issue checked and resolved."
}
```

## Role Rules

### Buyer

- Browse cars
- View details
- Compare cars
- View popular cars
- Purchase cars
- Manage wishlist
- View own orders
- Submit feedback
- Raise support tickets

### Seller

- Add cars
- Update own cars
- Delete own cars
- View pending purchase requests for own cars
- Approve or reject purchase requests

### Admin

- Manage any car
- View all orders
- View all feedback
- View and manage support tickets
- Cannot purchase cars

## Run with Maven

From the project root:

```bash
mvn clean install
mvn spring-boot:run
```

The backend starts on:

```text
http://localhost:8080
```

## Run on Eclipse

1. Open Eclipse.
2. Go to `File` -> `Import`.
3. Select `Maven` -> `Existing Maven Projects`.
4. Choose the project root folder.
5. Click `Finish`.
6. Wait for Maven dependencies to download.
7. Open:

```text
src/main/java/com/example/usedcars/UsedCarManagementApplication.java
```

8. Right-click the file.
9. Select `Run As` -> `Spring Boot App`.

If `Spring Boot App` is not visible, use:

```text
Run As -> Java Application
```

Make sure MySQL settings in `application.properties` are correct before running.

## Run on IntelliJ IDEA

1. Open IntelliJ IDEA.
2. Click `Open`.
3. Select the project root folder.
4. Let IntelliJ import the Maven project.
5. Wait for dependencies to download.
6. Open:

```text
src/main/java/com/example/usedcars/UsedCarManagementApplication.java
```

7. Click the green run button beside the `main` method.

Alternative:

1. Open the Maven tool window.
2. Run:

```text
spring-boot:run
```

## Build for Deployment

Create a production JAR:

```bash
mvn clean package
```

The generated JAR will be inside:

```text
target/
```

Example:

```text
target/used-car-management-0.0.1-SNAPSHOT.jar
```

Run the packaged backend:

```bash
java -jar target/used-car-management-0.0.1-SNAPSHOT.jar
```

## Deployment Configuration

For deployment, prefer environment-specific database credentials instead of hardcoding them.

Example command:

```bash
java -jar target/used-car-management-0.0.1-SNAPSHOT.jar \
  --spring.datasource.url=jdbc:mysql://HOST:PORT/DB_NAME?sslMode=REQUIRED \
  --spring.datasource.username=DB_USERNAME \
  --spring.datasource.password=DB_PASSWORD
```

On Windows PowerShell:

```powershell
java -jar target/used-car-management-0.0.1-SNAPSHOT.jar `
  --spring.datasource.url="jdbc:mysql://HOST:PORT/DB_NAME?sslMode=REQUIRED" `
  --spring.datasource.username="DB_USERNAME" `
  --spring.datasource.password="DB_PASSWORD"
```

## Useful Commands

Compile:

```bash
mvn compile
```

Run tests:

```bash
mvn test
```

Package:

```bash
mvn clean package
```

Run:

```bash
mvn spring-boot:run
```

## Notes

- `spring.jpa.hibernate.ddl-auto=update` automatically updates schema during development.
- Use `validate` or database migrations for production environments.
- Swagger UI is enabled for API testing.
- Protected endpoints require `X-Session-Token`.
- Passwords are stored as BCrypt hashes.
- The application follows monolithic architecture with controller, service, repository, and model layers.
