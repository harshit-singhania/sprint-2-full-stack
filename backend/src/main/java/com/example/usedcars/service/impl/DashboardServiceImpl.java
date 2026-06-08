package com.example.usedcars.service.impl;

import com.example.usedcars.dto.AdminDashboardResponse;
import com.example.usedcars.dto.SellerDashboardResponse;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.ApprovalStatus;
import com.example.usedcars.model.OrderStatus;
import com.example.usedcars.model.Role;
import com.example.usedcars.model.TicketStatus;
import com.example.usedcars.repository.CarRepository;
import com.example.usedcars.repository.PurchaseOrderRepository;
import com.example.usedcars.repository.SupportTicketRepository;
import com.example.usedcars.repository.UserRepository;
import com.example.usedcars.service.DashboardService;
import com.example.usedcars.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardServiceImpl implements DashboardService {
    @Autowired
    private SessionService sessionService;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private PurchaseOrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupportTicketRepository ticketRepository;

    @Override
    @Transactional(readOnly = true)
    public SellerDashboardResponse sellerDashboard(String token) {
        AppUser user = sessionService.requireRole(token, Role.USER);
        return new SellerDashboardResponse(
                carRepository.countBySeller(user),
                carRepository.countBySellerAndAvailableTrue(user),
                carRepository.countBySellerAndAvailableFalse(user),
                carRepository.countBySellerAndApprovalStatus(user, ApprovalStatus.PENDING_ADMIN_APPROVAL),
                carRepository.countBySellerAndApprovalStatus(user, ApprovalStatus.REJECTED),
                orderRepository.findBySellerAndStatus(user, OrderStatus.PENDING_ADMIN_APPROVAL).size(),
                orderRepository.findBySellerAndStatus(user, OrderStatus.PENDING_SELLER_APPROVAL).size(),
                orderRepository.findBySellerAndStatus(user, OrderStatus.APPROVED).size(),
                orderRepository.findBySellerAndStatus(user, OrderStatus.REJECTED).size(),
                orderRepository.countBySellerAndFraudAlertTrue(user),
                orderRepository.sumPaymentAmountBySellerAndStatus(user, OrderStatus.APPROVED)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse adminDashboard(String token) {
        sessionService.requireRole(token, Role.ADMIN);
        return new AdminDashboardResponse(
                userRepository.count(),
                userRepository.countByRole(Role.ADMIN),
                userRepository.countByRole(Role.USER),
                carRepository.count(),
                carRepository.countByAvailableTrue(),
                carRepository.countByAvailableFalse(),
                carRepository.countByApprovalStatus(ApprovalStatus.PENDING_ADMIN_APPROVAL),
                carRepository.countByApprovalStatus(ApprovalStatus.REJECTED),
                orderRepository.count(),
                orderRepository.countByStatus(OrderStatus.PENDING_ADMIN_APPROVAL),
                orderRepository.countByStatus(OrderStatus.PENDING_SELLER_APPROVAL),
                orderRepository.countByStatus(OrderStatus.APPROVED),
                orderRepository.countByStatus(OrderStatus.REJECTED),
                orderRepository.countByStatus(OrderStatus.CANCELLED),
                orderRepository.countByFraudAlertTrue(),
                ticketRepository.countByStatus(TicketStatus.OPEN),
                ticketRepository.countByStatus(TicketStatus.CLOSED),
                orderRepository.sumPaymentAmountByStatus(OrderStatus.APPROVED)
        );
    }
}
