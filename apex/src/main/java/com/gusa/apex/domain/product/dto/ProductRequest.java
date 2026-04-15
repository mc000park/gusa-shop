package com.gusa.apex.domain.product.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ProductRequest {

    @NotBlank(message = "제목을 입력해주세요.")
    private String title;

    @NotBlank(message = "과목을 입력해주세요.")
    private String subject;

    @NotBlank(message = "학년을 입력해주세요.")
    private String grade;

    @NotNull(message = "판매가를 입력해주세요.")
    @Min(value = 0, message = "판매가는 0원 이상이어야 합니다.")
    private Integer price;

    @NotNull(message = "정가를 입력해주세요.")
    @Min(value = 0, message = "정가는 0원 이상이어야 합니다.")
    private Integer originalPrice;

    @NotBlank(message = "저자를 입력해주세요.")
    private String author;

    @NotBlank(message = "출판사를 입력해주세요.")
    private String publisher;

    private String publishedDate;

    private int pages;

    private String isbn;

    private String description;

    private List<String> tableOfContents;

    private String badge;

    @JsonProperty("isNew")
    private boolean isNew;
}
