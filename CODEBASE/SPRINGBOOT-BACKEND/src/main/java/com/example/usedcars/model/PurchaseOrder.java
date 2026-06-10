package com.example.usedcars.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private AppUser buyer;

    @ManyToOne(optional = false)
    private AppUser seller;

    @ManyToOne(optional = false)
    private Car car;

    @OneToOne(optional = false)
    private Payment payment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING_ADMIN_APPROVAL;

    @Column(nullable = false)
    private boolean fraudAlert;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public AppUser getBuyer() { return buyer; }
    public void setBuyer(AppUser buyer) { this.buyer = buyer; }
    public AppUser getSeller() { return seller; }
    public void setSeller(AppUser seller) { this.seller = seller; }
    public Car getCar() { return car; }
    public void setCar(Car car) { this.car = car; }
    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public boolean isFraudAlert() { return fraudAlert; }
    public void setFraudAlert(boolean fraudAlert) { this.fraudAlert = fraudAlert; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
