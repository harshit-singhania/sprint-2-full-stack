package com.example.usedcars.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seller_reviews",
        uniqueConstraints = @UniqueConstraint(columnNames = {"reviewer_id", "seller_id"}))
public class SellerReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user leaving the review (must be a buyer who completed a purchase from this seller) */
    @ManyToOne(optional = false)
    @JoinColumn(name = "reviewer_id")
    private AppUser reviewer;

    /** The seller being reviewed */
    @ManyToOne(optional = false)
    @JoinColumn(name = "seller_id")
    private AppUser seller;

    /** Rating 1–5 */
    @Column(nullable = false)
    private int rating;

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }

    public AppUser getReviewer() { return reviewer; }
    public void setReviewer(AppUser reviewer) { this.reviewer = reviewer; }

    public AppUser getSeller() { return seller; }
    public void setSeller(AppUser seller) { this.seller = seller; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
