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
 * 카카오페이 REST API 클라이언트
 * Docs: https://developers.kakao.com/docs/latest/ko/kakaopay/common
 */
@Slf4j
@Component
public class KakaoPayClient implements PgClient {

    private final RestClient restClient;
    private final String adminKey;

    public KakaoPayClient(
            @Qualifier("kakaoRestClient") RestClient restClient,
            @Value("${pg.kakao.admin-key}") String adminKey
    ) {
        this.restClient = restClient;
        this.adminKey = adminKey;
    }

    @Override
    public PaymentConfirmResponse confirm(PaymentConfirmRequest request) {
        // 카카오페이 approve — pg_token은 결제 준비(ready) 단계에서 수신
        Map<String, Object> body = Map.of(
                "cid", "TC0ONETIME",
                "tid", request.getPaymentId(),
                "partner_order_id", request.getOrderId(),
                "pg_token", request.getPaymentId()
        );

        try {
            Map<?, ?> response = restClient.post()
                    .uri("/approve")
                    .header("Authorization", "KakaoAK " + adminKey)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            log.info("[Kakao] 결제 승인 완료 tid={}", request.getPaymentId());

            return PaymentConfirmResponse.builder()
                    .paymentId(request.getPaymentId())
                    .orderId(request.getOrderId())
                    .amount(request.getAmount())
                    .status("DONE")
                    .pgProvider("kakao")
                    .approvedAt(response != null ? String.valueOf(response.get("approved_at")) : null)
                    .build();

        } catch (RestClientException e) {
            log.error("[Kakao] 결제 승인 실패 tid={} error={}", request.getPaymentId(), e.getMessage());
            throw new CustomException(ErrorCode.PAYMENT_FAILED);
        }
    }

    @Override
    public PaymentConfirmResponse getPayment(String paymentId) {
        try {
            Map<?, ?> response = restClient.post()
                    .uri("/order")
                    .header("Authorization", "KakaoAK " + adminKey)
                    .body(Map.of("cid", "TC0ONETIME", "tid", paymentId))
                    .retrieve()
                    .body(Map.class);

            if (response == null) throw new CustomException(ErrorCode.PAYMENT_NOT_FOUND);

            Map<?, ?> amount = (Map<?, ?>) response.get("amount");
            long total = amount != null ? Long.parseLong(String.valueOf(amount.get("total"))) : 0L;

            return PaymentConfirmResponse.builder()
                    .paymentId(paymentId)
                    .orderId(String.valueOf(response.get("partner_order_id")))
                    .amount(total)
                    .status(String.valueOf(response.get("status")))
                    .pgProvider("kakao")
                    .build();

        } catch (RestClientException e) {
            log.error("[Kakao] 결제 조회 실패 tid={}", paymentId);
            throw new CustomException(ErrorCode.PAYMENT_NOT_FOUND);
        }
    }
}
