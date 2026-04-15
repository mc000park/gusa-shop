package com.gusa.apex.domain.auth.controller;

import com.gusa.apex.domain.auth.dto.AuthRequest;
import com.gusa.apex.domain.auth.dto.AuthTokenPair;
import com.gusa.apex.domain.auth.service.AuthService;
import com.gusa.apex.domain.auth.service.PhoneVerificationService;
import com.gusa.apex.domain.auth.dto.SendCodeRequest;
import com.gusa.apex.domain.auth.dto.VerifyCodeRequest;
import com.gusa.apex.domain.user.dto.UserRequest;
import com.gusa.apex.domain.user.dto.UserResponse;
import com.gusa.apex.domain.user.service.UserService;
import com.gusa.apex.global.exception.CustomException;
import com.gusa.apex.global.exception.ErrorCode;
import com.gusa.apex.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final PhoneVerificationService phoneVerificationService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(@Valid @RequestBody AuthRequest authRequest) {
        AuthTokenPair pair = authService.login(authRequest);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "userId", authRequest.getUserId(),
                "accessToken", pair.accessToken(),
                "refreshToken", pair.refreshToken()
        )));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> adminLogin(@Valid @RequestBody AuthRequest authRequest) {
        AuthTokenPair pair = authService.adminLogin(authRequest);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "userId", authRequest.getUserId(),
                "accessToken", pair.accessToken(),
                "refreshToken", pair.refreshToken()
        )));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, String>>> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new CustomException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        AuthTokenPair pair = authService.refresh(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "accessToken", pair.accessToken(),
                "refreshToken", pair.refreshToken()
        )));
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponse>> signup(@Valid @RequestBody UserRequest userDto) {
        UserResponse user = userService.userRegister(userDto);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping("/send-code")
    public ResponseEntity<ApiResponse<Void>> sendCode(@Valid @RequestBody SendCodeRequest request) {
        // 운영 환경: SMS로만 발송하며 코드를 응답에 포함하지 않음
        phoneVerificationService.sendCode(request.getPhoneNumber());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse<Void>> verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        phoneVerificationService.verifyCode(request.getPhoneNumber(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
