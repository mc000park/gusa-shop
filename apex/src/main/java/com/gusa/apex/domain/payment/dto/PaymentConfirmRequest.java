package com.gusa.apex.domain.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentConfirmRequest {

    @NotBlank
    private String paymentId;    // PG사로부터 받은 결제 키

    @NotBlank
    private String orderId;

    @Positive
    private long amount;

    private String pgProvider;   // toss | kakao | portone

    private String userId;
}
