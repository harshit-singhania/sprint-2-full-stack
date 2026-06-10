package com.example.usedcars.service;

import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.Role;

public interface SessionService {
    AppUser requireUser(String token);
    AppUser requireRole(String token, Role role);
    AppUser requireAnyRole(String token, Role... roles);
}
