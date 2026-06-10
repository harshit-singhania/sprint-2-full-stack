package com.example.usedcars.repository;

import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.Car;
import com.example.usedcars.model.WishlistItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByBuyer(AppUser buyer);
    Optional<WishlistItem> findByBuyerAndCar(AppUser buyer, Car car);
}
