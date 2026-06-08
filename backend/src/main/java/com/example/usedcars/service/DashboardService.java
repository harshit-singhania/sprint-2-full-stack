package com.example.usedcars.service;

import com.example.usedcars.dto.AdminDashboardResponse;
import com.example.usedcars.dto.SellerDashboardResponse;

public interface DashboardService {
    SellerDashboardResponse sellerDashboard(String token);
    AdminDashboardResponse adminDashboard(String token);
}
