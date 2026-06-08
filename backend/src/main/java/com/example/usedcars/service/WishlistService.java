package com.example.usedcars.service;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.model.WishlistItem;
import java.util.List;

public interface WishlistService {
    WishlistItem add(String token, Long carId);
    ApiMessage remove(String token, Long carId);
    List<WishlistItem> list(String token);
}
