package com.example.usedcars.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "support_tickets")
public class SupportTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private AppUser buyer;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, length = 3000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status = TicketStatus.OPEN;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<TicketResponse> responses = new ArrayList<>();

    public Long getId() { return id; }
    public AppUser getBuyer() { return buyer; }
    public void setBuyer(AppUser buyer) { this.buyer = buyer; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<TicketResponse> getResponses() { return responses; }
}
