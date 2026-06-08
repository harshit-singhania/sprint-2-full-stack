package com.example.usedcars.service.impl;

import com.example.usedcars.dto.TicketMessageRequest;
import com.example.usedcars.dto.TicketRequest;
import com.example.usedcars.dto.TicketUpdateRequest;
import com.example.usedcars.exception.ApiException;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.Role;
import com.example.usedcars.model.SupportTicket;
import com.example.usedcars.model.TicketResponse;
import com.example.usedcars.model.TicketStatus;
import com.example.usedcars.repository.SupportTicketRepository;
import com.example.usedcars.service.SessionService;
import com.example.usedcars.service.SupportTicketService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class SupportTicketServiceImpl implements SupportTicketService {
    @Autowired
    private SessionService sessionService;

    @Autowired
    private SupportTicketRepository ticketRepository;

    @Override
    @Transactional
    public SupportTicket create(String token, TicketRequest request) {
        AppUser user = sessionService.requireRole(token, Role.USER);
        SupportTicket ticket = new SupportTicket();
        ticket.setBuyer(user);
        ticket.setSubject(request.subject());
        ticket.setDescription(request.description());
        ticket.setStatus(TicketStatus.OPEN);
        return ticketRepository.save(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicket> mine(String token) {
        AppUser user = sessionService.requireRole(token, Role.USER);
        List<SupportTicket> tickets = ticketRepository.findByBuyer(user);
        tickets.forEach(this::initializeTicketGraph);
        return tickets;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicket> all(String token) {
        sessionService.requireRole(token, Role.ADMIN);
        List<SupportTicket> tickets = ticketRepository.findAll();
        tickets.forEach(this::initializeTicketGraph);
        return tickets;
    }

    @Override
    @Transactional
    public SupportTicket update(String token, Long ticketId, TicketUpdateRequest request) {
        AppUser admin = sessionService.requireRole(token, Role.ADMIN);
        SupportTicket ticket = getTicket(ticketId);
        if (request.status() != null) {
            ticket.setStatus(request.status());
        }
        if (StringUtils.hasText(request.response())) {
            addResponse(ticket, admin, request.response());
        }
        return ticketRepository.save(ticket);
    }

    @Override
    @Transactional
    public SupportTicket addMessage(String token, Long ticketId, TicketMessageRequest request) {
        AppUser sender = sessionService.requireUser(token);
        SupportTicket ticket = getTicket(ticketId);
        if (sender.getRole() != Role.ADMIN && !ticket.getBuyer().getId().equals(sender.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only ticket owner or admin can reply to this ticket");
        }
        addResponse(ticket, sender, request.message());
        return ticketRepository.save(ticket);
    }

    private SupportTicket getTicket(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Support ticket not found"));
    }

    private void addResponse(SupportTicket ticket, AppUser sender, String message) {
        TicketResponse response = new TicketResponse();
        response.setSender(sender);
        response.setTicket(ticket);
        response.setMessage(message);
        ticket.getResponses().add(response);
    }

    private void initializeTicketGraph(SupportTicket ticket) {
        ticket.getResponses().forEach(response -> {
            if (response.getSender() != null) {
                response.getSender().getUsername();
            }
        });
    }
}
