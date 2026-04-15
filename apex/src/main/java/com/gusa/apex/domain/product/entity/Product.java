package com.gusa.apex.domain.product.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String grade;

    @Column(nullable = false)
    private int price;

    @Column(nullable = false)
    private int originalPrice;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private String publisher;

    private String publishedDate;

    private int pages;

    private String isbn;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String tableOfContents;

    private String badge;

    private boolean isNew;

    private String imageUrl;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Builder
    public Product(String title, String subject, String grade, int price, int originalPrice,
                   String author, String publisher, String publishedDate, int pages, String isbn,
                   String description, String tableOfContents, String badge, boolean isNew) {
        this.title = title;
        this.subject = subject;
        this.grade = grade;
        this.price = price;
        this.originalPrice = originalPrice;
        this.author = author;
        this.publisher = publisher;
        this.publishedDate = publishedDate;
        this.pages = pages;
        this.isbn = isbn;
        this.description = description;
        this.tableOfContents = tableOfContents;
        this.badge = badge;
        this.isNew = isNew;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void update(String title, String subject, String grade, int price, int originalPrice,
                       String author, String publisher, String publishedDate, int pages, String isbn,
                       String description, String tableOfContents, String badge, boolean isNew) {
        this.title = title;
        this.subject = subject;
        this.grade = grade;
        this.price = price;
        this.originalPrice = originalPrice;
        this.author = author;
        this.publisher = publisher;
        this.publishedDate = publishedDate;
        this.pages = pages;
        this.isbn = isbn;
        this.description = description;
        this.tableOfContents = tableOfContents;
        this.badge = badge;
        this.isNew = isNew;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateImage(String imageUrl) {
        this.imageUrl = imageUrl;
        this.updatedAt = LocalDateTime.now();
    }
}
