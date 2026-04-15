package com.gusa.apex.domain.order.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String orderId;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String status;   // PENDING | PAID | SHIPPING | DELIVERED | CANCELED

    @Column(nullable = false)
    private Long totalAmount;

    @Column(nullable = false)
    private Long deliveryFee;

    @Column(nullable = false)
    private Long finalAmount;

    private String recipientName;
    private String phoneNumber;
    private String zipCode;
    private String address;
    private String addressDetail;
    private String deliveryMemo;

    private String paymentId;

    private String paymentMethod;   // BANK_TRANSFER | PG

    @BatchSize(size = 50)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Builder
    public Order(String orderId, String userId, String status,
                 Long totalAmount, Long deliveryFee, Long finalAmount,
                 String recipientName, String phoneNumber,
                 String zipCode, String address, String addressDetail,
                 String deliveryMemo, String paymentMethod) {
        this.orderId        = orderId;
        this.userId         = userId;
        this.status         = status;
        this.totalAmount    = totalAmount;
        this.deliveryFee    = deliveryFee;
        this.finalAmount    = finalAmount;
        this.recipientName  = recipientName;
        this.phoneNumber    = phoneNumber;
        this.zipCode        = zipCode;
        this.address        = address;
        this.addressDetail  = addressDetail;
        this.deliveryMemo   = deliveryMemo;
        this.paymentMethod  = paymentMethod;
    }

    public void updateStatus(String status) {
        this.status = status;
    }

    public void linkPayment(String paymentId) {
        this.paymentId = paymentId;
        this.status = "PAID";
    }
}
