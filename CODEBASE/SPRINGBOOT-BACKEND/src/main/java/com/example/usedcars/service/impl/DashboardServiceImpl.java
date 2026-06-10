package com.example.usedcars.service.impl;

import com.example.usedcars.dto.AdminDashboardResponse;
import com.example.usedcars.dto.DashboardGraphResponse;
import com.example.usedcars.dto.DashboardGraphResponse.DailyCount;
import com.example.usedcars.dto.DashboardGraphResponse.DailyRevenue;
import com.example.usedcars.dto.DashboardGraphResponse.StatusCount;
import com.example.usedcars.dto.SellerDashboardResponse;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.ApprovalStatus;
import com.example.usedcars.model.Car;
import com.example.usedcars.model.OrderStatus;
import com.example.usedcars.model.PurchaseOrder;
import com.example.usedcars.model.Role;
import com.example.usedcars.model.TicketStatus;
import com.example.usedcars.repository.CarRepository;
import com.example.usedcars.repository.PurchaseOrderRepository;
import com.example.usedcars.repository.SupportTicketRepository;
import com.example.usedcars.repository.UserRepository;
import com.example.usedcars.service.DashboardService;
import com.example.usedcars.service.SessionService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardServiceImpl implements DashboardService {

    private static final int GRAPH_DAYS = 30;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;

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

    // ── Seller dashboard ──────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SellerDashboardResponse sellerDashboard(String token) {
        AppUser user = sessionService.requireRole(token, Role.USER);
        return new SellerDashboardResponse(
                carRepository.countBySeller(user),
                carRepository.countBySellerAndAvailableTrue(user),
                orderRepository.findBySellerAndStatus(user, OrderStatus.APPROVED).size(),
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

    // ── Admin dashboard ───────────────────────────────────────────────────────

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

    // ── Admin graph data ──────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public DashboardGraphResponse adminGraphData(String token) {
        sessionService.requireRole(token, Role.ADMIN);

        LocalDateTime since = LocalDate.now().minusDays(GRAPH_DAYS - 1).atStartOfDay();

        // ── 1. Orders per day ─────────────────────────────────────────────────
        List<PurchaseOrder> recentOrders = orderRepository.findOrdersSince(since);
        Map<String, Long> ordersByDay = initDailyCountMap(since);
        for (PurchaseOrder o : recentOrders) {
            String day = o.getCreatedAt().toLocalDate().format(DATE_FMT);
            ordersByDay.merge(day, 1L, Long::sum);
        }
        List<DailyCount> ordersPerDay = toCountList(ordersByDay);

        // ── 2. Revenue per day (APPROVED orders only) ─────────────────────────
        List<PurchaseOrder> approvedOrders = orderRepository.findApprovedOrdersSince(since);
        Map<String, BigDecimal> revenueByDay = initDailyRevenueMap(since);
        for (PurchaseOrder o : approvedOrders) {
            String day = o.getCreatedAt().toLocalDate().format(DATE_FMT);
            revenueByDay.merge(day, o.getPayment().getAmount(), BigDecimal::add);
        }
        List<DailyRevenue> revenuePerDay = toRevenueList(revenueByDay);

        // ── 3. Cars listed per day ────────────────────────────────────────────
        List<Car> recentCars = carRepository.findCarsSince(since);
        Map<String, Long> carsByDay = initDailyCountMap(since);
        for (Car c : recentCars) {
            String day = c.getCreatedAt().toLocalDate().format(DATE_FMT);
            carsByDay.merge(day, 1L, Long::sum);
        }
        List<DailyCount> carsListedPerDay = toCountList(carsByDay);

        // ── 4. Order status breakdown (all time) ──────────────────────────────
        List<StatusCount> orderStatusBreakdown = Arrays.stream(OrderStatus.values())
                .map(s -> new StatusCount(s.name(), orderRepository.countByStatus(s)))
                .toList();

        // ── 5. Car approval breakdown (all time) ──────────────────────────────
        List<StatusCount> carApprovalBreakdown = Arrays.stream(ApprovalStatus.values())
                .map(s -> new StatusCount(s.name(), carRepository.countByApprovalStatus(s)))
                .toList();

        return new DashboardGraphResponse(
                ordersPerDay,
                revenuePerDay,
                carsListedPerDay,
                orderStatusBreakdown,
                carApprovalBreakdown
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Pre-fill a map with every date in the last GRAPH_DAYS days, all set to 0. */
    private Map<String, Long> initDailyCountMap(LocalDateTime since) {
        Map<String, Long> map = new LinkedHashMap<>();
        LocalDate day = since.toLocalDate();
        LocalDate today = LocalDate.now();
        while (!day.isAfter(today)) {
            map.put(day.format(DATE_FMT), 0L);
            day = day.plusDays(1);
        }
        return map;
    }

    private Map<String, BigDecimal> initDailyRevenueMap(LocalDateTime since) {
        Map<String, BigDecimal> map = new LinkedHashMap<>();
        LocalDate day = since.toLocalDate();
        LocalDate today = LocalDate.now();
        while (!day.isAfter(today)) {
            map.put(day.format(DATE_FMT), BigDecimal.ZERO);
            day = day.plusDays(1);
        }
        return map;
    }

    private List<DailyCount> toCountList(Map<String, Long> map) {
        List<DailyCount> list = new ArrayList<>();
        map.forEach((date, count) -> list.add(new DailyCount(date, count)));
        return list;
    }

    private List<DailyRevenue> toRevenueList(Map<String, BigDecimal> map) {
        List<DailyRevenue> list = new ArrayList<>();
        map.forEach((date, revenue) -> list.add(new DailyRevenue(date, revenue)));
        return list;
    }
}
