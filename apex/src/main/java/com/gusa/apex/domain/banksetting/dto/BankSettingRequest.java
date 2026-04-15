package com.gusa.apex.domain.banksetting.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BankSettingRequest {
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private String depositNote;
    private boolean enabled;
    private boolean cardEnabled = true;
}
