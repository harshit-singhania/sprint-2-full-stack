package com.example.usedcars.dto;

import jakarta.validation.constraints.NotBlank;

public record TicketRequest(@NotBlank String subject, @NotBlank String description) {
}
