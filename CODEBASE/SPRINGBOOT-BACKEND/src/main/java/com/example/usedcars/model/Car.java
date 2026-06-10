package com.example.usedcars.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    // ── Seller-declared condition fields ──────────────────────────────────────

    /** Overall physical condition of the car as declared by the seller. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CarCondition condition = CarCondition.GOOD;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FuelType fuelType = FuelType.PETROL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransmissionType transmission = TransmissionType.MANUAL;

    /** e.g. SEDAN, SUV, HATCHBACK, COUPE, CONVERTIBLE, TRUCK, VAN */
    @Column
    private String bodyType;

    /** Number of previous registered owners. */
    @Column(nullable = false)
    private int numberOfOwners = 1;

    /** Engine displacement in cc, e.g. 1497 */
    @Column
    private Integer engineCc;

    /** Whether the car has valid insurance at the time of listing. */
    @Column(nullable = false)
    private boolean insured = false;

    /** Whether the car has a valid pollution-under-control certificate. */
    @Column(nullable = false)
    private boolean pucValid = false;

    /** Free-text seller description / remarks about the car. */
    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ── Getters & Setters ─────────────────────────────────────────────────────

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

    public CarCondition getCondition() { return condition; }
    public void setCondition(CarCondition condition) { this.condition = condition; }

    public FuelType getFuelType() { return fuelType; }
    public void setFuelType(FuelType fuelType) { this.fuelType = fuelType; }

    public TransmissionType getTransmission() { return transmission; }
    public void setTransmission(TransmissionType transmission) { this.transmission = transmission; }

    public String getBodyType() { return bodyType; }
    public void setBodyType(String bodyType) { this.bodyType = bodyType; }

    public int getNumberOfOwners() { return numberOfOwners; }
    public void setNumberOfOwners(int numberOfOwners) { this.numberOfOwners = numberOfOwners; }

    public Integer getEngineCc() { return engineCc; }
    public void setEngineCc(Integer engineCc) { this.engineCc = engineCc; }

    public boolean isInsured() { return insured; }
    public void setInsured(boolean insured) { this.insured = insured; }

    public boolean isPucValid() { return pucValid; }
    public void setPucValid(boolean pucValid) { this.pucValid = pucValid; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
