package com.gusa.apex.domain.banksetting.service;

import com.gusa.apex.domain.banksetting.dto.BankSettingRequest;
import com.gusa.apex.domain.banksetting.dto.BankSettingResponse;
import com.gusa.apex.domain.banksetting.entity.BankSetting;
import com.gusa.apex.domain.banksetting.repository.BankSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BankSettingService {

    private final BankSettingRepository bankSettingRepository;

    @Transactional(readOnly = true)
    public BankSettingResponse getSetting() {
        List<BankSetting> all = bankSettingRepository.findAll();
        if (all.isEmpty()) return BankSettingResponse.empty();
        return BankSettingResponse.from(all.get(0));
    }

    @Transactional
    public BankSettingResponse saveSetting(BankSettingRequest req) {
        List<BankSetting> all = bankSettingRepository.findAll();
        BankSetting setting;
        if (all.isEmpty()) {
            setting = BankSetting.builder()
                    .bankName(req.getBankName())
                    .accountNumber(req.getAccountNumber())
                    .accountHolder(req.getAccountHolder())
                    .depositNote(req.getDepositNote())
                    .enabled(req.isEnabled())
                    .cardEnabled(req.isCardEnabled())
                    .build();
            log.info("계좌 설정 신규 등록: bankName={}, enabled={}, cardEnabled={}", req.getBankName(), req.isEnabled(), req.isCardEnabled());
        } else {
            setting = all.get(0);
            setting.update(req.getBankName(), req.getAccountNumber(),
                           req.getAccountHolder(), req.getDepositNote(),
                           req.isEnabled(), req.isCardEnabled());
            log.info("계좌 설정 수정: bankName={}, enabled={}, cardEnabled={}", req.getBankName(), req.isEnabled(), req.isCardEnabled());
        }
        return BankSettingResponse.from(bankSettingRepository.save(setting));
    }
}
