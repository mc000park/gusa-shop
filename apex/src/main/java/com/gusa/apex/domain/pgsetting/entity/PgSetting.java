package com.gusa.apex.domain.pgsetting.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "pg_settings")
public class PgSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String pgProvider;      // toss | kakao | inicis | nicepay | naver

    private String merchantId;

    @Column(nullable = false)
    private String apiKey;

    private String apiSecret;

    @Column(nullable = false)
    private String mode;            // test | production

    @Column(length = 500)
    private String paymentMethods;  // comma-separated: "신용카드,계좌이체,가상계좌"

    @Column(nullable = false)
    private boolean enabled;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public PgSetting(String pgProvider, String merchantId, String apiKey,
                     String apiSecret, String mode, String paymentMethods, boolean enabled) {
        this.pgProvider     = pgProvider;
        this.merchantId     = merchantId;
        this.apiKey         = apiKey;
        this.apiSecret      = apiSecret;
        this.mode           = mode != null ? mode : "test";
        this.paymentMethods = paymentMethods;
        this.enabled        = enabled;
        this.updatedAt      = LocalDateTime.now();
    }

    public void update(String merchantId, String apiKey, String apiSecret,
                       String mode, String paymentMethods, boolean enabled) {
        this.merchantId     = merchantId;
        this.apiKey         = apiKey;
        this.apiSecret      = apiSecret;
        this.mode           = mode != null ? mode : "test";
        this.paymentMethods = paymentMethods;
        this.enabled        = enabled;
        this.updatedAt      = LocalDateTime.now();
    }
}
