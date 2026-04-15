package com.gusa.apex.domain.user.dto;

import com.gusa.apex.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserProfileResponse {

    private String userId;
    private String userName;
    private String email;
    private String phoneNumber;
    private String zipCode;
    private String address;
    private String addressDetail;

    public static UserProfileResponse from(User user) {
        return UserProfileResponse.builder()
                .userId(user.getUserId())
                .userName(user.getUserName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .zipCode(user.getZipCode())
                .address(user.getAddress())
                .addressDetail(user.getAddressDetail())
                .build();
    }
}
