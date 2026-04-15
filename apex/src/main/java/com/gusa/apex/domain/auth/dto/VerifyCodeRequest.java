package com.gusa.apex.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyCodeRequest {

    @NotBlank
    private String phoneNumber;

    @NotBlank
    private String code;

}
