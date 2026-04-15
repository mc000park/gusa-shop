package com.gusa.apex.domain.pgsetting.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class PgSettingRequest {

    @NotBlank
    private String pgProvider;

    private String merchantId;

    @NotBlank
    private String apiKey;

    private String apiSecret;

    private String mode = "test";       // test | production

    private List<String> paymentMethods;

    private boolean enabled;
}
