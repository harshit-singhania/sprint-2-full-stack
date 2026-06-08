package com.example.usedcars.controller;

import com.example.usedcars.dto.SellerDashboardResponse;
import com.example.usedcars.dto.PurchaseRequest;
import com.example.usedcars.model.PurchaseOrder;
import com.example.usedcars.service.DashboardService;
import com.example.usedcars.service.PurchaseService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Validated
public class PurchaseController {
    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private DashboardService dashboardService;

    @PostMapping({"/buyer/cars/{carId}/purchase", "/user/cars/{carId}/purchase"})
    public Object purchase(@RequestHeader("X-Session-Token") String token, @PathVariable @Positive Long carId,
                           @Valid @RequestBody PurchaseRequest request) {
        return purchaseService.purchase(token, carId, request);
    }

    @GetMapping("/orders/my")
    public List<PurchaseOrder> myOrders(@RequestHeader("X-Session-Token") String token) {
        return purchaseService.myOrders(token);
    }

    @GetMapping({"/seller/orders/pending", "/user/sales/pending"})
    public List<PurchaseOrder> pendingForSeller(@RequestHeader("X-Session-Token") String token) {
        return purchaseService.pendingForSeller(token);
    }

    @GetMapping({"/seller/dashboard", "/user/dashboard"})
    public SellerDashboardResponse sellerDashboard(@RequestHeader("X-Session-Token") String token) {
        return dashboardService.sellerDashboard(token);
    }

    @PostMapping({"/seller/orders/{orderId}/approve", "/user/sales/{orderId}/approve"})
    public PurchaseOrder approve(@RequestHeader("X-Session-Token") String token, @PathVariable @Positive Long orderId) {
        return purchaseService.approve(token, orderId);
    }

    @PostMapping({"/seller/orders/{orderId}/reject", "/user/sales/{orderId}/reject"})
    public PurchaseOrder reject(@RequestHeader("X-Session-Token") String token, @PathVariable @Positive Long orderId) {
        return purchaseService.reject(token, orderId);
    }
}
