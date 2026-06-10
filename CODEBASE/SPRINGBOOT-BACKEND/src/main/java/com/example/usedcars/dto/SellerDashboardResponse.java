package com.example.usedcars.dto;

import java.math.BigDecimal;

public record SellerDashboardResponse(
        long totalListings,
        long availableListings,
        long soldListings,
        long pendingListings,
        long rejectedListings,
        long pendingAdminOrders,
        long pendingApprovals,
        long approvedOrders,
        long rejectedOrders,
        long fraudAlerts,
        BigDecimal totalRevenue
) {
}
