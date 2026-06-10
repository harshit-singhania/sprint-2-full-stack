package com.example.usedcars.controller;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.model.WishlistItem;
import com.example.usedcars.service.WishlistService;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/buyer/wishlist", "/api/user/wishlist"})
@Validated
public class WishlistController {
    @Autowired
    private WishlistService wishlistService;

    @PostMapping("/{carId}")
    public WishlistItem add(@RequestHeader("X-Session-Token") String token, @PathVariable @Positive Long carId) {
        return wishlistService.add(token, carId);
    }

    @DeleteMapping("/{carId}")
    public ApiMessage remove(@RequestHeader("X-Session-Token") String token, @PathVariable @Positive Long carId) {
        return wishlistService.remove(token, carId);
    }

    @GetMapping
    public List<WishlistItem> list(@RequestHeader("X-Session-Token") String token) {
        return wishlistService.list(token);
    }
}
