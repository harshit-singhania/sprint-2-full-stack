package com.example.usedcars.service.impl;

import com.example.usedcars.dto.ReceiptResponse;
import com.example.usedcars.exception.ApiException;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.PurchaseOrder;
import com.example.usedcars.model.Role;
import com.example.usedcars.repository.PurchaseOrderRepository;
import com.example.usedcars.service.ReceiptService;
import com.example.usedcars.service.SessionService;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReceiptServiceImpl implements ReceiptService {

    @Autowired
    private SessionService sessionService;

    @Autowired
    private PurchaseOrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public ReceiptResponse getReceipt(String token, Long orderId) {
        AppUser caller = sessionService.requireUser(token);
        PurchaseOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));

        // Access control: buyer, seller, or admin
        boolean isAdmin  = caller.getRole() == Role.ADMIN;
        boolean isBuyer  = order.getBuyer().getId().equals(caller.getId());
        boolean isSeller = order.getSeller().getId().equals(caller.getId());

        if (!isAdmin && !isBuyer && !isSeller) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied to this receipt");
        }

        AppUser buyer  = order.getBuyer();
        AppUser seller = order.getSeller();

        return new ReceiptResponse(
                order.getId(),
                "RCP-" + order.getId() + "-" + order.getCreatedAt().toLocalDate(),

                // Buyer
                buyer.getName(),
                buyer.getUsername(),
                buyer.getEmail(),
                buyer.getPhoneNumber(),

                // Seller
                seller.getName(),
                seller.getUsername(),
                seller.getEmail(),

                // Car
                order.getCar().getId(),
                order.getCar().getMake(),
                order.getCar().getModel(),
                order.getCar().getYear(),
                order.getCar().getColor(),
                order.getCar().getMileage(),

                // Payment
                order.getPayment().getId(),
                order.getPayment().getAmount(),
                order.getPayment().getMethod(),
                order.getPayment().getGatewayTransactionId(),
                order.getPayment().getStatus().name(),

                // Order
                order.getStatus().name(),
                order.getCreatedAt(),
                LocalDateTime.now()
        );
    }
}
