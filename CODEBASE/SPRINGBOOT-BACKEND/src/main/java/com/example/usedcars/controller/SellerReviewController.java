package com.example.usedcars.controller;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.dto.SellerReviewRequest;
import com.example.usedcars.model.SellerReview;
import com.example.usedcars.service.SellerReviewService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews/sellers")
@Validated
public class SellerReviewController {

    @Autowired
    private SellerReviewService reviewService;

    /** Submit or update a review for a seller. */
    @PostMapping("/{sellerId}")
    public SellerReview submitReview(
            @RequestHeader("X-Session-Token") String token,
            @PathVariable @Positive Long sellerId,
            @Valid @RequestBody SellerReviewRequest request) {
        return reviewService.submitReview(token, sellerId, request);
    }

    /** Get all reviews for a seller. */
    @GetMapping("/{sellerId}")
    public List<SellerReview> getReviews(
            @RequestHeader("X-Session-Token") String token,
            @PathVariable @Positive Long sellerId) {
        return reviewService.getReviewsForSeller(token, sellerId);
    }

    /** Get average rating for a seller. */
    @GetMapping("/{sellerId}/average")
    public Map<String, Object> getAverageRating(
            @RequestHeader("X-Session-Token") String token,
            @PathVariable @Positive Long sellerId) {
        double avg = reviewService.getAverageRating(token, sellerId);
        return Map.of("sellerId", sellerId, "averageRating", avg);
    }
}
