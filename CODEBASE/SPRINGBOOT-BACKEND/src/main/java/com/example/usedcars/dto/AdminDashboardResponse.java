package com.example.usedcars.dto;

import java.math.BigDecimal;

public record AdminDashboardResponse(
        long totalUsers,
        long admins,
        long users,
        long totalCars,
        long availableCars,
        long soldCars,
        long pendingCarApprovals,
        long rejectedCars,
        long totalOrders,
        long pendingAdminOrders,
        long pendingOrders,
        long approvedOrders,
        long rejectedOrders,
        long cancelledOrders,
        long fraudAlerts,
        long openTickets,
        long closedTickets,
        BigDecimal totalRevenue
) {
}
