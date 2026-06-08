package com.example.usedcars.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recent_views")
public class RecentView {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private AppUser user;

    @ManyToOne(optional = false)
    private Car car;

    @Column(nullable = false)
    private String sessionToken;

    @Column(nullable = false)
    private LocalDateTime viewedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public Car getCar() { return car; }
    public void setCar(Car car) { this.car = car; }
    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }
    public LocalDateTime getViewedAt() { return viewedAt; }
    public void setViewedAt(LocalDateTime viewedAt) { this.viewedAt = viewedAt; }
}
