package com.gusa.apex.domain.user.controller;

import com.gusa.apex.domain.user.dto.UserAdminResponse;
import com.gusa.apex.domain.user.dto.UserAdminUpdateRequest;
import com.gusa.apex.domain.user.dto.UserPageResponse;
import com.gusa.apex.domain.user.service.UserService;
import com.gusa.apex.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<UserPageResponse>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getUsers(keyword, grade, enabled, page, size)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserAdminResponse>> updateUser(
            @PathVariable Long id,
            @RequestBody UserAdminUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUser(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
