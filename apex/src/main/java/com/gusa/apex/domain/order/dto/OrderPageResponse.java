package com.gusa.apex.domain.order.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class OrderPageResponse {

    private List<OrderResponse> content;
    private long totalElements;
    private int totalPages;
    private int page;
    private int size;
}
