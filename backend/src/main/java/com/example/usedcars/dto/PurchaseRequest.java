package com.example.usedcars.dto;

import jakarta.validation.constraints.NotBlank;

public record PurchaseRequest(
        @NotBlank String paymentMethod,
        String paymentToken,
        Boolean paymentSuccessful
) {
}
