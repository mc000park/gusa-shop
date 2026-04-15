package com.gusa.apex.domain.pgsetting.service;

import com.gusa.apex.domain.pgsetting.dto.PgSettingRequest;
import com.gusa.apex.domain.pgsetting.dto.PgSettingResponse;

import java.util.List;

public interface PgSettingService {
    List<PgSettingResponse> getAllSettings();
    PgSettingResponse saveSetting(PgSettingRequest request);
}
