package com.example.usedcars.dto;

import com.example.usedcars.model.TicketStatus;

public record TicketUpdateRequest(TicketStatus status, String response) {
}
