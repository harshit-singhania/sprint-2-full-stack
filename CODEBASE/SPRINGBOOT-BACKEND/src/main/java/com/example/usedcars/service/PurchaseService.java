package com.example.usedcars.service;

import com.example.usedcars.dto.PurchaseRequest;
import com.example.usedcars.model.PurchaseOrder;
import java.util.List;

public interface PurchaseService {
    Object purchase(String token, Long carId, PurchaseRequest request);
    List<PurchaseOrder> myOrders(String token);
    List<PurchaseOrder> pendingForSeller(String token);
    List<PurchaseOrder> pendingForAdmin(String token);
    PurchaseOrder approveByAdmin(String token, Long orderId);
    PurchaseOrder rejectByAdmin(String token, Long orderId);
    PurchaseOrder approve(String token, Long orderId);
    PurchaseOrder reject(String token, Long orderId);
    List<PurchaseOrder> allOrders(String token);
}
