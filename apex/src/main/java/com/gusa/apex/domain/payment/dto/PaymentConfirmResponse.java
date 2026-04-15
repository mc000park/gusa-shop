package com.gusa.apex.domain.payment.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentConfirmResponse {
    private String paymentId;
    private String orderId;
    private long amount;
    private String status;      // DONE | CANCELED | FAILED
    private String pgProvider;
    private String approvedAt;
}
