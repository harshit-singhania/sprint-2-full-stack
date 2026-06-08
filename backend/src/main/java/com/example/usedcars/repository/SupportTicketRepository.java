package com.example.usedcars.repository;

import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.SupportTicket;
import com.example.usedcars.model.TicketStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByBuyer(AppUser buyer);
    long countByStatus(TicketStatus status);
}
