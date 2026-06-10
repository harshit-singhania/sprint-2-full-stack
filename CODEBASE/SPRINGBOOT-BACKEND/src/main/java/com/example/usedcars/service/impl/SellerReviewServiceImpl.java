package com.example.usedcars.service.impl;

import com.example.usedcars.dto.SellerReviewRequest;
import com.example.usedcars.exception.ApiException;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.OrderStatus;
import com.example.usedcars.model.SellerReview;
import com.example.usedcars.repository.PurchaseOrderRepository;
import com.example.usedcars.repository.SellerReviewRepository;
import com.example.usedcars.repository.UserRepository;
import com.example.usedcars.service.SellerReviewService;
import com.example.usedcars.service.SessionService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SellerReviewServiceImpl implements SellerReviewService {

    @Autowired
    private SessionService sessionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PurchaseOrderRepository orderRepository;

    @Autowired
    private SellerReviewRepository reviewRepository;

    @Override
    @Transactional
    public SellerReview submitReview(String token, Long sellerId, SellerReviewRequest request) {
        AppUser reviewer = sessionService.requireUser(token);

        AppUser seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Seller not found"));

        if (seller.getId().equals(reviewer.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot review yourself");
        }

        // Reviewer must have at least one APPROVED purchase from this seller
        boolean hasPurchased = !orderRepository
                .findBySellerAndStatus(seller, OrderStatus.APPROVED)
                .stream()
                .filter(o -> o.getBuyer().getId().equals(reviewer.getId()))
                .toList()
                .isEmpty();

        if (!hasPurchased) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "You can only review sellers from whom you have completed a purchase");
        }

        // Upsert: update existing review if one already exists
        SellerReview review = reviewRepository
                .findByReviewerAndSeller(reviewer, seller)
                .orElse(new SellerReview());

        review.setReviewer(reviewer);
        review.setSeller(seller);
        review.setRating(request.rating());
        review.setComment(request.comment());

        return reviewRepository.save(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SellerReview> getReviewsForSeller(String token, Long sellerId) {
        sessionService.requireUser(token);
        AppUser seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Seller not found"));
        return reviewRepository.findBySeller(seller);
    }

    @Override
    @Transactional(readOnly = true)
    public double getAverageRating(String token, Long sellerId) {
        sessionService.requireUser(token);
        AppUser seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Seller not found"));
        Double avg = reviewRepository.averageRatingBySeller(seller);
        return avg != null ? avg : 0.0;
    }
}
