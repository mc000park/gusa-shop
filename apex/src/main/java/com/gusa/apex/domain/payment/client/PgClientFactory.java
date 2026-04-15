package com.gusa.apex.domain.payment.client;

import com.gusa.apex.global.exception.CustomException;
import com.gusa.apex.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * PG 설정에 따라 알맞은 PgClient 구현체를 반환
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PgClientFactory {

    private final TossPaymentsClient tossPaymentsClient;
    private final KakaoPayClient kakaoPayClient;
    private final PortOneClient portOneClient;

    public PgClient getClient(String pgProvider) {
        PgClient client = switch (pgProvider.toLowerCase()) {
            case "toss"               -> tossPaymentsClient;
            case "kakao"              -> kakaoPayClient;
            case "inicis", "nicepay",
                 "naver", "portone"  -> portOneClient;
            default -> {
                log.error("지원하지 않는 PG 프로바이더: pgProvider={}", pgProvider);
                throw new CustomException(ErrorCode.UNSUPPORTED_PG_PROVIDER);
            }
        };
        log.debug("PG 클라이언트 선택: pgProvider={}, client={}", pgProvider, client.getClass().getSimpleName());
        return client;
    }
}
