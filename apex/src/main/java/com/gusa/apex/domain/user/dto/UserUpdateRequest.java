package com.gusa.apex.domain.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    private String userName;
    private String email;
    private String phoneNumber;
    private String zipCode;
    private String address;
    private String addressDetail;
    private String currentPassword;   // 비밀번호 변경 시 현재 비밀번호 확인용
    private String newPassword;       // null이면 비밀번호 변경 안 함
}
