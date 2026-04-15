package com.gusa.apex.domain.product.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductSearchRequest {

    private String keyword;    // 제목, 저자, 출판사 통합 검색
    private String subject;    // 과목 필터
    private String grade;      // 학년 필터
    private Boolean isNew;     // 신간 여부 필터
    private Boolean hasBadge;  // 배지 보유(베스트셀러) 필터
    private int page = 0;
    private int size = 12;
}
