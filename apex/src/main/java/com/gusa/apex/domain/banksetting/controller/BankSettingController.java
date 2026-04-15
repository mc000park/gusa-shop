package com.gusa.apex.domain.banksetting.controller;

import com.gusa.apex.domain.banksetting.dto.BankSettingRequest;
import com.gusa.apex.domain.banksetting.dto.BankSettingResponse;
import com.gusa.apex.domain.banksetting.service.BankSettingService;
import com.gusa.apex.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class BankSettingController {

    private final BankSettingService bankSettingService;

    /** 주문화면에서 계좌 정보 조회 (비로그인 허용) */
    @GetMapping("/bank-setting")
    public ResponseEntity<ApiResponse<BankSettingResponse>> get() {
        return ResponseEntity.ok(ApiResponse.success(bankSettingService.getSetting()));
    }

    /** 관리자 조회 */
    @GetMapping("/admin/bank-setting")
    public ResponseEntity<ApiResponse<BankSettingResponse>> getForAdmin() {
        return ResponseEntity.ok(ApiResponse.success(bankSettingService.getSetting()));
    }

    /** 관리자 저장 */
    @PutMapping("/admin/bank-setting")
    public ResponseEntity<ApiResponse<BankSettingResponse>> save(
            @RequestBody BankSettingRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.success(bankSettingService.saveSetting(req)));
    }
}
