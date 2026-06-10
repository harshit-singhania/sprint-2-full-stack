package com.example.usedcars.service.impl;

import com.example.usedcars.dto.AdminUpdateUserRequest;
import com.example.usedcars.exception.ApiException;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.Role;
import com.example.usedcars.repository.UserRepository;
import com.example.usedcars.service.AdminUserService;
import com.example.usedcars.service.SessionService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    @Autowired
    private SessionService sessionService;

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional(readOnly = true)
    public List<AppUser> listAllUsers(String token) {
        sessionService.requireRole(token, Role.ADMIN);
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public AppUser getUser(String token, Long userId) {
        sessionService.requireRole(token, Role.ADMIN);
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @Override
    @Transactional
    public AppUser updateUser(String token, Long userId, AdminUpdateUserRequest request) {
        sessionService.requireRole(token, Role.ADMIN);

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        // Update name if provided
        if (StringUtils.hasText(request.name())) {
            user.setName(request.name().trim());
        }

        // Update phone — check uniqueness first
        if (StringUtils.hasText(request.phoneNumber())) {
            String newPhone = request.phoneNumber().trim();
            if (!newPhone.equals(user.getPhoneNumber())
                    && userRepository.existsByPhoneNumber(newPhone)) {
                throw new ApiException(HttpStatus.CONFLICT, "Phone number already in use");
            }
            user.setPhoneNumber(newPhone);
        }

        // Update email — check uniqueness first
        if (StringUtils.hasText(request.email())) {
            String newEmail = request.email().trim();
            if (!newEmail.equals(user.getEmail())
                    && userRepository.existsByEmail(newEmail)) {
                throw new ApiException(HttpStatus.CONFLICT, "Email already in use");
            }
            user.setEmail(newEmail);
        }

        // Reset password if provided (already validated ≥10 chars by @Size on the DTO)
        if (StringUtils.hasText(request.newPassword())) {
            user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
            // Force re-login after admin password reset
            user.setActiveSessionTokenHash(null);
            user.setActiveSessionExpiresAt(null);
        }

        return userRepository.save(user);
    }
}
