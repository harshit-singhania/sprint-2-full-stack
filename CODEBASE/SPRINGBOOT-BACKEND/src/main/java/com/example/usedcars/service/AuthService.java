package com.example.usedcars.service;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.dto.LoginRequest;
import com.example.usedcars.dto.LoginResponse;
import com.example.usedcars.dto.RegisterRequest;

public interface AuthService {
    ApiMessage register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    ApiMessage logout(String token);
}
