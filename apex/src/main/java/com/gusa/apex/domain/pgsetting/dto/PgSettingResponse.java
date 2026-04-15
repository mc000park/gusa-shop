package com.gusa.apex.domain.pgsetting.dto;

import com.gusa.apex.domain.pgsetting.entity.PgSetting;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Getter
@Builder
public class PgSettingResponse {

    private Long id;
    private String pgProvider;
    private String merchantId;
    private String apiKey;
    private String mode;
    private List<String> paymentMethods;
    private boolean enabled;
    private LocalDateTime updatedAt;

    public static PgSettingResponse from(PgSetting s) {
        List<String> methods = (s.getPaymentMethods() != null && !s.getPaymentMethods().isBlank())
                ? Arrays.asList(s.getPaymentMethods().split(","))
                : Collections.emptyList();

        return PgSettingResponse.builder()
                .id(s.getId())
                .pgProvider(s.getPgProvider())
                .merchantId(s.getMerchantId())
                .apiKey(s.getApiKey())
                .mode(s.getMode())
                .paymentMethods(methods)
                .enabled(s.isEnabled())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
