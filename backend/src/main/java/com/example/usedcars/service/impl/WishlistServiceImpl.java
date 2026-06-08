package com.example.usedcars.service.impl;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.exception.ApiException;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.ApprovalStatus;
import com.example.usedcars.model.Car;
import com.example.usedcars.model.WishlistItem;
import com.example.usedcars.repository.WishlistRepository;
import com.example.usedcars.service.CarService;
import com.example.usedcars.service.SessionService;
import com.example.usedcars.service.WishlistService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WishlistServiceImpl implements WishlistService {
    @Autowired
    private SessionService sessionService;

    @Autowired
    private CarService carService;

    @Autowired
    private WishlistRepository wishlistRepository;

    @Override
    @Transactional
    public WishlistItem add(String token, Long carId) {
        AppUser user = sessionService.requireUser(token);
        Car car = carService.getCar(carId);
        if (car.getApprovalStatus() != ApprovalStatus.APPROVED || !car.isAvailable()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only approved available cars can be added to wishlist");
        }
        return wishlistRepository.findByBuyerAndCar(user, car).orElseGet(() -> {
            WishlistItem item = new WishlistItem();
            item.setBuyer(user);
            item.setCar(car);
            return wishlistRepository.save(item);
        });
    }

    @Override
    @Transactional
    public ApiMessage remove(String token, Long carId) {
        AppUser user = sessionService.requireUser(token);
        Car car = carService.getCar(carId);
        WishlistItem item = wishlistRepository.findByBuyerAndCar(user, car)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Wishlist item not found"));
        wishlistRepository.delete(item);
        return new ApiMessage("Wishlist item removed");
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItem> list(String token) {
        AppUser user = sessionService.requireUser(token);
        return wishlistRepository.findByBuyer(user);
    }
}
