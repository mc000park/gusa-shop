package com.gusa.apex.domain.payment.client;

import com.gusa.apex.domain.payment.dto.PaymentConfirmRequest;
import com.gusa.apex.domain.payment.dto.PaymentConfirmResponse;
import com.gusa.apex.global.exception.CustomException;
import com.gusa.apex.global.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Instant;
import java.util.Base64;
import java.util.Map;

/**
 * 토스페이먼츠 V1 REST API 클라이언트
 * Docs: https://docs.tosspayments.com/reference
 */
@Slf4j
@Component
public class TossPaymentsClient implements PgClient {

    private final RestClient restClient;
    private final String secretKey;

    public TossPaymentsClient(
            @Qualifier("tossRestClient") RestClient restClient,
            @Value("${pg.toss.secret-key}") String secretKey
    ) {
        this.restClient = restClient;
        this.secretKey = secretKey;
    }

    @Override
    public PaymentConfirmResponse confirm(PaymentConfirmRequest request) {
        Map<String, Object> body = Map.of(
                "paymentKey", request.getPaymentId(),
                "orderId", request.getOrderId(),
                "amount", request.getAmount()
        );

        try {
            Map<?, ?> response = restClient.post()
                    .uri("/payments/confirm")
                    .header("Authorization", basicAuth(secretKey))
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            log.info("[Toss] 결제 승인 완료 paymentKey={}", request.getPaymentId());

            return PaymentConfirmResponse.builder()
                    .paymentId(request.getPaymentId())
                    .orderId(request.getOrderId())
                    .amount(request.getAmount())
                    .status("DONE")
                    .pgProvider("toss")
                    .approvedAt(response != null ? String.valueOf(response.get("approvedAt")) : Instant.now().toString())
                    .build();

        } catch (RestClientException e) {
            log.error("[Toss] 결제 승인 실패 paymentKey={} error={}", request.getPaymentId(), e.getMessage());
            throw new CustomException(ErrorCode.PAYMENT_FAILED);
        }
    }

    @Override
    public PaymentConfirmResponse getPayment(String paymentId) {
        try {
            Map<?, ?> response = restClient.get()
                    .uri("/payments/{paymentKey}", paymentId)
                    .header("Authorization", basicAuth(secretKey))
                    .retrieve()
                    .body(Map.class);

            if (response == null) throw new CustomException(ErrorCode.PAYMENT_NOT_FOUND);

            return PaymentConfirmResponse.builder()
                    .paymentId(paymentId)
                    .orderId(String.valueOf(response.get("orderId")))
                    .amount(Long.parseLong(String.valueOf(response.get("totalAmount"))))
                    .status(String.valueOf(response.get("status")))
                    .pgProvider("toss")
                    .approvedAt(String.valueOf(response.get("approvedAt")))
                    .build();

        } catch (RestClientException e) {
            log.error("[Toss] 결제 조회 실패 paymentId={}", paymentId);
            throw new CustomException(ErrorCode.PAYMENT_NOT_FOUND);
        }
    }

    private String basicAuth(String key) {
        String encoded = Base64.getEncoder().encodeToString((key + ":").getBytes());
        return "Basic " + encoded;
    }
}
