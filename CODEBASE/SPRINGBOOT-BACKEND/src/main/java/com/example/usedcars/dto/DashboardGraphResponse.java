package com.example.usedcars.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardGraphResponse(

        /** Orders per day for the last 30 days */
        List<DailyCount> ordersPerDay,

        /** Revenue per day for the last 30 days (APPROVED orders only) */
        List<DailyRevenue> revenuePerDay,

        /** Cars listed per day for the last 30 days */
        List<DailyCount> carsListedPerDay,

        /** Order status breakdown for pie / donut chart */
        List<StatusCount> orderStatusBreakdown,

        /** Car approval status breakdown */
        List<StatusCount> carApprovalBreakdown
) {

    public record DailyCount(String date, long count) {}

    public record DailyRevenue(String date, BigDecimal revenue) {}

    public record StatusCount(String status, long count) {}
}
