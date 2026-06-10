package com.example.usedcars.service.impl;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.dto.PurchaseRequest;
import com.example.usedcars.exception.ApiException;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.ApprovalStatus;
import com.example.usedcars.model.Car;
import com.example.usedcars.model.OrderStatus;
import com.example.usedcars.model.Payment;
import com.example.usedcars.model.PaymentStatus;
import com.example.usedcars.model.PurchaseOrder;
import com.example.usedcars.model.Role;
import com.example.usedcars.repository.CarRepository;
import com.example.usedcars.repository.PaymentRepository;
import com.example.usedcars.repository.PurchaseOrderRepository;
import com.example.usedcars.service.CarService;
import com.example.usedcars.service.NotificationService;
import com.example.usedcars.service.PaymentGateway;
import com.example.usedcars.service.PaymentGatewayRequest;
import com.example.usedcars.service.PaymentGatewayResult;
import com.example.usedcars.service.PurchaseService;
import com.example.usedcars.service.SessionService;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PurchaseServiceImpl implements PurchaseService {
    @Autowired
    private SessionService sessionService;

    @Autowired
    private CarService carService;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PurchaseOrderRepository orderRepository;

    @Autowired
    private PaymentGateway paymentGateway;

    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public Object purchase(String token, Long carId, PurchaseRequest request) {
        AppUser buyer = sessionService.requireRole(token, Role.USER);
        Car car = carService.getCar(carId);
        if (car.getSeller().getId().equals(buyer.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "User cannot buy a car they are selling");
        }
        if (!car.isAvailable() || car.getApprovalStatus() != ApprovalStatus.APPROVED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Car is not available for purchase");
        }

        PaymentGatewayResult gatewayResult = paymentGateway.process(new PaymentGatewayRequest(
                car.getPrice(),
                request.paymentMethod(),
                request.paymentToken(),
                request.paymentSuccessful()
        ));
        Payment payment = new Payment();
        payment.setAmount(car.getPrice());
        payment.setMethod(request.paymentMethod());
        payment.setGatewayName(gatewayResult.gatewayName());
        payment.setGatewayTransactionId(gatewayResult.transactionId());
        payment.setFailureReason(gatewayResult.successful() ? null : gatewayResult.message());
        payment.setStatus(gatewayResult.successful() ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        paymentRepository.save(payment);
        if (!gatewayResult.successful()) {
            return new ApiMessage("Payment failed. Purchase flow cancelled. Payment ID: " + payment.getId());
        }

        // Mark car unavailable immediately to prevent concurrent purchase orders for the same car
        car.setAvailable(false);
        carRepository.save(car);

        PurchaseOrder order = new PurchaseOrder();
        order.setBuyer(buyer);
        order.setSeller(car.getSeller());
        order.setCar(car);
        order.setPayment(payment);
        order.setStatus(OrderStatus.PENDING_ADMIN_APPROVAL);
        order.setFraudAlert(orderRepository.countByBuyer(buyer) + 1 > 3);
        PurchaseOrder savedOrder = orderRepository.save(order);
        payment.setOrderRef(savedOrder);
        paymentRepository.save(payment);
        notificationService.notifyPurchaseCreated(savedOrder);
        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrder> myOrders(String token) {
        AppUser user = sessionService.requireUser(token);
        if (user.getRole() == Role.ADMIN) {
            return orderRepository.findAll();
        }
        List<PurchaseOrder> orders = new ArrayList<>(orderRepository.findByBuyer(user));
        orders.addAll(orderRepository.findBySeller(user));
        return orders;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrder> pendingForSeller(String token) {
        AppUser seller = sessionService.requireRole(token, Role.USER);
        return orderRepository.findBySellerAndStatus(seller, OrderStatus.PENDING_SELLER_APPROVAL);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrder> pendingForAdmin(String token) {
        sessionService.requireRole(token, Role.ADMIN);
        return orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == OrderStatus.PENDING_ADMIN_APPROVAL)
                .toList();
    }

    @Override
    @Transactional
    public PurchaseOrder approveByAdmin(String token, Long orderId) {
        sessionService.requireRole(token, Role.ADMIN);
        PurchaseOrder order = getOrder(orderId);
        if (order.getStatus() != OrderStatus.PENDING_ADMIN_APPROVAL) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order is not pending admin approval");
        }
        order.setStatus(OrderStatus.PENDING_SELLER_APPROVAL);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public PurchaseOrder rejectByAdmin(String token, Long orderId) {
        sessionService.requireRole(token, Role.ADMIN);
        PurchaseOrder order = getOrder(orderId);
        if (order.getStatus() != OrderStatus.PENDING_ADMIN_APPROVAL) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order is not pending admin approval");
        }
        order.setStatus(OrderStatus.REJECTED);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public PurchaseOrder approve(String token, Long orderId) {
        AppUser seller = sessionService.requireRole(token, Role.USER);
        PurchaseOrder order = getOrder(orderId);
        ensureSellerOwnsOrder(seller, order);
        if (order.getStatus() != OrderStatus.PENDING_SELLER_APPROVAL) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order is not pending seller approval");
        }
        if (orderRepository.existsByCarAndStatus(order.getCar(), OrderStatus.APPROVED)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Car has already been sold");
        }
        order.setStatus(OrderStatus.APPROVED);
        order.getCar().setAvailable(false);
        carRepository.save(order.getCar());
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public PurchaseOrder reject(String token, Long orderId) {
        AppUser seller = sessionService.requireRole(token, Role.USER);
        PurchaseOrder order = getOrder(orderId);
        ensureSellerOwnsOrder(seller, order);
        order.setStatus(OrderStatus.REJECTED);
        return orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrder> allOrders(String token) {
        sessionService.requireRole(token, Role.ADMIN);
        return orderRepository.findAll();
    }

    private PurchaseOrder getOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private void ensureSellerOwnsOrder(AppUser seller, PurchaseOrder order) {
        if (!order.getSeller().getId().equals(seller.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User can approve or reject only their own sale requests");
        }
    }
}
