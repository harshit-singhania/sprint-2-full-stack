package com.example.usedcars.service;

import java.math.BigDecimal;

public record PaymentGatewayRequest(
        BigDecimal amount,
        String method,
        String paymentToken,
        Boolean legacyPaymentSuccessful
) {
}
