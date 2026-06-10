package com.example.usedcars.repository;

import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.SellerReview;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SellerReviewRepository extends JpaRepository<SellerReview, Long> {

    List<SellerReview> findBySeller(AppUser seller);

    Optional<SellerReview> findByReviewerAndSeller(AppUser reviewer, AppUser seller);

    boolean existsByReviewerAndSeller(AppUser reviewer, AppUser seller);

    @Query("select coalesce(avg(r.rating), 0) from SellerReview r where r.seller = :seller")
    Double averageRatingBySeller(@Param("seller") AppUser seller);
}
