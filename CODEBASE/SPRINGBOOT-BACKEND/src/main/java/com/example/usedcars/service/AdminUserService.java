package com.example.usedcars.service;

import com.example.usedcars.dto.AdminUpdateUserRequest;
import com.example.usedcars.model.AppUser;
import java.util.List;

public interface AdminUserService {

    /** List all registered users. Admin only. */
    List<AppUser> listAllUsers(String token);

    /** Get a single user by ID. Admin only. */
    AppUser getUser(String token, Long userId);

    /** Update a user's editable fields (name, phone, email, password). Admin only. */
    AppUser updateUser(String token, Long userId, AdminUpdateUserRequest request);
}
