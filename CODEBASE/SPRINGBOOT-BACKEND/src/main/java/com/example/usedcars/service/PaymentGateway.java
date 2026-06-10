package com.example.usedcars.service;

public interface PaymentGateway {
    PaymentGatewayResult process(PaymentGatewayRequest request);
}
