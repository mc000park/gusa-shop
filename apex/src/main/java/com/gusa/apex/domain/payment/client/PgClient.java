package com.gusa.apex.domain.payment.client;

import com.gusa.apex.domain.payment.dto.PaymentConfirmRequest;
import com.gusa.apex.domain.payment.dto.PaymentConfirmResponse;

public interface PgClient {
    PaymentConfirmResponse confirm(PaymentConfirmRequest request);
    PaymentConfirmResponse getPayment(String paymentId);
}
