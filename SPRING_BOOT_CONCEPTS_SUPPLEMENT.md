# Spring Boot Concepts Supplement
## Additional Concepts Found in TrustLot Backend Code

**Date:** June 10, 2026  
**Project:** TrustLot Backend Code Review

---

## Additional Concepts Discovered (13 More)

After thorough code review, here are the **missing concepts** that ARE actually used in the project:

---

## 28. Jakarta Validation Framework (@Valid, @NotBlank, @Email, etc.)

### **What It Is**
Validates user input automatically at the application boundary.

### **How TrustLot Uses It**

**In DTO with Validation Constraints:**
```java
public record RegisterRequest(
    @NotBlank String username,
    @NotBlank
    @Pattern(regexp = "^[A-Z][a-z]+(?: [A-Z][a-z]+)*$", 
             message = "must contain alphabetic words in Title Case")
    String name,
    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$", 
             message = "must be a valid 10 digit Indian mobile number")
    String phoneNumber,
    @Email String email,
    @NotBlank @Size(min = 10, message = "must be at least 10 characters") 
    String password,
    @NotBlank String role
) {}
```

**In Controller with @Valid:**
```java
@PostMapping("/register")
public ApiMessage register(@Valid @RequestBody RegisterRequest request) {
    // @Valid triggers validation automatically
    // If validation fails, MethodArgumentNotValidException thrown
    return authService.register(request);
}
```

### **Validation Constraints Used**

| Constraint | Purpose | Example |
|---|---|---|
| `@NotBlank` | Cannot be null or empty | Username, name, password |
| `@Email` | Must be valid email format | Email field |
| `@Pattern` | Must match regex pattern | Phone (10-digit), name (Title Case) |
| `@Size` | Length validation | Password (min 10) |
| `@Positive` | Must be > 0 | Numeric IDs |
| `@Min/@Max` | Numeric bounds | Not used but available |

### **Exception Handling**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiMessage> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(error -> error.getField() + " " + error.getDefaultMessage())
            .orElse("Validation failed");
        return ResponseEntity.badRequest().body(new ApiMessage(message));
    }
}
```

---

## 29. @Validated & Method-Level Validation

### **What It Is**
Enable validation on method parameters in Spring-managed classes.

### **How TrustLot Uses It**
```java
@RestController
@RequestMapping("/api/admin")
@Validated // Enables method-level validation
public class AdminController {
    
    @PostMapping("/orders/{orderId}/approve")
    public PurchaseOrder approveOrder(
        @RequestHeader("X-Session-Token") String token,
        @PathVariable @Positive Long orderId  // Must be > 0
    ) {
        // orderId automatically validated before method executes
    }
}
```

### **Constraint Violations**
If validation fails:
```java
@ExceptionHandler(ConstraintViolationException.class)
public ResponseEntity<ApiMessage> handleConstraintViolation(ConstraintViolationException ex) {
    String message = ex.getConstraintViolations().stream()
        .findFirst()
        .map(v -> v.getPropertyPath() + " " + v.getMessage())
        .orElse("Validation failed");
    return ResponseEntity.badRequest().body(new ApiMessage(message));
}
```

---

## 30. @JsonIgnore & JSON Serialization Control

### **What It Is**
Exclude sensitive fields from JSON responses.

### **How TrustLot Uses It**
```java
@Entity
@Table(name = "users")
public class AppUser {
    
    @Column(nullable = false)
    @JsonIgnore // Don't send password hash to client
    private String passwordHash;
    
    @JsonIgnore // Don't expose session token in responses
    @Column(unique = true)
    private String activeSessionTokenHash;
    
    @JsonIgnore // Session expiry is internal only
    private LocalDateTime activeSessionExpiresAt;
    
    // Public fields are serialized to JSON
    private String username;
    private String email;
    private String name;
}
```

### **What Gets Sent to Client**
```json
{
    "id": 1,
    "username": "john123",
    "email": "john@example.com",
    "name": "John Doe",
    "phoneNumber": "9876543210",
    "role": "USER"
    // passwordHash, activeSessionTokenHash NOT included
}
```

---

## 31. @Enumerated & Enum Field Mapping

### **What It Is**
Map Java Enums to database columns.

### **How TrustLot Uses It**
```java
@Entity
public class AppUser {
    
    @Enumerated(EnumType.STRING) // Store as string ("USER", "ADMIN")
    @Column(nullable = false)
    private Role role;
}

public enum Role {
    USER,
    ADMIN
}
```

### **Database Representation**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(255),
    role VARCHAR(255) -- Stores "USER" or "ADMIN"
);
```

---

## 32. Records (Java 16+) for DTOs

### **What It Is**
Concise syntax for immutable data classes (perfect for DTOs).

### **How TrustLot Uses It**
```java
// Instead of writing a full class with getters/setters:
public record RegisterRequest(
    String username,
    String name,
    String phoneNumber,
    String email,
    String password,
    String role
) {}

// Records auto-generate:
// - Constructor
// - Getters: username(), name(), etc.
// - equals(), hashCode(), toString()
// - Immutability (fields are final)
```

### **Benefits Over Regular Class**
```java
// Old way (boilerplate):
public class RegisterRequest {
    private String username;
    private String name;
    
    public String getUsername() { return username; }
    public void setUsername(String u) { this.username = u; }
    // ... 50+ lines
}

// New way (record):
public record RegisterRequest(String username, String name) {}
// Done! 1 line
```

---

## 33. Optional<T> for Nullable Results

### **What It Is**
Type-safe way to handle potentially null values.

### **How TrustLot Uses It**
```java
public interface UserRepository extends JpaRepository<AppUser, Long> {
    
    // Returns Optional (might be empty if not found)
    Optional<AppUser> findByUsername(String username);
    Optional<AppUser> findByEmail(String email);
    
    // Usage
    Optional<AppUser> user = userRepository.findByUsername("john123");
    
    if (user.isPresent()) {
        AppUser appUser = user.get();
        // Use user
    } else {
        // User not found
    }
    
    // Or using functional approach:
    AppUser appUser = userRepository.findByUsername("john123")
        .orElseThrow(() -> new UserNotFoundException("User not found"));
}
```

### **Better Than Null Checks**
```java
// Bad: allows null pointer exception
AppUser user = userRepository.findByUsername("john");
System.out.println(user.getName()); // NullPointerException if user is null!

// Good: safe handling
Optional<AppUser> user = userRepository.findByUsername("john");
String name = user.map(AppUser::getName).orElse("Unknown");
```

---

## 34. LocalDateTime for Date/Time Handling

### **What It Is**
Modern Java date/time API for storing timestamps.

### **How TrustLot Uses It**
```java
@Entity
public class Car {
    
    @Column(name = "created_at")
    private LocalDateTime createdAt; // When listing created
}

@Entity
public class AppUser {
    
    private LocalDateTime activeSessionExpiresAt; // When session expires
}

// Usage in repository
@Query("select c from Car c where c.createdAt >= :since order by c.createdAt asc")
List<Car> findCarsSince(@Param("since") LocalDateTime since);

// In service
List<Car> recentCars = carRepository.findCarsSince(
    LocalDateTime.now().minusDays(7) // Last 7 days
);
```

---

## 35. @Bean for Defining Beans in Config Classes

### **What It Is**
Explicitly define Spring beans in configuration classes.

### **How TrustLot Uses It**
```java
@Configuration
public class OpenApiConfig {
    
    @Bean // This creates a Spring bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("TrustLot API")
                .version("1.0")
                .description("Used Car Marketplace API"));
    }
}
```

### **Difference from @Component**
```java
// @Component - For your own classes
@Component
public class MyService { }

// @Bean - For third-party or complex objects
@Configuration
public class Config {
    @Bean
    public SomeThirdPartyClass someBean() {
        return new SomeThirdPartyClass(...);
    }
}
```

---

## 36. @Value for Property Injection

### **What It Is**
Inject values from application.properties into Spring beans.

### **How TrustLot Uses It**
```properties
# application.properties
app.session.expiration-minutes=120
notification.email.enabled=true
notification.email.from=no-reply@usedcars.local
```

**Injected in Service:**
```java
@Service
public class SessionTokenService {
    
    @Value("${app.session.expiration-minutes:120}") // Default 120 if not set
    private int sessionExpirationMinutes;
    
    public void generateToken(int userId) {
        long expiresAt = System.currentTimeMillis() + 
                        sessionExpirationMinutes * 60 * 1000;
        // Use sessionExpirationMinutes
    }
}
```

### **Environment Variables**
```properties
# Can use environment variables with defaults
spring.datasource.url=${DB_URL:jdbc:derby:usedcarsdb;create=true}
spring.datasource.username=${DB_USERNAME:}
server.port=${PORT:8080}
```

---

## 37. BigDecimal for Financial Calculations

### **What It Is**
Precise decimal arithmetic (no rounding errors like float/double).

### **How TrustLot Uses It**
```java
@Entity
public class Payment {
    
    @Column(precision = 10, scale = 2) // 10 total digits, 2 after decimal
    private BigDecimal amount; // ₹850,000.00
}

@Entity
public class Car {
    
    @Column(precision = 10, scale = 2)
    private BigDecimal price; // Car price in rupees
}

// In repository - aggregate functions
@Query("select coalesce(sum(o.payment.amount), 0) from PurchaseOrder o where o.status = :status")
BigDecimal sumPaymentAmountByStatus(@Param("status") OrderStatus status);
```

### **Why Not Double?**
```java
// Double is imprecise
double price = 850000.50;
double commission = price * 0.10; // 85000.05000000001 (wrong!)

// BigDecimal is precise
BigDecimal price = new BigDecimal("850000.50");
BigDecimal commission = price.multiply(new BigDecimal("0.10")); // 85000.50 (correct!)
```

---

## 38. Aggregate Functions in @Query

### **What It Is**
SQL aggregate functions (SUM, AVG, COUNT) in JPQL queries.

### **How TrustLot Uses It**
```java
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    
    // SUM - Total revenue
    @Query("select coalesce(sum(o.payment.amount), 0) from PurchaseOrder o where o.status = :status")
    BigDecimal sumPaymentAmountByStatus(@Param("status") OrderStatus status);
    
    // AVG - Average rating
    @Query("select coalesce(avg(r.rating), 0) from SellerReview r where r.seller = :seller")
    Double averageRatingBySeller(@Param("seller") AppUser seller);
    
    // COUNT - (implicitly used in: countBySeller, countByStatus, etc.)
}
```

### **In Dashboard Service**
```java
@Service
public class DashboardServiceImpl {
    
    public AdminDashboardResponse getDashboard() {
        BigDecimal totalRevenue = purchaseOrderRepository
            .sumPaymentAmountByStatus(OrderStatus.APPROVED);
        
        return new AdminDashboardResponse(
            .totalRevenue(totalRevenue.doubleValue())
            // ... other fields
        );
    }
}
```

---

## 39. @Around (AOP Advice Type)

### **What It Is**
Intercept method calls before AND after execution (most powerful AOP advice).

### **How TrustLot Uses It**
```java
@Aspect
@Component
public class LoggingAspect {
    
    @Around("within(com.example.usedcars.controller..*) || within(com.example.usedcars.service..*)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().toShortString();
        
        LOGGER.info("Starting {}", methodName);
        
        try {
            // Actually execute the method
            Object result = joinPoint.proceed();
            
            long duration = System.currentTimeMillis() - startTime;
            LOGGER.info("Completed {} in {} ms", methodName, duration);
            return result;
            
        } catch (Throwable ex) {
            long duration = System.currentTimeMillis() - startTime;
            LOGGER.error("Failed {} after {} ms — {}", methodName, duration, ex.getMessage());
            throw ex;
        }
    }
}
```

### **Other AOP Advice Types (for reference)**
```java
@Before("...") // Execute before method
@After("...") // Execute after method (always)
@AfterReturning("...") // Execute after successful return
@AfterThrowing("...") // Execute after exception
@Around("...") // Execute before AND after (most control)
```

---

## 40. Service Interfaces & Implementations

### **What It Is**
Separate interface from implementation for flexibility and testing.

### **How TrustLot Uses It**
```java
// Interface (contract)
public interface AuthService {
    ApiMessage register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    ApiMessage logout(String token);
}

// Implementation (actual code)
@Service
public class AuthServiceImpl implements AuthService {
    
    @Override
    public ApiMessage register(RegisterRequest request) {
        // Implementation
    }
    
    @Override
    public LoginResponse login(LoginRequest request) {
        // Implementation
    }
    
    @Override
    public ApiMessage logout(String token) {
        // Implementation
    }
}

// Injection (uses interface type, not implementation)
@RestController
public class AuthController {
    @Autowired
    private AuthService authService; // Interface, not AuthServiceImpl
}
```

### **Benefits**
1. Easy to test (mock the interface)
2. Easy to swap implementations
3. Loose coupling
4. Follows dependency inversion principle

---

## Summary: Complete List of Spring Boot Concepts

| # | Concept | Level | Used in TrustLot |
|---|---------|-------|---|
| 1 | Spring Boot Application Setup | Basic | ✅ |
| 2 | Dependency Injection | Basic | ✅ |
| 3 | Beans & Component Annotations | Basic | ✅ |
| 4 | REST Controllers | Basic | ✅ |
| 5 | Request Mapping & HTTP Methods | Basic | ✅ |
| 6 | Path Variables & Query Parameters | Basic | ✅ |
| 7 | Request Body & Response Entity | Basic | ✅ |
| 8 | Spring Data JPA | Intermediate | ✅ |
| 9 | Repositories & CRUD | Intermediate | ✅ |
| 10 | JPA Entities & Annotations | Intermediate | ✅ |
| 11 | Service Layer Pattern | Intermediate | ✅ |
| 12 | DTOs (Data Transfer Objects) | Intermediate | ✅ |
| 13 | Exception Handling | Intermediate | ✅ |
| 14 | Global Exception Handler | Intermediate | ✅ |
| 15 | Spring Security Basics | Intermediate | ✅ |
| 16 | Interceptors | Intermediate | ✅ |
| 17 | Configuration Classes | Intermediate | ✅ |
| 18 | Transactional Management | Advanced | ✅ |
| 19 | Custom JPA Queries | Advanced | ✅ |
| 20 | Eager & Lazy Loading | Advanced | ✅ |
| 21 | Cascade Operations | Advanced | ✅ |
| 22 | Hibernate DDL Auto | Advanced | ✅ |
| 23 | AOP & Logging | Advanced | ✅ |
| 24 | Custom Annotations | Advanced | ✅ |
| 25 | Connection Pooling | Advanced | ✅ |
| 26 | Scheduled Tasks | Advanced | ✅ |
| 27 | OpenAPI/Swagger | Advanced | ✅ |
| 28 | Jakarta Validation Framework | Intermediate | ✅ |
| 29 | @Validated & Method Validation | Intermediate | ✅ |
| 30 | @JsonIgnore & JSON Control | Intermediate | ✅ |
| 31 | @Enumerated & Enum Mapping | Intermediate | ✅ |
| 32 | Records (Java 16+) | Intermediate | ✅ |
| 33 | Optional<T> Type | Intermediate | ✅ |
| 34 | LocalDateTime | Intermediate | ✅ |
| 35 | @Bean Definition | Intermediate | ✅ |
| 36 | @Value Property Injection | Intermediate | ✅ |
| 37 | BigDecimal for Finance | Intermediate | ✅ |
| 38 | Aggregate Functions (@Query) | Advanced | ✅ |
| 39 | @Around (AOP) | Advanced | ✅ |
| 40 | Service Interfaces | Intermediate | ✅ |

---

## Conclusion

The TrustLot backend uses **40 distinct Spring Boot concepts** across basic, intermediate, and advanced levels. All concepts found have been documented with:

- ✅ What it is
- ✅ How TrustLot uses it (actual code)
- ✅ Why it matters
- ✅ Code examples

---

**End of Supplementary Document**
