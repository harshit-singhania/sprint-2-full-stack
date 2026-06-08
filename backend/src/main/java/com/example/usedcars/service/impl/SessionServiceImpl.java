package com.example.usedcars.service.impl;

import com.example.usedcars.exception.ApiException;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.Role;
import com.example.usedcars.repository.UserRepository;
import com.example.usedcars.service.SessionService;
import com.example.usedcars.service.SessionTokenService;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class SessionServiceImpl implements SessionService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionTokenService sessionTokenService;

    @Override
    public AppUser requireUser(String token) {
        if (!StringUtils.hasText(token)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        AppUser user = userRepository.findByActiveSessionTokenHash(sessionTokenService.hashToken(token))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired session"));
        if (user.getActiveSessionExpiresAt() == null || user.getActiveSessionExpiresAt().isBefore(LocalDateTime.now())) {
            user.setActiveSessionTokenHash(null);
            user.setActiveSessionExpiresAt(null);
            userRepository.save(user);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired session");
        }
        return user;
    }

    @Override
    public AppUser requireRole(String token, Role role) {
        AppUser user = requireUser(token);
        if (user.getRole() != role) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only " + role.name().toLowerCase() + " users can access this feature");
        }
        return user;
    }

    @Override
    public AppUser requireAnyRole(String token, Role... roles) {
        AppUser user = requireUser(token);
        for (Role role : roles) {
            if (user.getRole() == role) {
                return user;
            }
        }
        throw new ApiException(HttpStatus.FORBIDDEN, "Unauthorized role for this feature");
    }
}
