package com.example.usedcars.service.impl;

import com.example.usedcars.dto.AdminUpdateUserRequest;
import com.example.usedcars.dto.CarRequest;
import com.example.usedcars.exception.ApiException;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.Car;
import com.example.usedcars.model.Role;
import com.example.usedcars.repository.CarRepository;
import com.example.usedcars.repository.UserRepository;
import com.example.usedcars.service.AdminService;
import com.example.usedcars.service.SessionService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminServiceImpl implements AdminService {
    @Autowired
    private SessionService sessionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    @Override
    public List<AppUser> getAllUsers(String token) {
        sessionService.requireRole(token, Role.ADMIN);
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public AppUser updateUser(String token, Long userId, AdminUpdateUserRequest request) {
        sessionService.requireRole(token, Role.ADMIN);
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.username() != null && !request.username().equals(user.getUsername())) {
            if (userRepository.findByUsername(request.username()).isPresent()) {
                throw new ApiException(HttpStatus.CONFLICT, "Username already exists");
            }
            user.setUsername(request.username());
        }

        if (request.name() != null) {
            user.setName(request.name());
        }

        if (request.phoneNumber() != null && !request.phoneNumber().equals(user.getPhoneNumber())) {
            if (userRepository.findByPhoneNumber(request.phoneNumber()).isPresent()) {
                throw new ApiException(HttpStatus.CONFLICT, "Phone number already exists");
            }
            user.setPhoneNumber(request.phoneNumber());
        }

        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.email()).isPresent()) {
                throw new ApiException(HttpStatus.CONFLICT, "Email already exists");
            }
            user.setEmail(request.email());
        }

        if (request.role() != null) {
            user.setRole(Role.valueOf(request.role()));
        }

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public Car updateCar(String token, Long carId, CarRequest request) {
        sessionService.requireRole(token, Role.ADMIN);
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Car not found"));

        car.setMake(request.make());
        car.setModel(request.model());
        car.setYear(request.year());
        car.setPrice(request.price());
        car.setMileage(request.mileage());
        car.setColor(request.color());

        return carRepository.save(car);
    }
}
