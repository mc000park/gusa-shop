package com.gusa.apex.domain.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class UserPageResponse {

    private List<UserAdminResponse> content;
    private long totalElements;
    private int totalPages;
    private int page;
    private int size;
}
