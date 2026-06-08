package com.example.usedcars.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CarRequest(
        @NotBlank String make,
        @NotBlank String model,
        @Min(1900) int year,
        @NotNull BigDecimal price,
        @Min(0) int mileage,
        @NotBlank String color,
        Boolean available
) {
}
