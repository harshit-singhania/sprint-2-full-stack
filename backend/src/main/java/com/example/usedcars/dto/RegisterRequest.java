package com.example.usedcars.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
        @NotBlank String username,
        @NotBlank
        @Pattern(regexp = "^[A-Z][a-z]+(?: [A-Z][a-z]+)*$", message = "must contain alphabetic words in Title Case")
        String name,
        @NotBlank
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "must be a valid 10 digit Indian mobile number")
        String phoneNumber,
        @Email String email,
        @NotBlank String password,
        @NotBlank String role
) {
}
