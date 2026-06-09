package com.example.usedcars.controller;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.dto.CarRequest;
import com.example.usedcars.model.Car;
import com.example.usedcars.model.RecentView;
import com.example.usedcars.service.CarService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cars")
@Validated
public class CarController {
    @Autowired
    private CarService carService;

    @PostMapping
    public ApiMessage add(@RequestHeader("X-Session-Token") String token, @Valid @RequestBody CarRequest request) {
        carService.addCar(token, request);
        return new ApiMessage("Car listing submitted successfully and sent for admin approval");
    }

    @PutMapping("/{carId}")
    public Car update(@RequestHeader("X-Session-Token") String token, @PathVariable @Positive Long carId,
                      @Valid @RequestBody CarRequest request) {
        return carService.updateCar(token, carId, request);
    }

    @DeleteMapping("/{carId}")
    public ApiMessage delete(@RequestHeader("X-Session-Token") String token, @PathVariable @Positive Long carId) {
        return carService.deleteCar(token, carId);
    }

    @GetMapping("/my")
    public List<Car> myCars(@RequestHeader("X-Session-Token") String token) {
        return carService.myCars(token);
    }

    @GetMapping("/available")
    public List<Car> browse(@RequestHeader("X-Session-Token") String token) {
        return carService.browseAvailable(token);
    }

    @GetMapping("/{carId}")
    public Car details(@RequestHeader("X-Session-Token") String token, @PathVariable @Positive Long carId) {
        return carService.viewDetails(token, carId);
    }

    @GetMapping("/recent")
    public List<RecentView> recent(@RequestHeader("X-Session-Token") String token) {
        return carService.recentViews(token);
    }

    @GetMapping("/compare")
    public List<Car> compare(@RequestHeader("X-Session-Token") String token,
                             @RequestParam @Positive Long firstCarId,
                             @RequestParam @Positive Long secondCarId) {
        return carService.compare(token, firstCarId, secondCarId);
    }

    @GetMapping("/popular")
    public List<Car> popular(@RequestHeader("X-Session-Token") String token) {
        return carService.popular(token);
    }
}
