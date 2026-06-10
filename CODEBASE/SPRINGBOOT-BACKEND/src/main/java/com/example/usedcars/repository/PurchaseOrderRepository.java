package com.example.usedcars.repository;

import com.example.usedcars.model.Car;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.OrderStatus;
import com.example.usedcars.model.PurchaseOrder;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    long countByBuyer(AppUser buyer);
    long countBySeller(AppUser seller);
    long countByStatus(OrderStatus status);
    long countByFraudAlertTrue();
    long countBySellerAndFraudAlertTrue(AppUser seller);
    List<PurchaseOrder> findByBuyer(AppUser buyer);
    List<PurchaseOrder> findBySeller(AppUser seller);
    List<PurchaseOrder> findBySellerAndStatus(AppUser seller, OrderStatus status);
    boolean existsByCarAndStatus(Car car, OrderStatus status);

    @Query("select coalesce(sum(o.payment.amount), 0) from PurchaseOrder o where o.status = :status")
    BigDecimal sumPaymentAmountByStatus(@Param("status") OrderStatus status);

    @Query("select coalesce(sum(o.payment.amount), 0) from PurchaseOrder o where o.seller = :seller and o.status = :status")
    BigDecimal sumPaymentAmountBySellerAndStatus(@Param("seller") AppUser seller, @Param("status") OrderStatus status);

    // ── Graph queries ─────────────────────────────────────────────────────────

    /** All orders created in the last N days (for daily order count grouping). */
    @Query("select o from PurchaseOrder o where o.createdAt >= :since order by o.createdAt asc")
    List<PurchaseOrder> findOrdersSince(@Param("since") LocalDateTime since);

    /** All APPROVED orders with payment amounts in the last N days (for revenue grouping). */
    @Query("select o from PurchaseOrder o where o.status = 'APPROVED' and o.createdAt >= :since order by o.createdAt asc")
    List<PurchaseOrder> findApprovedOrdersSince(@Param("since") LocalDateTime since);
}
