package com.example.usedcars.repository;

import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.ApprovalStatus;
import com.example.usedcars.model.Car;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CarRepository extends JpaRepository<Car, Long> {
    List<Car> findByAvailableTrueAndApprovalStatus(ApprovalStatus approvalStatus);
    List<Car> findByAvailableTrueAndApprovalStatusAndSellerNot(ApprovalStatus approvalStatus, AppUser seller);
    List<Car> findTop5ByOrderByViewCountDesc();
    boolean existsByIdAndSeller(Long id, AppUser seller);
    long countBySeller(AppUser seller);
    long countBySellerAndAvailableTrue(AppUser seller);
    long countBySellerAndAvailableFalse(AppUser seller);
    long countBySellerAndApprovalStatus(AppUser seller, ApprovalStatus approvalStatus);
    long countByAvailableTrue();
    long countByAvailableFalse();
    long countByApprovalStatus(ApprovalStatus approvalStatus);
    List<Car> findByApprovalStatus(ApprovalStatus approvalStatus);

    // ── Graph query ───────────────────────────────────────────────────────────

    /** All cars listed (created) since the given timestamp, ordered by creation time. */
    @Query("select c from Car c where c.createdAt >= :since order by c.createdAt asc")
    List<Car> findCarsSince(@Param("since") LocalDateTime since);
}
