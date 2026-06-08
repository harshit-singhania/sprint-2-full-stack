package com.example.usedcars.service;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.dto.CarRequest;
import com.example.usedcars.model.Car;
import com.example.usedcars.model.RecentView;
import java.util.List;

public interface CarService {
    Car addCar(String token, CarRequest request);
    Car updateCar(String token, Long carId, CarRequest request);
    ApiMessage deleteCar(String token, Long carId);
    List<Car> myCars(String token);
    List<Car> browseAvailable(String token);
    Car viewDetails(String token, Long carId);
    List<RecentView> recentViews(String token);
    List<Car> compare(String token, Long firstCarId, Long secondCarId);
    List<Car> popular(String token);
    List<Car> pendingApproval(String token);
    Car approveListing(String token, Long carId);
    Car rejectListing(String token, Long carId);
    Car getCar(Long carId);
}
