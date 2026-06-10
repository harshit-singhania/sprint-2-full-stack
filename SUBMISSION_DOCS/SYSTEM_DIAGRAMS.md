# TrustLot System Diagrams

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    APP_USER ||--o{ CAR : "lists"
    APP_USER ||--o{ PURCHASE_ORDER : "buys"
    APP_USER ||--o{ PURCHASE_ORDER : "sells"
    APP_USER ||--o{ SUPPORT_TICKET : "creates"
    APP_USER ||--o{ SELLER_REVIEW : "gives"
    APP_USER ||--o{ FEEDBACK : "submits"
    APP_USER ||--o{ WISHLIST_ITEM : "adds"
    APP_USER ||--o{ RECENT_VIEW : "views"
    
    CAR ||--o{ PURCHASE_ORDER : "involves"
    CAR ||--o{ WISHLIST_ITEM : "appears-in"
    CAR ||--o{ RECENT_VIEW : "appears-in"
    
    PURCHASE_ORDER ||--|| PAYMENT : "has"
    PURCHASE_ORDER ||--o{ SUPPORT_TICKET : "relates-to"
    
    SUPPORT_TICKET ||--o{ TICKET_RESPONSE : "contains"
    
    SELLER_REVIEW ||--|| APP_USER : "reviews"

    APP_USER {
        int id PK
        string username UK
        string name
        string phoneNumber UK
        string email UK
        string passwordHash
        string role
        timestamp createdAt
        timestamp updatedAt
    }

    CAR {
        int id PK
        int sellerId FK
        string make
        string model
        int year
        decimal price
        int mileage
        string color
        boolean available
        string approvalStatus
        int viewCount
        string condition
        string fuelType
        string transmission
        string bodyType
        int numberOfOwners
        int engineCc
        boolean insured
        boolean pucValid
        string description
        timestamp createdAt
    }

    PURCHASE_ORDER {
        int id PK
        int buyerId FK
        int sellerId FK
        int carId FK
        int paymentId FK
        string status
        boolean fraudAlert
        timestamp createdAt
    }

    PAYMENT {
        string id PK
        string status
        decimal amount
        string method
        string gatewayName
        string gatewayTransactionId
        string failureReason
        timestamp paidAt
    }

    SUPPORT_TICKET {
        int id PK
        int userId FK
        string subject
        string description
        string status
        timestamp createdAt
        timestamp updatedAt
    }

    TICKET_RESPONSE {
        int id PK
        int ticketId FK
        int senderId FK
        string message
        timestamp respondedAt
    }

    FEEDBACK {
        int id PK
        int userId FK
        string message
        timestamp createdAt
    }

    SELLER_REVIEW {
        int id PK
        int reviewerId FK
        int sellerId FK
        int rating
        string comment
        timestamp createdAt
    }

    WISHLIST_ITEM {
        int id PK
        int buyerId FK
        int carId FK
        timestamp addedAt
    }

    RECENT_VIEW {
        int id PK
        int userId FK
        int carId FK
        timestamp viewedAt
    }
```

---

## 2. Data Flow Diagram (DFD) - Level 0

```mermaid
graph TB
    User["👤 User<br/>(Buyer/Seller)"]
    Admin["👮 Admin<br/>(Moderator)"]
    System["🔷 TrustLot<br/>System"]
    PaymentGW["💳 Payment<br/>Gateway"]
    EmailService["📧 Email<br/>Service"]
    Database["🗄️ Database<br/>(MySQL/Derby)"]

    User -->|Browse, List, Purchase| System
    Admin -->|Approve, Reject, Manage| System
    System -->|Process Payment| PaymentGW
    PaymentGW -->|Payment Status| System
    System -->|Send Notifications| EmailService
    System -->|Read/Write Data| Database
    Database -->|Data| System
    System -->|Car Listings, Orders, Reviews| User
    System -->|Dashboard, Approvals| Admin
    EmailService -->|Emails| User
```

---

## 3. Data Flow Diagram (DFD) - Level 1: User & Car Management

```mermaid
graph LR
    subgraph "1. User Layer"
        Buyer["🛍️ Buyer<br/>Users"]
        Seller["🚗 Seller<br/>Users"]
    end

    subgraph "2. Authentication & Session"
        Auth["🔐 Auth<br/>Service"]
        SessionMgmt["📋 Session<br/>Management"]
    end

    subgraph "3. Car Management"
        CarService["🚗 Car<br/>Service"]
        CarRepo["📦 Car<br/>Repository"]
    end

    subgraph "4. Data Storage"
        Database[(🗄️ Database)]
    end

    Buyer -->|Register/Login| Auth
    Seller -->|Register/Login| Auth
    Auth -->|Create Session| SessionMgmt
    SessionMgmt -->|Token| Buyer
    SessionMgmt -->|Token| Seller
    
    Seller -->|List Car| CarService
    Buyer -->|Browse Cars| CarService
    CarService -->|Query/Store| CarRepo
    CarRepo -->|CRUD Operations| Database
    Database -->|Car Data| CarRepo
    CarRepo -->|Car Info| CarService
    CarService -->|Available Cars| Buyer
```

---

## 4. Data Flow Diagram (DFD) - Level 1: Purchase & Payment

```mermaid
graph LR
    subgraph "1. Purchase Initiation"
        Buyer["🛍️ Buyer"]
    end

    subgraph "2. Purchase Service"
        PurchaseService["💰 Purchase<br/>Service"]
        PaymentService["💳 Payment<br/>Service"]
    end

    subgraph "3. External Services"
        PaymentGW["🏦 Payment<br/>Gateway"]
    end

    subgraph "4. Admin Approval"
        AdminService["👮 Admin<br/>Service"]
        Admin["👮 Admin"]
    end

    subgraph "5. Seller Approval"
        SellerService["✅ Seller<br/>Approval"]
        Seller["🚗 Seller"]
    end

    subgraph "6. Order Management"
        OrderRepo["📦 Order<br/>Repository"]
    end

    subgraph "7. Storage"
        Database[(🗄️ Database)]
    end

    Buyer -->|Initiate Purchase| PurchaseService
    PurchaseService -->|Process Payment| PaymentService
    PaymentService -->|Send Payment| PaymentGW
    PaymentGW -->|Payment Status| PaymentService
    PaymentService -->|Store Order| OrderRepo
    OrderRepo -->|PENDING_ADMIN_APPROVAL| Database
    
    Admin -->|Review Orders| AdminService
    AdminService -->|Query Pending| OrderRepo
    OrderRepo -->|Order Details| AdminService
    AdminService -->|Update Status| OrderRepo
    OrderRepo -->|PENDING_SELLER_APPROVAL| Database
    
    Seller -->|Review Sales| SellerService
    SellerService -->|Get Pending| OrderRepo
    OrderRepo -->|Sale Details| SellerService
    SellerService -->|Approve/Reject| OrderRepo
    OrderRepo -->|Update Status| Database
```

---

## 5. Data Flow Diagram (DFD) - Level 1: Support & Reviews

```mermaid
graph LR
    subgraph "1. User Actions"
        Buyer["👤 Buyer"]
        Seller["🚗 Seller"]
    end

    subgraph "2. Support System"
        TicketService["🎫 Support<br/>Ticket Service"]
        TicketRepo["📦 Ticket<br/>Repository"]
    end

    subgraph "3. Review System"
        ReviewService["⭐ Review<br/>Service"]
        ReviewRepo["📦 Review<br/>Repository"]
    end

    subgraph "4. Admin Response"
        Admin["👮 Admin"]
        AdminService["💬 Admin<br/>Message Service"]
    end

    subgraph "5. Storage"
        Database[(🗄️ Database)]
    end

    subgraph "6. Notifications"
        EmailService["📧 Email<br/>Service"]
    end

    Buyer -->|Create Ticket| TicketService
    Buyer -->|Add Message| TicketService
    TicketService -->|Store/Query| TicketRepo
    TicketRepo -->|Read/Write| Database
    
    Admin -->|View Tickets| AdminService
    AdminService -->|Query Tickets| TicketRepo
    TicketRepo -->|Ticket Data| AdminService
    AdminService -->|Add Response| TicketRepo
    TicketRepo -->|Update| Database
    TicketService -->|Send Email| EmailService
    
    Buyer -->|Submit Review| ReviewService
    Seller -->|View Reviews| ReviewService
    ReviewService -->|Store/Query| ReviewRepo
    ReviewRepo -->|Read/Write| Database
    ReviewService -->|Notify| EmailService
    EmailService -->|Email Notification| Buyer
```

---

## 6. Data Flow Diagram (DFD) - Level 1: Admin Dashboard

```mermaid
graph LR
    subgraph "1. Admin Interface"
        Admin["👮 Admin<br/>User"]
    end

    subgraph "2. Admin Services"
        DashboardService["📊 Dashboard<br/>Service"]
        ApprovalService["✅ Approval<br/>Service"]
        UserService["👥 User<br/>Management"]
    end

    subgraph "3. Data Aggregation"
        Analytics["📈 Analytics<br/>Engine"]
        Stats["📊 Statistics<br/>Calculator"]
    end

    subgraph "4. Data Access"
        CarRepo["🚗 Car<br/>Repository"]
        OrderRepo["📦 Order<br/>Repository"]
        UserRepo["👥 User<br/>Repository"]
    end

    subgraph "5. Storage"
        Database[(🗄️ Database)]
    end

    Admin -->|View Dashboard| DashboardService
    DashboardService -->|Query Stats| Analytics
    Analytics -->|Query Data| CarRepo
    Analytics -->|Query Data| OrderRepo
    Analytics -->|Query Data| UserRepo
    
    CarRepo -->|Car Data| Analytics
    OrderRepo -->|Order Data| Analytics
    UserRepo -->|User Data| Analytics
    
    Analytics -->|Calculate| Stats
    Stats -->|Dashboard Data| DashboardService
    DashboardService -->|Charts & Metrics| Admin
    
    Admin -->|Approve Cars| ApprovalService
    ApprovalService -->|Update Car| CarRepo
    CarRepo -->|Persist| Database
    
    Admin -->|Edit Users| UserService
    UserService -->|Update User| UserRepo
    UserRepo -->|Persist| Database
```

---

## 7. Complete System Data Flow

```mermaid
graph TB
    User["👤 Users<br/>(Buyers/Sellers)"]
    Admin["👮 Admin"]
    
    subgraph "API Layer"
        AuthAPI["🔐 Auth API"]
        CarAPI["🚗 Car API"]
        PurchaseAPI["💰 Purchase API"]
        AdminAPI["👮 Admin API"]
        TicketAPI["🎫 Support API"]
        ReviewAPI["⭐ Review API"]
    end
    
    subgraph "Business Logic Layer"
        AuthService["Auth Service"]
        CarService["Car Service"]
        PurchaseService["Purchase Service"]
        PaymentService["Payment Service"]
        ApprovalService["Approval Service"]
        TicketService["Ticket Service"]
        ReviewService["Review Service"]
    end
    
    subgraph "Data Access Layer"
        UserRepo["User Repo"]
        CarRepo["Car Repo"]
        OrderRepo["Order Repo"]
        PaymentRepo["Payment Repo"]
        TicketRepo["Ticket Repo"]
        ReviewRepo["Review Repo"]
    end
    
    subgraph "External Services"
        PaymentGW["💳 Payment Gateway"]
        EmailService["📧 Email Service"]
    end
    
    subgraph "Database"
        DB[(🗄️ Database<br/>MySQL/Derby)]
    end
    
    User -->|API Calls| AuthAPI
    User -->|API Calls| CarAPI
    User -->|API Calls| PurchaseAPI
    User -->|API Calls| TicketAPI
    User -->|API Calls| ReviewAPI
    
    Admin -->|API Calls| AdminAPI
    Admin -->|API Calls| CarAPI
    
    AuthAPI -->|Authenticate| AuthService
    CarAPI -->|Business Logic| CarService
    PurchaseAPI -->|Business Logic| PurchaseService
    AdminAPI -->|Business Logic| ApprovalService
    TicketAPI -->|Business Logic| TicketService
    ReviewAPI -->|Business Logic| ReviewService
    
    PurchaseService -->|Process Payment| PaymentService
    PaymentService -->|External Call| PaymentGW
    PaymentGW -->|Payment Status| PaymentService
    
    AuthService -->|CRUD| UserRepo
    CarService -->|CRUD| CarRepo
    PurchaseService -->|CRUD| OrderRepo
    PaymentService -->|CRUD| PaymentRepo
    TicketService -->|CRUD| TicketRepo
    ReviewService -->|CRUD| ReviewRepo
    ApprovalService -->|CRUD| CarRepo
    ApprovalService -->|CRUD| OrderRepo
    
    UserRepo -->|Persist| DB
    CarRepo -->|Persist| DB
    OrderRepo -->|Persist| DB
    PaymentRepo -->|Persist| DB
    TicketRepo -->|Persist| DB
    ReviewRepo -->|Persist| DB
    
    TicketService -->|Notifications| EmailService
    PurchaseService -->|Notifications| EmailService
    EmailService -->|Send Emails| User
```

---

## Diagram Descriptions

### ER Diagram
- **Entities:** 10 main entities (AppUser, Car, PurchaseOrder, Payment, etc.)
- **Relationships:** One-to-many (user lists cars), Many-to-one (purchase involves car), One-to-one (order has payment)
- **Keys:** Primary keys (id), Foreign keys (FK), Unique keys (UK) marked
- **Attributes:** All important fields including timestamps and status fields

### DFD Level 0
- **Context Diagram:** Shows system boundary with external actors
- **External Entities:** Users, Admin, Payment Gateway, Email Service
- **System:** Central TrustLot system processing all transactions

### DFD Level 1 - User & Car Management
- **Authentication Flow:** User registration → Auth Service → Session Management
- **Car Management:** Listing cars, browsing cars → Car Service → Database

### DFD Level 1 - Purchase & Payment
- **Purchase Workflow:** Buyer initiates → Payment processing → Admin approval → Seller approval
- **State Transitions:** PENDING_ADMIN_APPROVAL → PENDING_SELLER_APPROVAL → APPROVED

### DFD Level 1 - Support & Reviews
- **Support Workflow:** Create ticket → Admin response → Email notification
- **Review System:** Submit review → Store → Email notification

### DFD Level 1 - Admin Dashboard
- **Data Aggregation:** Queries from multiple repositories
- **Analytics:** Statistics and charts generation
- **Admin Actions:** Approvals and user management

### Complete System DFD
- **Layered Architecture:** API → Business Logic → Data Access → Database
- **All Flows:** Shows complete data flow through entire system
- **External Integration:** Payment Gateway and Email Service integration
