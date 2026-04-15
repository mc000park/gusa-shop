package com.gusa.apex.domain.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthRequest {

    private String userId;
    private String userPw;

}
