package com.example.usedcars.controller;

import com.example.usedcars.dto.AdminDashboardResponse;
import com.example.usedcars.dto.AdminUpdateUserRequest;
import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.dto.DashboardGraphResponse;
import com.example.usedcars.dto.ReceiptResponse;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.Car;
import com.example.usedcars.model.PurchaseOrder;
import com.example.usedcars.service.AdminUserService;
import com.example.usedcars.service.CarService;
import com.example.usedcars.service.DashboardService;
import com.example.usedcars.service.PurchaseService;
import com.example.usedcars.service.ReceiptService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@Validated
public class AdminController {

    @Autowired private PurchaseService  purchaseService;
    @Autowired private DashboardService dashboardService;
    @Autowired private CarService       carService;
    @Autowired private AdminUserService adminUserService;
    @Autowired private ReceiptService   receiptService;

    // ── Orders ────────────────────────────────────────────────────────────────

    @GetMapping("/orders")
    public Object allOrders(@RequestHeader("X-Session-Token") String token) {
        List<PurchaseOrder> orders = purchaseService.allOrders(token);
        return orders.isEmpty() ? new ApiMessage("No orders found") : orders;
    }

    @GetMapping("/orders/pending")
    public List<PurchaseOrder> pendingOrders(@RequestHeader("X-Session-Token") String token) {
        return purchaseService.pendingForAdmin(token);
    }

    @PostMapping("/orders/{orderId}/approve")
    public PurchaseOrder approveOrder(@RequestHeader("X-Session-Token") String token,
                                      @PathVariable @Positive Long orderId) {
        return purchaseService.approveByAdmin(token, orderId);
    }

    @PostMapping("/orders/{orderId}/reject")
    public PurchaseOrder rejectOrder(@RequestHeader("X-Session-Token") String token,
                                     @PathVariable @Positive Long orderId) {
        return purchaseService.rejectByAdmin(token, orderId);
    }

    // ── Receipt (admin can pull any order's receipt) ──────────────────────────

    @GetMapping("/orders/{orderId}/receipt")
    public ReceiptResponse orderReceipt(@RequestHeader("X-Session-Token") String token,
                                        @PathVariable @Positive Long orderId) {
        return receiptService.getReceipt(token, orderId);
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    public AdminDashboardResponse dashboard(@RequestHeader("X-Session-Token") String token) {
        return dashboardService.adminDashboard(token);
    }

    /** Time-series and breakdown data for charts/graphs on the admin dashboard. */
    @GetMapping("/dashboard/graph")
    public DashboardGraphResponse dashboardGraph(@RequestHeader("X-Session-Token") String token) {
        return dashboardService.adminGraphData(token);
    }

    // ── Car listing moderation ────────────────────────────────────────────────

    @GetMapping("/cars/pending")
    public List<Car> pendingCars(@RequestHeader("X-Session-Token") String token) {
        return carService.pendingApproval(token);
    }

    @PostMapping("/cars/{carId}/approve")
    public Car approveCar(@RequestHeader("X-Session-Token") String token,
                          @PathVariable @Positive Long carId) {
        return carService.approveListing(token, carId);
    }

    @PostMapping("/cars/{carId}/reject")
    public Car rejectCar(@RequestHeader("X-Session-Token") String token,
                         @PathVariable @Positive Long carId) {
        return carService.rejectListing(token, carId);
    }

    // ── User management ───────────────────────────────────────────────────────

    /** List all registered users. */
    @GetMapping("/users")
    public List<AppUser> listUsers(@RequestHeader("X-Session-Token") String token) {
        return adminUserService.listAllUsers(token);
    }

    /** Get a single user by ID. */
    @GetMapping("/users/{userId}")
    public AppUser getUser(@RequestHeader("X-Session-Token") String token,
                           @PathVariable @Positive Long userId) {
        return adminUserService.getUser(token, userId);
    }

    /**
     * Edit a user's name, phone, email, or reset their password.
     * All fields are optional — send only the ones you want to change.
     */
    @PatchMapping("/users/{userId}")
    public AppUser updateUser(@RequestHeader("X-Session-Token") String token,
                              @PathVariable @Positive Long userId,
                              @Valid @RequestBody AdminUpdateUserRequest request) {
        return adminUserService.updateUser(token, userId, request);
    }
}
