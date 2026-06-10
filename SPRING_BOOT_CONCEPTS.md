# Spring Boot Concepts Used in TrustLot Project
## Beginner → Intermediate → Advanced

**Version:** 1.0  
**Project:** TrustLot Used Car Marketplace  
**Framework:** Spring Boot 3.3.5, Java 17

---

## Table of Contents

### **BASIC CONCEPTS** (Foundation)
1. [Spring Boot Application Setup](#basic-1)
2. [Dependency Injection (DI)](#basic-2)
3. [Beans and Component Annotations](#basic-3)
4. [REST Controllers](#basic-4)
5. [Request Mapping & HTTP Methods](#basic-5)
6. [Path Variables & Query Parameters](#basic-6)
7. [Request Body & Response Entity](#basic-7)

### **INTERMEDIATE CONCEPTS** (Core Development)
8. [Spring Data JPA](#int-1)
9. [Repositories & CRUD Operations](#int-2)
10. [JPA Entities & Annotations](#int-3)
11. [Service Layer Pattern](#int-4)
12. [DTOs (Data Transfer Objects)](#int-5)
13. [Exception Handling](#int-6)
14. [Global Exception Handler](#int-7)
15. [Spring Security Basics](#int-8)
16. [Interceptors](#int-9)
17. [Configuration Classes](#int-10)

### **ADVANCED CONCEPTS** (Production-Ready)
18. [Transactional Management](#adv-1)
19. [Custom JPA Queries](#adv-2)
20. [Eager & Lazy Loading](#adv-3)
21. [Cascade Operations](#adv-4)
22. [Hibernate DDL Auto](#adv-5)
23. [AOP & Logging](#adv-6)
24. [Custom Annotations](#adv-7)
25. [Connection Pooling](#adv-8)
26. [Scheduled Tasks](#adv-9)
27. [OpenAPI/Swagger](#adv-10)

---

# BASIC CONCEPTS

## <a name="basic-1"></a>1. Spring Boot Application Setup

### **What It Is**
Spring Boot starter that automatically configures your entire application with sensible defaults.

### **How TrustLot Uses It**
```java
@SpringBootApplication
public class UsedCarManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(UsedCarManagementApplication.class, args);
    }
}
```

### **What It Does**
- Scans packages for Spring components
- Auto-configures Spring and third-party libraries
- Starts embedded Tomcat server on port 8080
- Loads application properties

### **Configuration in TrustLot**
```properties
# application.properties
spring.application.name=used-car-management
spring.jpa.hibernate.ddl-auto=update
spring.datasource.url=jdbc:derby:usedcarsdb;create=true
```

### **Why It Matters**
Without Spring Boot, you'd need 100+ lines of XML configuration. With Spring Boot, you get everything with just one annotation.

---

## <a name="basic-2"></a>2. Dependency Injection (DI)

### **What It Is**
Instead of creating objects yourself, Spring creates them and injects them into your classes.

### **Problem It Solves**
**Without DI (Bad):**
```java
public class CarService {
    private CarRepository carRepository = new CarRepository(); // Tightly coupled
}
```

**With DI (Good):**
```java
public class CarService {
    @Autowired
    private CarRepository carRepository; // Spring injects it
}
```

### **How TrustLot Uses It**
```java
@Service
public class PurchaseService {
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private CarService carService;
    
    // PurchaseService depends on PaymentService and CarService
    // Spring automatically creates and injects them
}
```

### **Benefits in TrustLot**
- Easy to test (mock dependencies)
- Loose coupling (change implementations without changing code)
- Cleaner code
- Central management by Spring

---

## <a name="basic-3"></a>3. Beans and Component Annotations

### **What It Is**
Beans are objects managed by Spring. Annotations tell Spring which classes to manage.

### **Main Annotations**

| Annotation | Used For | Example in TrustLot |
|---|---|---|
| `@Component` | Generic Spring bean | Generic utilities |
| `@Service` | Business logic layer | `AuthService`, `CarService`, `PurchaseService` |
| `@Controller` | Web request handlers | `AuthController` |
| `@Repository` | Data access layer | `CarRepository`, `UserRepository` |
| `@RestController` | REST API endpoint | `CarController`, `AdminController` |

### **How TrustLot Uses It**
```java
// Services
@Service
public class AuthService { ... }

@Service
public class CarService { ... }

// Controllers
@RestController
@RequestMapping("/api")
public class CarController { ... }

// Repositories
@Repository
public interface CarRepository extends JpaRepository<Car, Integer> { ... }
```

### **What Spring Does**
1. Finds these annotated classes
2. Creates instances (beans)
3. Stores them in Spring Container
4. Injects them where needed

---

## <a name="basic-4"></a>4. REST Controllers

### **What It Is**
Classes that handle HTTP requests and return responses.

### **How TrustLot Uses It**
```java
@RestController
@RequestMapping("/api/cars")
public class CarController {
    @Autowired
    private CarService carService;
    
    @GetMapping("/{id}")
    public ResponseEntity<Car> getCarDetails(@PathVariable int id) {
        Car car = carService.getCarDetails(id);
        return ResponseEntity.ok(car);
    }
}
```

### **What Happens**
```
HTTP GET /api/cars/1
    ↓
CarController.getCarDetails(1)
    ↓
carService.getCarDetails(1)
    ↓
Returns Car object as JSON
    ↓
HTTP 200 OK with car data
```

---

## <a name="basic-5"></a>5. Request Mapping & HTTP Methods

### **What It Is**
Annotations that map HTTP requests to controller methods.

### **HTTP Methods Used in TrustLot**

```java
@PostMapping // CREATE
public ResponseEntity<?> addCar(@RequestBody CarRequest request) { }

@GetMapping // READ
public ResponseEntity<Car> getCarDetails(@PathVariable int id) { }

@PutMapping // UPDATE ENTIRE RESOURCE
public ResponseEntity<Car> updateCar(@PathVariable int id, @RequestBody CarRequest request) { }

@PatchMapping // UPDATE PARTIAL
public ResponseEntity<AppUser> editUser(@PathVariable int userId, @RequestBody UserEditRequest request) { }

@DeleteMapping // DELETE
public ResponseEntity<?> deleteCar(@PathVariable int id) { }
```

### **How They Map to Database Operations**

| HTTP Method | Purpose | TrustLot Example |
|---|---|---|
| POST | Create new record | `POST /api/cars` - List new car |
| GET | Retrieve records | `GET /api/cars/1` - Get car details |
| PUT | Replace entire record | `PUT /api/cars/1` - Update entire car |
| PATCH | Update specific fields | `PATCH /api/admin/users/1` - Update user details |
| DELETE | Remove record | `DELETE /api/cars/1` - Delete listing |

---

## <a name="basic-6"></a>6. Path Variables & Query Parameters

### **What It Is**
Ways to pass data to the server through the URL.

### **Path Variables (Part of URL)**
```java
@GetMapping("/cars/{carId}")
public ResponseEntity<Car> getCar(@PathVariable int carId) {
    // URL: /api/cars/5
    // carId = 5
}

@PostMapping("/reviews/sellers/{sellerId}")
public ResponseEntity<?> submitReview(@PathVariable int sellerId, 
                                     @RequestBody ReviewRequest request) {
    // URL: /api/reviews/sellers/3
    // sellerId = 3
}
```

### **Query Parameters (After ? in URL)**
```java
@GetMapping("/cars/compare")
public ResponseEntity<?> compareCars(@RequestParam int firstCarId, 
                                    @RequestParam int secondCarId) {
    // URL: /api/cars/compare?firstCarId=1&secondCarId=2
    // firstCarId = 1, secondCarId = 2
}
```

### **TrustLot Examples**
- **Path Variable:** `/api/cars/123` - Get car ID 123
- **Query Parameter:** `/api/cars/compare?firstCarId=1&secondCarId=2` - Compare cars
- **Both:** `/api/admin/users/5` - Get user ID 5

---

## <a name="basic-7"></a>7. Request Body & Response Entity

### **Request Body (@RequestBody)**
Data sent from client to server (usually JSON).

```java
@PostMapping
public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    // Request body:
    // {
    //   "username": "john123",
    //   "name": "John Doe",
    //   "email": "john@example.com",
    //   "password": "MyPassword123"
    // }
}
```

### **Response Entity**
Controls HTTP status code, headers, and body.

```java
// Success response
@PostMapping
public ResponseEntity<?> addCar(@RequestBody CarRequest request) {
    Car car = carService.listCar(request);
    return ResponseEntity.status(201).body(
        new CarResponse("Car listed successfully", car)
    );
}

// Error response
if (payment failed) {
    return ResponseEntity.status(402).body(
        new ErrorResponse("Payment failed")
    );
}

// Not found response
if (carNotFound) {
    return ResponseEntity.notFound().build();
}
```

### **HTTP Status Codes in TrustLot**
- `200 OK` - Successful GET/POST/PUT/DELETE
- `201 Created` - Successfully created new resource
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing auth token
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate username/email
- `500 Internal Server Error` - Server error

---

# INTERMEDIATE CONCEPTS

## <a name="int-1"></a>8. Spring Data JPA

### **What It Is**
Framework that simplifies database operations without writing SQL.

### **How It Works**
```
Your Code: carRepository.findById(1)
    ↓
Spring Data JPA: Generates SQL automatically
    ↓
Generated SQL: SELECT * FROM CAR WHERE id = 1
    ↓
Database: Executes query
    ↓
Result: Car object returned
```

### **Why Use It**
- No SQL to write for basic operations
- Type-safe queries
- Automatic query generation
- Less boilerplate code

---

## <a name="int-2"></a>9. Repositories & CRUD Operations

### **What It Is**
Interfaces that provide methods to interact with database.

### **How TrustLot Uses It**
```java
public interface CarRepository extends JpaRepository<Car, Integer> {
    // Automatically get these CRUD methods from JpaRepository:
    // - save(Car car) - CREATE/UPDATE
    // - findById(Integer id) - READ one
    // - findAll() - READ all
    // - delete(Car car) - DELETE
    // - deleteById(Integer id) - DELETE by ID
}

public interface UserRepository extends JpaRepository<AppUser, Integer> {
    // Custom methods specific to AppUser
    Optional<AppUser> findByUsername(String username);
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findByPhoneNumber(String phoneNumber);
}
```

### **CRUD Operations in TrustLot**

**CREATE - Save new record**
```java
AppUser newUser = new AppUser("john123", "John", "9876543210", "john@email.com", hashedPassword, Role.USER);
userRepository.save(newUser); // Inserts into database
```

**READ - Retrieve record**
```java
Optional<Car> car = carRepository.findById(5);
if (car.isPresent()) {
    System.out.println(car.get().getMake()); // Honda
}
```

**UPDATE - Modify record**
```java
Car car = carRepository.findById(5).get();
car.setPrice(900000);
carRepository.save(car); // Updates the record
```

**DELETE - Remove record**
```java
carRepository.deleteById(5); // Deletes car with ID 5
```

---

## <a name="int-3"></a>10. JPA Entities & Annotations

### **What It Is**
Classes that represent database tables. Annotations map Java classes to database structure.

### **Core Annotations**

| Annotation | Purpose | Example |
|---|---|---|
| `@Entity` | This class maps to a table | `@Entity public class Car { }` |
| `@Table` | Specify table name | `@Table(name = "CARS")` |
| `@Id` | Primary key | `@Id private int id;` |
| `@Column` | Column properties | `@Column(nullable = false) private String username;` |
| `@GeneratedValue` | Auto-increment ID | `@GeneratedValue(strategy = GenerationType.IDENTITY)` |
| `@OneToMany` | One-to-Many relationship | `@OneToMany private List<Car> cars;` |
| `@ManyToOne` | Many-to-One relationship | `@ManyToOne private AppUser seller;` |
| `@OneToOne` | One-to-One relationship | `@OneToOne private Payment payment;` |

### **TrustLot Example - Car Entity**
```java
@Entity
@Table(name = "CAR")
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id; // Auto-increment primary key
    
    @Column(nullable = false)
    private String make; // Non-null column
    
    @Column(nullable = false)
    private int year;
    
    @Column(name = "sale_price")
    private decimal price; // Column named differently in DB
    
    @ManyToOne
    @JoinColumn(name = "seller_id")
    private AppUser seller; // Foreign key to user
    
    @Column(columnDefinition = "varchar(255) default 'PENDING_ADMIN_APPROVAL'")
    private String approvalStatus;
}
```

### **Maps to Database Table**
```sql
CREATE TABLE CAR (
    id INT PRIMARY KEY AUTO_INCREMENT,
    make VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    sale_price DECIMAL(10, 2),
    seller_id INT,
    approval_status VARCHAR(255) DEFAULT 'PENDING_ADMIN_APPROVAL',
    FOREIGN KEY (seller_id) REFERENCES APP_USER(id)
);
```

---

## <a name="int-4"></a>11. Service Layer Pattern

### **What It Is**
Middle layer between controllers and repositories that contains business logic.

### **Why Separate?**
```
❌ BAD - Controller has all logic:
CarController {
    @GetMapping
    public List<Car> getCars() {
        List<Car> cars = repository.findAll();
        cars.sort(...);
        cars.filter(...);
        return cars;
    }
}

✅ GOOD - Business logic in service:
CarController {
    @Autowired
    private CarService service;
    
    @GetMapping
    public List<Car> getCars() {
        return service.getAvailableCars();
    }
}

CarService {
    public List<Car> getAvailableCars() {
        List<Car> cars = repository.findAll();
        cars.sort(...);
        cars.filter(...);
        return cars;
    }
}
```

### **Services in TrustLot**
```java
@Service
public class PurchaseService {
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private CarService carService;
    
    public PurchaseOrder initiatePurchase(int buyerId, int carId, PaymentInfo paymentInfo) {
        // 1. Validate purchase eligibility
        validatePurchaseEligibility(buyerId, carId);
        
        // 2. Process payment
        Payment payment = paymentService.processPayment(paymentInfo);
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new PaymentFailedException();
        }
        
        // 3. Mark car as unavailable
        Car car = carService.markUnavailable(carId);
        
        // 4. Create order
        PurchaseOrder order = new PurchaseOrder(buyerId, car.getSellerId(), carId, payment.getId());
        return orderRepository.save(order);
    }
}
```

---

## <a name="int-5"></a>12. DTOs (Data Transfer Objects)

### **What It Is**
Classes used to transfer data between layers without exposing internal entity structure.

### **Why Use DTOs?**

```
❌ Problem - Exposing entity directly:
@PostMapping
public Car addCar(@RequestBody Car car) {
    // User sends CAR with all properties
    // Might include fields we don't want them to change (id, createdAt)
}

✅ Solution - Using DTO:
@PostMapping
public ResponseEntity<?> addCar(@RequestBody CarRequest request) {
    // User only sends what we want
    // Controller converts DTO to Entity
}
```

### **DTOs in TrustLot**

**Request DTO** (what user sends)
```java
public class CarRequest {
    private String make;
    private String model;
    private int year;
    private decimal price;
    private int mileage;
    // ... other fields
    
    // Does NOT have: id, createdAt, approvalStatus, viewCount
    // Admin can't manipulate these
}
```

**Response DTO** (what we return to user)
```java
public class CarResponse {
    private int id;
    private String make;
    private String model;
    private int year;
    private decimal price;
    private AppUser seller;
    private String approvalStatus;
    private int viewCount;
    
    // Does NOT have: passwordHash (security sensitive)
}
```

**Conversion in Service**
```java
@Service
public class CarService {
    public Car listCar(CarRequest request, int userId) {
        Car car = new Car();
        car.setMake(request.getMake());
        car.setModel(request.getModel());
        // ... set other fields
        car.setSellerId(userId);
        car.setApprovalStatus(ApprovalStatus.PENDING_ADMIN_APPROVAL);
        return carRepository.save(car);
    }
}
```

---

## <a name="int-6"></a>13. Exception Handling

### **What It Is**
Custom exceptions for specific error scenarios.

### **Exception Hierarchy in TrustLot**
```java
public class ApiException extends RuntimeException {
    private String message;
    
    public ApiException(String message) {
        super(message);
        this.message = message;
    }
}

public class ValidationException extends ApiException { }
public class AuthenticationException extends ApiException { }
public class ResourceNotFoundException extends ApiException { }
public class ConflictException extends ApiException { }
public class PaymentFailedException extends ApiException { }
```

### **Throwing Exceptions in TrustLot**
```java
@Service
public class AuthService {
    public AppUser login(String username, String password) {
        AppUser user = userRepository.findByUsername(username)
            .orElseThrow(() -> new AuthenticationException("User not found"));
        
        if (!isPasswordValid(password, user.getPasswordHash())) {
            throw new AuthenticationException("Invalid password");
        }
        
        return user;
    }
}

@Service
public class CarService {
    public Car getCarDetails(int carId) {
        return carRepository.findById(carId)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found"));
    }
}
```

---

## <a name="int-7"></a>14. Global Exception Handler

### **What It Is**
Catches exceptions from entire application and returns consistent error responses.

### **How It Works**
```
User Request
    ↓
Controller throws Exception
    ↓
GlobalExceptionHandler catches it
    ↓
Returns formatted error response
    ↓
HTTP error with status code
```

### **TrustLot Implementation**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<?> handleValidation(ValidationException e) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("Validation failed", e.getMessage()));
    }
    
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> handleAuth(AuthenticationException e) {
        return ResponseEntity.status(401)
            .body(new ErrorResponse("Authentication failed", e.getMessage()));
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException e) {
        return ResponseEntity.notFound().build();
    }
    
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<?> handleConflict(ConflictException e) {
        return ResponseEntity.status(409)
            .body(new ErrorResponse("Conflict", e.getMessage()));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception e) {
        logger.error("Unexpected error", e);
        return ResponseEntity.status(500)
            .body(new ErrorResponse("Internal server error", "Please try again later"));
    }
}
```

### **Result**
Instead of scattered error handling:
```java
// Old way - repetitive
try {
    // code
} catch (Exception e) {
    return ResponseEntity.badRequest().body(e.getMessage());
}

// New way - centralized
// Just throw exception, GlobalExceptionHandler handles it
throw new ValidationException("Invalid input");
```

---

## <a name="int-8"></a>15. Spring Security Basics

### **What It Is**
Framework for authentication (who are you?) and authorization (what can you do?).

### **How TrustLot Uses Custom Session Tokens**

**Instead of Spring Security (for simplicity), TrustLot uses:**
```java
@Component
public class SessionInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                             HttpServletResponse response,
                             Object handler) throws Exception {
        // 1. Extract token from header
        String token = request.getHeader("X-Session-Token");
        
        // 2. Validate token exists
        if (token == null) {
            response.sendError(401, "Missing session token");
            return false; // Block request
        }
        
        // 3. Check token is valid and not expired
        if (!sessionTokenService.validateToken(token)) {
            response.sendError(401, "Invalid or expired session");
            return false; // Block request
        }
        
        // 4. Token valid, allow request to proceed
        return true;
    }
}
```

### **Session Token Management**
```java
@Service
public class SessionTokenService {
    private Map<String, SessionToken> activeSessions = new ConcurrentHashMap<>();
    
    // Generate token on login
    public String generateToken(int userId) {
        String token = UUID.randomUUID().toString();
        SessionToken sessionToken = new SessionToken(userId, System.currentTimeMillis() + 120 * 60 * 1000); // 120 minutes
        activeSessions.put(token, sessionToken);
        return token;
    }
    
    // Validate token on each request
    public boolean validateToken(String token) {
        SessionToken sessionToken = activeSessions.get(token);
        if (sessionToken == null) return false; // Token doesn't exist
        
        if (System.currentTimeMillis() > sessionToken.getExpiresAt()) {
            activeSessions.remove(token); // Remove expired token
            return false; // Token expired
        }
        
        return true; // Token valid
    }
    
    // Invalidate token on logout
    public void invalidateToken(String token) {
        activeSessions.remove(token);
    }
}
```

### **Password Security with BCrypt**
```java
@Service
public class AuthService {
    
    // Register - hash password
    public void register(RegisterRequest request) {
        String hashedPassword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt(10));
        AppUser user = new AppUser(request.getUsername(), hashedPassword);
        userRepository.save(user);
    }
    
    // Login - verify password
    public String login(LoginRequest request) {
        AppUser user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new AuthenticationException("User not found"));
        
        // Check if submitted password matches hashed password
        if (!BCrypt.checkpw(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid password");
        }
        
        // Generate session token
        return sessionTokenService.generateToken(user.getId());
    }
}
```

---

## <a name="int-9"></a>16. Interceptors

### **What It Is**
Code that runs before/after each request. Used for authentication, logging, etc.

### **How TrustLot Uses It**
```java
@Component
public class SessionInterceptor implements HandlerInterceptor {
    
    // Runs BEFORE controller handles request
    @Override
    public boolean preHandle(HttpServletRequest request, 
                             HttpServletResponse response,
                             Object handler) throws Exception {
        // 1. Check if user is authenticated
        String token = request.getHeader("X-Session-Token");
        
        // 2. If not, block request
        if (!sessionTokenService.validateToken(token)) {
            response.sendError(401);
            return false; // Don't proceed
        }
        
        // 3. If valid, allow to proceed to controller
        return true;
    }
    
    // Runs AFTER controller finishes
    @Override
    public void postHandle(HttpServletRequest request,
                          HttpServletResponse response,
                          Object handler,
                          ModelAndView modelAndView) throws Exception {
        // Could log response, modify headers, etc.
    }
}
```

### **Register Interceptor**
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Autowired
    private SessionInterceptor sessionInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(sessionInterceptor)
            .addPathPatterns("/api/**") // Apply to all /api routes
            .excludePathPatterns("/api/auth/register", "/api/auth/login"); // Except login/register
    }
}
```

---

## <a name="int-10"></a>17. Configuration Classes

### **What It Is**
Classes that define Spring configurations without using XML.

### **TrustLot Configurations**

**CORS Configuration** (allow frontend to call backend)
```java
@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:4200") // Angular frontend
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
```

**OpenAPI Configuration** (Swagger documentation)
```java
@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("TrustLot Used Car Marketplace API")
                .version("1.0")
                .description("Complete API for used car buying and selling"));
    }
}
```

---

# ADVANCED CONCEPTS

## <a name="adv-1"></a>18. Transactional Management

### **What It Is**
Ensures database operations are atomic (all succeed or all fail).

### **ACID Properties**

| Property | Meaning | Example |
|---|---|---|
| **A**tomicity | All or nothing | Purchase: payment processes AND order created, or neither |
| **C**onsistency | Data always valid | Foreign keys are valid, constraints enforced |
| **I**solation | Transactions don't interfere | User A's purchase doesn't affect User B's |
| **D**urability | Data persists | If server crashes, data isn't lost |

### **How TrustLot Uses It**
```java
@Service
public class PurchaseService {
    
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public PurchaseOrder processPurchase(int buyerId, int carId, PaymentInfo paymentInfo) {
        // 1. Process payment
        Payment payment = paymentService.processPayment(paymentInfo);
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new PaymentFailedException(); // Transaction rolls back
        }
        
        // 2. Update car availability
        Car car = carRepository.findById(carId).orElseThrow();
        car.setAvailable(false);
        carRepository.save(car); // Saved within transaction
        
        // 3. Create purchase order
        PurchaseOrder order = new PurchaseOrder(buyerId, car.getSellerId(), carId, payment.getId());
        orderRepository.save(order); // Saved within transaction
        
        // If all successful: COMMIT (all changes persist)
        // If ANY exception: ROLLBACK (all changes undo)
        return order;
    }
}
```

### **What Happens**

**Success Scenario:**
```
START TRANSACTION
  ├─ Process payment → SUCCESS
  ├─ Save car as unavailable → SUCCESS
  ├─ Create order → SUCCESS
COMMIT ALL CHANGES ✅
```

**Failure Scenario:**
```
START TRANSACTION
  ├─ Process payment → SUCCESS
  ├─ Save car as unavailable → SUCCESS
  ├─ Create order → FAIL (validation error)
ROLLBACK ALL CHANGES ✅
(Payment is refunded, car still available)
```

### **Isolation Levels**

```java
@Transactional(isolation = Isolation.READ_UNCOMMITTED) // Loose
@Transactional(isolation = Isolation.READ_COMMITTED)   // Balanced (default)
@Transactional(isolation = Isolation.REPEATABLE_READ)  // Strict
@Transactional(isolation = Isolation.SERIALIZABLE)     // Very strict (for purchase)
```

**In TrustLot:**
- Purchase transactions use `SERIALIZABLE` (prevent duplicate purchases)
- Regular queries use `READ_COMMITTED` (balanced)

---

## <a name="adv-2"></a>19. Custom JPA Queries

### **What It Is**
Writing specific database queries using JPQL or native SQL.

### **Method 1: Query Derivation** (Spring auto-generates)
```java
public interface UserRepository extends JpaRepository<AppUser, Integer> {
    Optional<AppUser> findByUsername(String username);
    // Generates: SELECT * FROM APP_USER WHERE username = ?
    
    Optional<AppUser> findByEmail(String email);
    // Generates: SELECT * FROM APP_USER WHERE email = ?
    
    Optional<AppUser> findByPhoneNumber(String phoneNumber);
    // Generates: SELECT * FROM APP_USER WHERE phone_number = ?
}
```

### **Method 2: @Query with JPQL**
```java
public interface CarRepository extends JpaRepository<Car, Integer> {
    
    @Query("SELECT c FROM Car c WHERE c.approvalStatus = 'APPROVED' AND c.available = true")
    List<Car> findAllAvailableCars();
    
    @Query("SELECT c FROM Car c WHERE c.seller.id = :sellerId AND c.approvalStatus = 'PENDING_ADMIN_APPROVAL'")
    List<Car> findPendingListingsForSeller(@Param("sellerId") int sellerId);
    
    @Query("SELECT c FROM Car c JOIN FETCH c.seller WHERE c.id = :id")
    Optional<Car> findByIdWithSeller(@Param("id") int id);
}
```

### **Method 3: Native SQL**
```java
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer> {
    
    @Query(value = "SELECT * FROM PURCHASE_ORDER WHERE buyer_id = :buyerId OR seller_id = :sellerId", 
           nativeQuery = true)
    List<PurchaseOrder> findOrdersByUser(@Param("buyerId") int buyerId, 
                                        @Param("sellerId") int sellerId);
}
```

### **Method 4: Specifications** (Complex queries)
```java
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer>, 
                                                 JpaSpecificationExecutor<PurchaseOrder> {
}

// Usage in service
@Service
public class AdminService {
    
    public List<PurchaseOrder> findPendingOrders() {
        Specification<PurchaseOrder> spec = (root, query, cb) -> 
            cb.equal(root.get("status"), OrderStatus.PENDING_ADMIN_APPROVAL);
        
        return orderRepository.findAll(spec);
    }
}
```

---

## <a name="adv-3"></a>20. Eager & Lazy Loading

### **What It Is**
How JPA loads related entities from database.

### **Lazy Loading** (Load only when accessed)
```java
@Entity
public class Car {
    @Id
    private int id;
    
    @ManyToOne(fetch = FetchType.LAZY) // Load seller only if accessed
    private AppUser seller;
}

// Usage
Car car = carRepository.findById(1).get();
System.out.println(car.getMake()); // Executes query for car
System.out.println(car.getSeller().getName()); // Executes ANOTHER query for seller
// Total: 2 queries (N+1 problem!)
```

### **Eager Loading** (Load together)
```java
@Entity
public class Car {
    @Id
    private int id;
    
    @ManyToOne(fetch = FetchType.EAGER) // Load seller with car
    private AppUser seller;
}

// Usage
Car car = carRepository.findById(1).get();
System.out.println(car.getMake()); // Car query (includes seller)
System.out.println(car.getSeller().getName()); // No extra query
// Total: 1 query (efficient!)
```

### **TrustLot Solution: JOIN FETCH**
```java
@Query("SELECT c FROM Car c JOIN FETCH c.seller WHERE c.id = :id")
Optional<Car> findByIdWithSeller(@Param("id") int id);
// Loads car AND seller in single query
```

---

## <a name="adv-4"></a>21. Cascade Operations

### **What It Is**
Automatically perform database operations on related entities.

### **Example: Delete Support Ticket with Responses**
```java
@Entity
public class SupportTicket {
    @Id
    private int id;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TicketResponse> responses;
}

// When ticket is deleted, all responses auto-deleted too
ticketRepository.deleteById(ticketId); // Deletes ticket + all responses
```

### **Cascade Types**
```java
@OneToMany(cascade = CascadeType.PERSIST) // When ticket saved, responses saved
@OneToMany(cascade = CascadeType.REMOVE)  // When ticket deleted, responses deleted
@OneToMany(cascade = CascadeType.MERGE)   // When ticket merged, responses merged
@OneToMany(cascade = CascadeType.ALL)     // All of above
```

---

## <a name="adv-5"></a>22. Hibernate DDL Auto

### **What It Is**
Automatically creates/updates database schema from entities.

### **Settings in TrustLot**
```properties
spring.jpa.hibernate.ddl-auto=update
```

| Value | Behavior | Use Case |
|---|---|---|
| `create` | Drop and recreate tables | Development (careful!) |
| `create-drop` | Create on startup, drop on shutdown | Testing |
| `update` | Add/modify columns, never drop | Production (safest) |
| `validate` | Check schema matches entities | Production (verify only) |
| `none` | Do nothing | Production (manual control) |

### **How It Works**
```
Java Entity:
    public class Car {
        @Id
        private int id;
        
        @Column(nullable = false)
        private String make;
    }
         ↓
Hibernates generates:
    CREATE TABLE CAR (
        id INT PRIMARY KEY AUTO_INCREMENT,
        make VARCHAR(255) NOT NULL
    );
```

---

## <a name="adv-6"></a>23. AOP & Logging

### **What It Is**
Aspect-Oriented Programming - add functionality across multiple classes without changing them.

### **Logging Aspect in TrustLot**
```java
@Aspect
@Component
public class LoggingAspect {
    
    @Before("execution(* com.example.usedcars.service.*.*(..))")
    public void logBeforeServiceMethod(JoinPoint jp) {
        String methodName = jp.getSignature().getName();
        Object[] args = jp.getArgs();
        System.out.println("CALL: " + methodName + " with args: " + Arrays.toString(args));
    }
    
    @After("execution(* com.example.usedcars.service.*.*(..))")
    public void logAfterServiceMethod(JoinPoint jp) {
        String methodName = jp.getSignature().getName();
        System.out.println("DONE: " + methodName);
    }
    
    @AfterThrowing(pointcut = "execution(* com.example.usedcars.service.*.*(..))", throwing = "ex")
    public void logException(JoinPoint jp, Exception ex) {
        System.out.println("ERROR in " + jp.getSignature().getName() + ": " + ex.getMessage());
    }
}
```

### **What It Logs**
```
CALL: processPurchase with args: [1, 2, PaymentInfo]
    (buying logic executes)
DONE: processPurchase

Or if error:
ERROR in processPurchase: Payment failed
```

### **Benefits**
- No code changes needed in services
- Logging added automatically
- Easy to enable/disable

---

## <a name="adv-7"></a>24. Custom Annotations

### **What It Is**
Create your own annotations for repeated functionality.

### **Example: @ValidateEmail**
```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = EmailValidator.class)
public @interface ValidateEmail {
    String message() default "Invalid email format";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// Validator
public class EmailValidator implements ConstraintValidator<ValidateEmail, String> {
    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
}

// Usage
public class RegisterRequest {
    @ValidateEmail
    private String email; // Automatically validated
}
```

---

## <a name="adv-8"></a>25. Connection Pooling

### **What It Is**
Reuse database connections instead of creating new ones each time.

### **How It Works**
```
Without pooling:
Request 1: Create connection → Use → Close
Request 2: Create connection → Use → Close
Request 3: Create connection → Use → Close
(3 new connections, slow!)

With pooling:
Connection Pool (10 connections)
Request 1: Borrow connection 1 → Use → Return
Request 2: Borrow connection 2 → Use → Return
Request 3: Borrow connection 1 again → Use → Return
(Reuse connections, fast!)
```

### **Configuration in TrustLot**
```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.jpa.properties.hibernate.c3p0.max_size=100
```

---

## <a name="adv-9"></a>26. Scheduled Tasks

### **What It Is**
Run code at specific intervals (cleanup, sending emails, etc.).

### **Example: Session Cleanup**
```java
@Component
public class SessionCleanupTask {
    
    @Autowired
    private SessionTokenService sessionTokenService;
    
    @Scheduled(fixedRate = 60000) // Every 60 seconds
    public void cleanupExpiredSessions() {
        sessionTokenService.cleanupExpiredSessions();
        System.out.println("Cleaned up expired sessions");
    }
}
```

### **Enable Scheduling**
```java
@SpringBootApplication
@EnableScheduling // Enable @Scheduled
public class UsedCarManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(UsedCarManagementApplication.class, args);
    }
}
```

### **Other Schedule Options**
```java
@Scheduled(fixedRate = 60000)              // Every 60 seconds
@Scheduled(fixedDelay = 60000)             // 60 sec after completion
@Scheduled(cron = "0 0 * * * *")           // Every hour at :00
@Scheduled(cron = "0 0 2 * * *")           // Daily at 2 AM
```

---

## <a name="adv-10"></a>27. OpenAPI/Swagger

### **What It Is**
Auto-generated API documentation that users can test endpoints interactively.

### **Configuration in TrustLot**
```java
@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("TrustLot API")
                .version("1.0")
                .description("Used Car Marketplace API"))
            .servers(List.of(new Server()
                .url("http://localhost:8080")
                .description("Local")));
    }
}
```

### **Auto-Annotated Endpoints**
```java
@RestController
@RequestMapping("/api/cars")
public class CarController {
    
    @GetMapping("/{id}")
    @Operation(summary = "Get car details", 
               description = "Retrieves full details of a specific car")
    public ResponseEntity<Car> getCarDetails(@PathVariable int id) {
        // Auto-documented
    }
}
```

### **Access Swagger UI**
```
URL: http://localhost:8080/swagger-ui.html
```

Shows:
- All endpoints
- Request/response examples
- Try it out functionality
- Authentication details

---

## Summary Table

| Concept | Complexity | Used in TrustLot | Why Important |
|---|---|---|---|
| REST Controllers | Basic | ✅ All controllers | Foundation |
| Dependency Injection | Basic | ✅ Services injected | Loose coupling |
| Spring Data JPA | Intermediate | ✅ Repositories | Database access |
| Service Layer | Intermediate | ✅ Business logic | Separation of concerns |
| Transactional | Advanced | ✅ Purchase flow | Data consistency |
| Custom Queries | Advanced | ✅ Complex searches | Performance |
| AOP Logging | Advanced | ✅ Logging aspect | Cross-cutting concerns |
| Security | Intermediate | ✅ Session tokens | User authentication |

---

**End of Document**
