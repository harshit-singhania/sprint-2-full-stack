package com.example.usedcars.dto;

import com.example.usedcars.model.Role;

public record LoginResponse(String message, String sessionToken, Role role) {
}
