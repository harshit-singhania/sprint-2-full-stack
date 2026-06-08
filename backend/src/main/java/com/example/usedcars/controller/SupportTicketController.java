package com.example.usedcars.controller;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.dto.TicketMessageRequest;
import com.example.usedcars.dto.TicketRequest;
import com.example.usedcars.dto.TicketUpdateRequest;
import com.example.usedcars.model.SupportTicket;
import com.example.usedcars.service.SupportTicketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Validated
public class SupportTicketController {
    @Autowired
    private SupportTicketService ticketService;

    @PostMapping({"/buyer/support-tickets", "/user/support-tickets"})
    public SupportTicket create(@RequestHeader("X-Session-Token") String token,
                                @Valid @RequestBody TicketRequest request) {
        return ticketService.create(token, request);
    }

    @GetMapping({"/buyer/support-tickets", "/user/support-tickets"})
    public List<SupportTicket> mine(@RequestHeader("X-Session-Token") String token) {
        return ticketService.mine(token);
    }

    @GetMapping("/admin/support-tickets")
    public Object all(@RequestHeader("X-Session-Token") String token) {
        List<SupportTicket> tickets = ticketService.all(token);
        return tickets.isEmpty() ? new ApiMessage("No support tickets found") : tickets;
    }

    @PatchMapping("/admin/support-tickets/{ticketId}")
    public SupportTicket update(@RequestHeader("X-Session-Token") String token,
                                @PathVariable @Positive Long ticketId,
                                @Valid @RequestBody TicketUpdateRequest request) {
        return ticketService.update(token, ticketId, request);
    }

    @PostMapping("/support-tickets/{ticketId}/messages")
    public SupportTicket addMessage(@RequestHeader("X-Session-Token") String token,
                                    @PathVariable @Positive Long ticketId,
                                    @Valid @RequestBody TicketMessageRequest request) {
        return ticketService.addMessage(token, ticketId, request);
    }
}
