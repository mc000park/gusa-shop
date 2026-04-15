package com.gusa.apex.domain.banksetting.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "bank_settings")
public class BankSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bankName;        // 은행명  예) 국민은행
    private String accountNumber;   // 계좌번호
    private String accountHolder;   // 예금주
    private String depositNote;     // 입금 안내 문구

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean enabled = false;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private boolean cardEnabled = true;

    private LocalDateTime updatedAt;

    @Builder
    public BankSetting(String bankName, String accountNumber,
                       String accountHolder, String depositNote,
                       boolean enabled, boolean cardEnabled) {
        this.bankName      = bankName;
        this.accountNumber = accountNumber;
        this.accountHolder = accountHolder;
        this.depositNote   = depositNote;
        this.enabled       = enabled;
        this.cardEnabled   = cardEnabled;
        this.updatedAt     = LocalDateTime.now();
    }

    public void update(String bankName, String accountNumber,
                       String accountHolder, String depositNote,
                       boolean enabled, boolean cardEnabled) {
        this.bankName      = bankName;
        this.accountNumber = accountNumber;
        this.accountHolder = accountHolder;
        this.depositNote   = depositNote;
        this.enabled       = enabled;
        this.cardEnabled   = cardEnabled;
        this.updatedAt     = LocalDateTime.now();
    }
}
