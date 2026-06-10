package com.example.usedcars.dto;

import com.example.usedcars.model.Car;

public record CarListingResponse(String message, Car car) {
}
