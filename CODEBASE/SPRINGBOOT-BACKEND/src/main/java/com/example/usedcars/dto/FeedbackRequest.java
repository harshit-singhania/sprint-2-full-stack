package com.example.usedcars.dto;

import jakarta.validation.constraints.NotBlank;

public record FeedbackRequest(@NotBlank String message) {
}
