package com.gusa.apex.domain.product.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ProductPageResponse {

    private List<ProductResponse> content;
    private long totalElements;
    private int totalPages;
    private int page;
    private int size;
}
