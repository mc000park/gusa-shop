package com.gusa.apex.domain.order.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private String productTitle;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private Long unitPrice;

    @Column(nullable = false)
    private Long totalPrice;

    @Builder
    public OrderItem(Order order, Long productId, String productTitle,
                     int quantity, Long unitPrice) {
        this.order        = order;
        this.productId    = productId;
        this.productTitle = productTitle;
        this.quantity     = quantity;
        this.unitPrice    = unitPrice;
        this.totalPrice   = unitPrice * quantity;
    }
}
