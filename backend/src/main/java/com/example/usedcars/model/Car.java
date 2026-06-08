package com.example.usedcars.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cars")
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String make;

    @Column(nullable = false)
    private String model;

    @Column(name = "manufacturing_year", nullable = false)
    private int year;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private int mileage;

    @Column(nullable = false)
    private String color;

    @Column(nullable = false)
    private boolean available = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING_ADMIN_APPROVAL;

    @Column(nullable = false)
    private long viewCount = 0;

    @ManyToOne(optional = false)
    private AppUser seller;

    public Long getId() { return id; }
    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public int getMileage() { return mileage; }
    public void setMileage(int mileage) { this.mileage = mileage; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public ApprovalStatus getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(ApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }
    public long getViewCount() { return viewCount; }
    public void setViewCount(long viewCount) { this.viewCount = viewCount; }
    public AppUser getSeller() { return seller; }
    public void setSeller(AppUser seller) { this.seller = seller; }
}
