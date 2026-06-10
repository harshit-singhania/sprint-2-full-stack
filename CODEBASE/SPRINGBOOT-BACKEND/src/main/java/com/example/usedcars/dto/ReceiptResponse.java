package com.example.usedcars.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReceiptResponse(
        Long orderId,
        String receiptNumber,

        // Buyer
        String buyerName,
        String buyerUsername,
        String buyerEmail,
        String buyerPhone,

        // Seller
        String sellerName,
        String sellerUsername,
        String sellerEmail,

        // Car
        Long carId,
        String carMake,
        String carModel,
        int carYear,
        String carColor,
        int carMileage,

        // Payment
        String paymentId,
        BigDecimal amount,
        String paymentMethod,
        String gatewayTransactionId,
        String paymentStatus,

        // Order
        String orderStatus,
        LocalDateTime orderDate,
        LocalDateTime generatedAt
) {
}
