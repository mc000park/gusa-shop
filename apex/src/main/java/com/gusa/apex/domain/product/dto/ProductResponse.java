package com.gusa.apex.domain.product.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.gusa.apex.domain.product.entity.Product;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Getter
@Builder
public class ProductResponse {

    private Long id;
    private String title;
    private String subject;
    private String grade;
    private int price;
    private int originalPrice;
    private String author;
    private String publisher;
    private String publishedDate;
    private int pages;
    private String isbn;
    private String description;
    private List<String> tableOfContents;
    private String badge;

    @JsonProperty("isNew")
    private boolean isNew;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductResponse from(Product product) {
        List<String> toc = (product.getTableOfContents() != null && !product.getTableOfContents().isBlank())
                ? Arrays.asList(product.getTableOfContents().split("\n"))
                : Collections.emptyList();

        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .subject(product.getSubject())
                .grade(product.getGrade())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .author(product.getAuthor())
                .publisher(product.getPublisher())
                .publishedDate(product.getPublishedDate())
                .pages(product.getPages())
                .isbn(product.getIsbn())
                .description(product.getDescription())
                .tableOfContents(toc)
                .badge(product.getBadge())
                .isNew(product.isNew())
                .imageUrl(product.getImageUrl())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
