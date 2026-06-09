package com.example.usedcars.service;

import com.example.usedcars.dto.AdminUpdateUserRequest;
import com.example.usedcars.dto.CarRequest;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.Car;
import java.util.List;

public interface AdminService {
    List<AppUser> getAllUsers(String token);
    AppUser updateUser(String token, Long userId, AdminUpdateUserRequest request);
    Car updateCar(String token, Long carId, CarRequest request);
}
