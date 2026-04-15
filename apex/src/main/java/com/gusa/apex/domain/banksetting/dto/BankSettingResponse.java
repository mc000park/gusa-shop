package com.gusa.apex.domain.banksetting.dto;

import com.gusa.apex.domain.banksetting.entity.BankSetting;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BankSettingResponse {
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private String depositNote;
    private boolean enabled;
    private boolean cardEnabled;

    public static BankSettingResponse from(BankSetting s) {
        return BankSettingResponse.builder()
                .bankName(s.getBankName())
                .accountNumber(s.getAccountNumber())
                .accountHolder(s.getAccountHolder())
                .depositNote(s.getDepositNote())
                .enabled(s.isEnabled())
                .cardEnabled(s.isCardEnabled())
                .build();
    }

    public static BankSettingResponse empty() {
        return BankSettingResponse.builder()
                .bankName("").accountNumber("").accountHolder("")
                .depositNote("").enabled(false).cardEnabled(true)
                .build();
    }
}
