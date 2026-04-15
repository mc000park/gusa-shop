package com.gusa.apex.domain.payment.service;

import com.gusa.apex.domain.payment.dto.PaymentConfirmRequest;
import com.gusa.apex.domain.payment.dto.PaymentConfirmResponse;

import java.util.List;

public interface PaymentService {
    PaymentConfirmResponse confirm(PaymentConfirmRequest request, String userId);
    PaymentConfirmResponse getPayment(String paymentId, String userId);
    List<PaymentConfirmResponse> getPaymentsByUser(String userId);
    PaymentConfirmResponse cancelPayment(String paymentId, String userId);
}
