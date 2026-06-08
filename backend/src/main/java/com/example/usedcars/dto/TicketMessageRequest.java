package com.example.usedcars.dto;

import jakarta.validation.constraints.NotBlank;

public record TicketMessageRequest(@NotBlank String message) {
}
