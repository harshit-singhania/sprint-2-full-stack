package com.example.usedcars.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminUpdateUserRequest(
        @Pattern(regexp = "^[A-Z][a-z]+(?: [A-Z][a-z]+)*$",
                message = "must contain alphabetic words in Title Case")
        String name,

        @Pattern(regexp = "^[6-9]\\d{9}$",
                message = "must be a valid 10 digit Indian mobile number")
        String phoneNumber,

        @Email String email,

        /** If provided, password will be reset to this value (min 10 chars) */
        @Size(min = 10, message = "must be at least 10 characters")
        String newPassword
) {
}
