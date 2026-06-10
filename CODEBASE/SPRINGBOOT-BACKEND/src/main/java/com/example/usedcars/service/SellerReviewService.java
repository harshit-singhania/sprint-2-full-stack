package com.example.usedcars.service;

import com.example.usedcars.dto.SellerReviewRequest;
import com.example.usedcars.model.SellerReview;
import java.util.List;

public interface SellerReviewService {

    /** Submit or update a review for a seller. Reviewer must have a completed purchase from that seller. */
    SellerReview submitReview(String token, Long sellerId, SellerReviewRequest request);

    /** Get all reviews for a given seller (public — any authenticated user). */
    List<SellerReview> getReviewsForSeller(String token, Long sellerId);

    /** Get average rating for a given seller. */
    double getAverageRating(String token, Long sellerId);
}
