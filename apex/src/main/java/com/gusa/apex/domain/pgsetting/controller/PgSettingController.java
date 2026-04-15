package com.gusa.apex.domain.pgsetting.controller;

import com.gusa.apex.domain.pgsetting.dto.PgSettingRequest;
import com.gusa.apex.domain.pgsetting.dto.PgSettingResponse;
import com.gusa.apex.domain.pgsetting.service.PgSettingService;
import com.gusa.apex.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/pg-settings")
@RequiredArgsConstructor
public class PgSettingController {

    private final PgSettingService pgSettingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PgSettingResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(pgSettingService.getAllSettings()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PgSettingResponse>> save(
            @Valid @RequestBody PgSettingRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(pgSettingService.saveSetting(request)));
    }
}
