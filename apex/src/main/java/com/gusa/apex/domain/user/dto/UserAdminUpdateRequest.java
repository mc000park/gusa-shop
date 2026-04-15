package com.gusa.apex.domain.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserAdminUpdateRequest {

    private String userName;
    private String email;
    private String phoneNumber;
    private String grade;
    private boolean enabled;
}
