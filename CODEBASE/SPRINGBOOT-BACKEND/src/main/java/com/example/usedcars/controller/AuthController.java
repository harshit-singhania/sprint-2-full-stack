package com.example.usedcars.controller;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.dto.LoginRequest;
import com.example.usedcars.dto.LoginResponse;
import com.example.usedcars.dto.RegisterRequest;
import com.example.usedcars.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ApiMessage register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public ApiMessage logout(@RequestHeader("X-Session-Token") String token) {
        return authService.logout(token);
    }
}
