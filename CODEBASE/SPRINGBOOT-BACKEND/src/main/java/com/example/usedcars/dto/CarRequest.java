package com.example.usedcars.dto;

import com.example.usedcars.model.CarCondition;
import com.example.usedcars.model.FuelType;
import com.example.usedcars.model.TransmissionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CarRequest(

        // ── Core fields (required) ──────────────────────────────────────────
        @NotBlank String make,
        @NotBlank String model,
        @Min(1900) @Max(2100) int year,
        @NotNull @DecimalMin(value = "0.01") BigDecimal price,
        @Min(0) int mileage,
        @NotBlank String color,

        // ── Condition fields (all optional with sensible defaults) ──────────

        /** Overall condition declared by the seller. Defaults to GOOD if omitted. */
        CarCondition condition,

        /** Fuel type. Defaults to PETROL if omitted. */
        FuelType fuelType,

        /** Transmission type. Defaults to MANUAL if omitted. */
        TransmissionType transmission,

        /** Body style, e.g. SEDAN, SUV, HATCHBACK. Free text. */
        String bodyType,

        /** Number of previous registered owners. Defaults to 1. */
        @Min(value = 1, message = "must be at least 1") Integer numberOfOwners,

        /** Engine displacement in cc. Optional. */
        @Min(value = 50, message = "engine size seems too small") Integer engineCc,

        /** Whether the car currently has valid insurance. */
        Boolean insured,

        /** Whether the car has a valid PUC certificate. */
        Boolean pucValid,

        /** Seller's free-text description / remarks. Max 2000 chars. */
        @Size(max = 2000, message = "description must be 2000 characters or fewer")
        String description,

        // ── Admin-only field ────────────────────────────────────────────────
        /** Only respected when called by ADMIN — ignored for regular users. */
        Boolean available

) {
}
