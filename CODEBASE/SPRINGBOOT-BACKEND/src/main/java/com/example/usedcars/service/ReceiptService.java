package com.example.usedcars.service;

import com.example.usedcars.dto.ReceiptResponse;

public interface ReceiptService {

    /**
     * Generate a receipt for the given order.
     * Any authenticated user who is the buyer OR seller of the order, or an ADMIN, can access it.
     */
    ReceiptResponse getReceipt(String token, Long orderId);
}
