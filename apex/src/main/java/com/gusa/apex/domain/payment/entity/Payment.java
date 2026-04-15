package com.gusa.apex.domain.payment.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String paymentId;

    @Column(nullable = false)
    private String orderId;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private String status;        // DONE | CANCELED | FAILED

    @Column(nullable = false)
    private String pgProvider;    // toss | kakao | inicis | nicepay | naver

    private String userId;

    private LocalDateTime approvedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Builder
    public Payment(String paymentId, String orderId, Long amount,
                   String status, String pgProvider, String userId,
                   LocalDateTime approvedAt) {
        this.paymentId  = paymentId;
        this.orderId    = orderId;
        this.amount     = amount;
        this.status     = status;
        this.pgProvider = pgProvider;
        this.userId     = userId;
        this.approvedAt = approvedAt;
        this.createdAt  = LocalDateTime.now();
    }

    public void cancel() {
        this.status = "CANCELED";
    }
}
