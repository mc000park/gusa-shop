package com.gusa.apex.domain.pgsetting.service;

import com.gusa.apex.domain.pgsetting.dto.PgSettingRequest;
import com.gusa.apex.domain.pgsetting.dto.PgSettingResponse;
import com.gusa.apex.domain.pgsetting.entity.PgSetting;
import com.gusa.apex.domain.pgsetting.repository.PgSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PgSettingServiceImpl implements PgSettingService {

    private final PgSettingRepository pgSettingRepository;

    @Override
    @Cacheable("pgSettings")
    @Transactional(readOnly = true)
    public List<PgSettingResponse> getAllSettings() {
        return pgSettingRepository.findAll().stream()
                .map(PgSettingResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @CacheEvict(value = "pgSettings", allEntries = true)
    @Transactional
    public PgSettingResponse saveSetting(PgSettingRequest req) {
        String methods = (req.getPaymentMethods() != null)
                ? String.join(",", req.getPaymentMethods())
                : null;

        PgSetting setting = pgSettingRepository.findByPgProvider(req.getPgProvider())
                .orElse(null);

        if (setting != null) {
            setting.update(req.getMerchantId(), req.getApiKey(), req.getApiSecret(),
                           req.getMode(), methods, req.isEnabled());
            log.info("PG 설정 수정: pgProvider={}, mode={}, enabled={}", req.getPgProvider(), req.getMode(), req.isEnabled());
        } else {
            setting = PgSetting.builder()
                    .pgProvider(req.getPgProvider())
                    .merchantId(req.getMerchantId())
                    .apiKey(req.getApiKey())
                    .apiSecret(req.getApiSecret())
                    .mode(req.getMode())
                    .paymentMethods(methods)
                    .enabled(req.isEnabled())
                    .build();
            pgSettingRepository.save(setting);
            log.info("PG 설정 신규 등록: pgProvider={}, mode={}, enabled={}", req.getPgProvider(), req.getMode(), req.isEnabled());
        }

        return PgSettingResponse.from(setting);
    }
}
