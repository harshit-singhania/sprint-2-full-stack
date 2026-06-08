package com.example.usedcars.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_responses")
public class TicketResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JsonIgnore
    private SupportTicket ticket;

    @ManyToOne(optional = false)
    private AppUser sender;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(nullable = false)
    private LocalDateTime respondedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public SupportTicket getTicket() { return ticket; }
    public void setTicket(SupportTicket ticket) { this.ticket = ticket; }
    public AppUser getSender() { return sender; }
    public void setSender(AppUser sender) { this.sender = sender; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getRespondedAt() { return respondedAt; }
}
