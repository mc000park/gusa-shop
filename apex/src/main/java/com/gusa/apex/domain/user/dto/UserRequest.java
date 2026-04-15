package com.gusa.apex.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequest {

    @NotBlank
    private String userId;

    @NotBlank
    private String password;

    @NotBlank
    private String userName;

    @NotBlank
    private String email;

    @NotBlank
    @Pattern(regexp = "^01[016789]\\d{7,8}$", message = "올바른 휴대폰 번호를 입력해 주세요.")
    private String phoneNumber;

    @NotBlank
    private String zipCode;

    @NotBlank
    private String address;

    private String addressDetail;

    private String grade;

}
