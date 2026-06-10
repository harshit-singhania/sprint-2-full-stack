package com.example.usedcars.service.impl;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.dto.LoginRequest;
import com.example.usedcars.dto.LoginResponse;
import com.example.usedcars.dto.RegisterRequest;
import com.example.usedcars.exception.ApiException;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.Role;
import com.example.usedcars.repository.UserRepository;
import com.example.usedcars.service.AuthService;
import com.example.usedcars.service.NotificationService;
import com.example.usedcars.service.SessionTokenService;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionTokenService sessionTokenService;

    @Autowired
    private NotificationService notificationService;

    @Value("${app.session.expiration-minutes}")
    private long sessionExpirationMinutes;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional
    public ApiMessage register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ApiException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new ApiException(HttpStatus.CONFLICT, "Phone number already exists");
        }
        if (StringUtils.hasText(request.email()) && userRepository.existsByEmail(request.email().trim())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already exists");
        }

        Role role = parseRole(request.role());
        if (role == Role.ADMIN && userRepository.countByRole(Role.ADMIN) > 0) {
            throw new ApiException(HttpStatus.CONFLICT, "Admin user already exists");
        }

        AppUser user = new AppUser();
        user.setUsername(request.username().trim());
        user.setName(request.name().trim());
        user.setPhoneNumber(request.phoneNumber().trim());
        if (StringUtils.hasText(request.email())) {
            user.setEmail(request.email().trim());
        }
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(role);
        AppUser savedUser = userRepository.save(user);
        notificationService.notifyUserRegistered(savedUser);
        return new ApiMessage("Registration successful. Please login to start a session.");
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        AppUser user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        String token = sessionTokenService.generateToken();
        user.setActiveSessionTokenHash(sessionTokenService.hashToken(token));
        user.setActiveSessionExpiresAt(LocalDateTime.now().plusMinutes(sessionExpirationMinutes));
        userRepository.save(user);
        return new LoginResponse("Login successful", token, user.getRole());
    }

    @Override
    @Transactional
    public ApiMessage logout(String token) {
        AppUser user = userRepository.findByActiveSessionTokenHash(sessionTokenService.hashToken(token))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired session"));
        user.setActiveSessionTokenHash(null);
        user.setActiveSessionExpiresAt(null);
        userRepository.save(user);
        return new ApiMessage("Logout successful");
    }

    private Role parseRole(String value) {
        try {
            return Role.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Role must be admin or user");
        }
    }
}
