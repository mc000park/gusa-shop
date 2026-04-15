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

import java.util.Map;

/**
 * 포트원(PortOne) V2 REST API 클라이언트
 * KG이니시스, 나이스페이, 네이버페이 등 지원
 * Docs: https://developers.portone.io/api/rest-v2
 */
@Slf4j
@Component
public class PortOneClient implements PgClient {

    private final RestClient restClient;
    private final String apiSecret;

    public PortOneClient(
            @Qualifier("portoneRestClient") RestClient restClient,
            @Value("${pg.portone.secret}") String apiSecret
    ) {
        this.restClient = restClient;
        this.apiSecret = apiSecret;
    }

    @Override
    public PaymentConfirmResponse confirm(PaymentConfirmRequest request) {
        Map<String, Object> body = Map.of(
                "orderId", request.getOrderId(),
                "amount", Map.of("total", request.getAmount())
        );

        try {
            Map<?, ?> response = restClient.post()
                    .uri("/payments/{paymentId}/confirm", request.getPaymentId())
                    .header("Authorization", "PortOne " + apiSecret)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            log.info("[PortOne] 결제 승인 완료 paymentId={}", request.getPaymentId());

            return PaymentConfirmResponse.builder()
                    .paymentId(request.getPaymentId())
                    .orderId(request.getOrderId())
                    .amount(request.getAmount())
                    .status("DONE")
                    .pgProvider(request.getPgProvider())
                    .approvedAt(response != null ? String.valueOf(response.get("paidAt")) : null)
                    .build();

        } catch (RestClientException e) {
            log.error("[PortOne] 결제 승인 실패 paymentId={} error={}", request.getPaymentId(), e.getMessage());
            throw new CustomException(ErrorCode.PAYMENT_FAILED);
        }
    }

    @Override
    public PaymentConfirmResponse getPayment(String paymentId) {
        try {
            Map<?, ?> response = restClient.get()
                    .uri("/payments/{paymentId}", paymentId)
                    .header("Authorization", "PortOne " + apiSecret)
                    .retrieve()
                    .body(Map.class);

            if (response == null) throw new CustomException(ErrorCode.PAYMENT_NOT_FOUND);

            Map<?, ?> amountMap = (Map<?, ?>) response.get("amount");
            long total = amountMap != null ? Long.parseLong(String.valueOf(amountMap.get("total"))) : 0L;

            return PaymentConfirmResponse.builder()
                    .paymentId(paymentId)
                    .orderId(String.valueOf(response.get("orderId")))
                    .amount(total)
                    .status(String.valueOf(response.get("status")))
                    .pgProvider("portone")
                    .approvedAt(String.valueOf(response.get("paidAt")))
                    .build();

        } catch (RestClientException e) {
            log.error("[PortOne] 결제 조회 실패 paymentId={}", paymentId);
            throw new CustomException(ErrorCode.PAYMENT_NOT_FOUND);
        }
    }
}
