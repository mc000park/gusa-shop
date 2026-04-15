package com.gusa.apex.domain.user.dto;

import com.gusa.apex.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
@Builder
public class UserAdminResponse {

    private Long id;
    private String userId;
    private String userName;
    private String email;
    private String phoneNumber;
    private String grade;
    private boolean enabled;
    private String createdAt;

    public static UserAdminResponse from(User user) {
        String createdAt = user.getCreatedAt() != null
                ? user.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
                : "";
        return UserAdminResponse.builder()
                .id(user.getId())
                .userId(user.getUserId())
                .userName(user.getUserName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .grade(user.getGrade())
                .enabled(user.isEnabled())
                .createdAt(createdAt)
                .build();
    }
}
