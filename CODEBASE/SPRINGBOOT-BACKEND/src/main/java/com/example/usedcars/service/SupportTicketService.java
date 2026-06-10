package com.example.usedcars.service;

import com.example.usedcars.dto.TicketMessageRequest;
import com.example.usedcars.dto.TicketRequest;
import com.example.usedcars.dto.TicketUpdateRequest;
import com.example.usedcars.model.SupportTicket;
import java.util.List;

public interface SupportTicketService {
    SupportTicket create(String token, TicketRequest request);
    List<SupportTicket> mine(String token);
    List<SupportTicket> all(String token);
    SupportTicket update(String token, Long ticketId, TicketUpdateRequest request);
    SupportTicket addMessage(String token, Long ticketId, TicketMessageRequest request);
}
