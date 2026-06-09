package com.example.usedcars.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record AdminUpdateUserRequest(
        String username,
        @Pattern(regexp = "^[A-Z][a-z]+(?: [A-Z][a-z]+)*$", message = "must contain alphabetic words in Title Case")
        String name,
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "must be a valid 10 digit Indian mobile number")
        String phoneNumber,
        @Email String email,
        String role
) {
}
