package com.example.usedcars.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class SimulatedPaymentGateway implements PaymentGateway {
    private static final String GATEWAY_NAME = "SIMULATED_GATEWAY";

    @Override
    public PaymentGatewayResult process(PaymentGatewayRequest request) {
        if (StringUtils.hasText(request.paymentToken())) {
            if (request.paymentToken().trim().toLowerCase().startsWith("fail")) {
                return failed("Gateway rejected payment token");
            }
            return successful();
        }
        if (Boolean.FALSE.equals(request.legacyPaymentSuccessful())) {
            return failed("Payment declined by simulated gateway");
        }
        return successful();
    }

    private PaymentGatewayResult successful() {
        return new PaymentGatewayResult(true, GATEWAY_NAME, "txn_" + UUID.randomUUID(), "Payment successful");
    }

    private PaymentGatewayResult failed(String message) {
        return new PaymentGatewayResult(false, GATEWAY_NAME, null, message);
    }
}
