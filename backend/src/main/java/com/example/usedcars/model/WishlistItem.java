package com.example.usedcars.model;

import jakarta.persistence.*;

@Entity
@Table(name = "wishlist_items", uniqueConstraints = @UniqueConstraint(columnNames = {"buyer_id", "car_id"}))
public class WishlistItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private AppUser buyer;

    @ManyToOne(optional = false)
    private Car car;

    public Long getId() { return id; }
    public AppUser getBuyer() { return buyer; }
    public void setBuyer(AppUser buyer) { this.buyer = buyer; }
    public Car getCar() { return car; }
    public void setCar(Car car) { this.car = car; }
}
