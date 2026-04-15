package com.gusa.apex.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendCodeRequest {

    @NotBlank
    @Pattern(regexp = "^01[016789]\\d{7,8}$", message = "올바른 휴대폰 번호를 입력해 주세요.")
    private String phoneNumber;

}
