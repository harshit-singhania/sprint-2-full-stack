package com.example.usedcars.service;

public record PaymentGatewayResult(
        boolean successful,
        String gatewayName,
        String transactionId,
        String message
) {
}
