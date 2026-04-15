package com.gusa.apex.domain.user.controller;

import com.gusa.apex.domain.user.dto.UserProfileResponse;
import com.gusa.apex.domain.user.dto.UserUpdateRequest;
import com.gusa.apex.domain.user.service.UserService;
import com.gusa.apex.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(userService.getMyProfile(userDetails.getUsername()))
        );
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserUpdateRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(userService.updateMyProfile(userDetails.getUsername(), request))
        );
    }
}
