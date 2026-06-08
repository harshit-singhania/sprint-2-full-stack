package com.example.usedcars.controller;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.dto.AdminDashboardResponse;
import com.example.usedcars.model.Car;
import com.example.usedcars.model.PurchaseOrder;
import com.example.usedcars.service.CarService;
import com.example.usedcars.service.DashboardService;
import com.example.usedcars.service.PurchaseService;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@Validated
public class AdminController {
    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private CarService carService;

    @GetMapping("/orders")
    public Object allOrders(@RequestHeader("X-Session-Token") String token) {
        List<PurchaseOrder> orders = purchaseService.allOrders(token);
        return orders.isEmpty() ? new ApiMessage("No orders found") : orders;
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse dashboard(@RequestHeader("X-Session-Token") String token) {
        return dashboardService.adminDashboard(token);
    }

    @GetMapping("/cars/pending")
    public List<Car> pendingCars(@RequestHeader("X-Session-Token") String token) {
        return carService.pendingApproval(token);
    }

    @PostMapping("/cars/{carId}/approve")
    public Car approveCar(@RequestHeader("X-Session-Token") String token, @PathVariable @Positive Long carId) {
        return carService.approveListing(token, carId);
    }

    @PostMapping("/cars/{carId}/reject")
    public Car rejectCar(@RequestHeader("X-Session-Token") String token, @PathVariable @Positive Long carId) {
        return carService.rejectListing(token, carId);
    }

    @GetMapping("/orders/pending")
    public List<PurchaseOrder> pendingOrders(@RequestHeader("X-Session-Token") String token) {
        return purchaseService.pendingForAdmin(token);
    }

    @PostMapping("/orders/{orderId}/approve")
    public PurchaseOrder approveOrder(@RequestHeader("X-Session-Token") String token, @PathVariable @Positive Long orderId) {
        return purchaseService.approveByAdmin(token, orderId);
    }

    @PostMapping("/orders/{orderId}/reject")
    public PurchaseOrder rejectOrder(@RequestHeader("X-Session-Token") String token, @PathVariable @Positive Long orderId) {
        return purchaseService.rejectByAdmin(token, orderId);
    }
}
