# Project Structure

```
SPEINGBOOT-BACKEND/
├── src/
│   ├── main/
│   │   ├── java/com/example/usedcars/
│   │   │   │
│   │   │   ├── config/                          # Cross-cutting configuration
│   │   │   │   ├── CorsConfig.java              # CORS policy
│   │   │   │   ├── LoggingAspect.java           # AOP request/response logging
│   │   │   │   └── OpenApiConfig.java           # Swagger / OpenAPI setup
│   │   │   │
│   │   │   ├── controller/                      # REST layer
│   │   │   │   ├── AdminController.java
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── CarController.java
│   │   │   │   ├── FeedbackController.java
│   │   │   │   ├── PurchaseController.java
│   │   │   │   ├── SupportTicketController.java
│   │   │   │   └── WishlistController.java
│   │   │   │
│   │   │   ├── dto/                             # Request / Response DTOs
│   │   │   │   ├── AdminDashboardResponse.java
│   │   │   │   ├── ApiMessage.java
│   │   │   │   ├── CarRequest.java
│   │   │   │   ├── FeedbackRequest.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── LoginResponse.java
│   │   │   │   ├── PurchaseRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   ├── SellerDashboardResponse.java
│   │   │   │   ├── TicketMessageRequest.java
│   │   │   │   ├── TicketRequest.java
│   │   │   │   └── TicketUpdateRequest.java
│   │   │   │
│   │   │   ├── exception/                       # Error handling
│   │   │   │   ├── ApiException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   │
│   │   │   ├── model/                           # JPA entities & enums
│   │   │   │   ├── AppUser.java
│   │   │   │   ├── Car.java
│   │   │   │   ├── Feedback.java
│   │   │   │   ├── Payment.java
│   │   │   │   ├── PurchaseOrder.java
│   │   │   │   ├── RecentView.java
│   │   │   │   ├── SupportTicket.java
│   │   │   │   ├── TicketResponse.java
│   │   │   │   ├── WishlistItem.java
│   │   │   │   ├── ApprovalStatus.java          # enum
│   │   │   │   ├── OrderStatus.java             # enum
│   │   │   │   ├── PaymentStatus.java           # enum
│   │   │   │   ├── Role.java                    # enum
│   │   │   │   └── TicketStatus.java            # enum
│   │   │   │
│   │   │   ├── repository/                      # Spring Data JPA interfaces
│   │   │   │   ├── CarRepository.java
│   │   │   │   ├── FeedbackRepository.java
│   │   │   │   ├── PaymentRepository.java
│   │   │   │   ├── PurchaseOrderRepository.java
│   │   │   │   ├── RecentViewRepository.java
│   │   │   │   ├── SupportTicketRepository.java
│   │   │   │   ├── UserRepository.java
│   │   │   │   └── WishlistRepository.java
│   │   │   │
│   │   │   ├── service/                         # Service interfaces & utilities
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── CarService.java
│   │   │   │   ├── DashboardService.java
│   │   │   │   ├── FeedbackService.java
│   │   │   │   ├── NotificationService.java
│   │   │   │   ├── PaymentGateway.java          # interface
│   │   │   │   ├── PaymentGatewayRequest.java
│   │   │   │   ├── PaymentGatewayResult.java
│   │   │   │   ├── PurchaseService.java
│   │   │   │   ├── SessionService.java
│   │   │   │   ├── SessionTokenService.java
│   │   │   │   ├── SimulatedPaymentGateway.java # stub implementation
│   │   │   │   ├── SupportTicketService.java
│   │   │   │   ├── WishlistService.java
│   │   │   │   │
│   │   │   │   └── impl/                        # Service implementations
│   │   │   │       ├── AuthServiceImpl.java
│   │   │   │       ├── CarServiceImpl.java
│   │   │   │       ├── DashboardServiceImpl.java
│   │   │   │       ├── FeedbackServiceImpl.java
│   │   │   │       ├── PurchaseServiceImpl.java
│   │   │   │       ├── SessionServiceImpl.java
│   │   │   │       ├── SupportTicketServiceImpl.java
│   │   │   │       └── WishlistServiceImpl.java
│   │   │   │
│   │   │   └── UsedCarManagementApplication.java   # Spring Boot entry point
│   │   │
│   │   └── resources/
│   │       ├── application.properties           # App configuration
│   │       └── data-derby.sql                   # DB snapshot / seed data
│   │
│   └── test/
│       └── java/                                # (empty)
│
├── pom.xml                                      # Maven build descriptor
├── .gitignore
├── .env.example                                 # Environment variable template
├── .env.current                                 # Active env overrides (git-ignored)
├── .env.intellij                                # IntelliJ env config (git-ignored)
├── .env.eclipse                                 # Eclipse env config (git-ignored)
├── export-db.ps1                                # Derby DB export script
├── API_SCHEMA.md                                # API endpoint reference
├── DIAGRAMS.md                                  # Architecture / flow diagrams
├── STRUCTURE.md                                 # This file
├── IDE_ENV_SETUP.md                             # IDE environment setup guide
└── README.md                                    # Project overview
```

## Package Responsibilities

| Package | Role |
|---|---|
| `config` | CORS, AOP logging, OpenAPI/Swagger configuration |
| `controller` | HTTP endpoints — maps requests to service calls |
| `dto` | Data Transfer Objects for API input/output |
| `exception` | Custom exception class and global `@ControllerAdvice` handler |
| `model` | JPA entities persisted to Derby, plus enums |
| `repository` | Spring Data interfaces for DB access |
| `service` | Business logic interfaces |
| `service/impl` | Concrete implementations of service interfaces |
| `resources` | `application.properties` and DB seed SQL |
