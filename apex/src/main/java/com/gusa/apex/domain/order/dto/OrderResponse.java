package com.gusa.apex.domain.order.dto;

import com.gusa.apex.domain.order.entity.Order;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class OrderResponse {

    private String orderId;
    private String userId;
    private String status;
    private Long totalAmount;
    private Long deliveryFee;
    private Long finalAmount;
    private String recipientName;
    private String phoneNumber;
    private String zipCode;
    private String address;
    private String addressDetail;
    private String deliveryMemo;
    private String paymentId;
    private String paymentMethod;
    private List<OrderItemResponse> items;
    private String createdAt;

    public static OrderResponse from(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(OrderItemResponse::from)
                .toList();

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .userId(order.getUserId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .deliveryFee(order.getDeliveryFee())
                .finalAmount(order.getFinalAmount())
                .recipientName(order.getRecipientName())
                .phoneNumber(order.getPhoneNumber())
                .zipCode(order.getZipCode())
                .address(order.getAddress())
                .addressDetail(order.getAddressDetail())
                .deliveryMemo(order.getDeliveryMemo())
                .paymentId(order.getPaymentId())
                .paymentMethod(order.getPaymentMethod())
                .items(items)
                .createdAt(order.getCreatedAt() != null ? order.getCreatedAt().toString() : null)
                .build();
    }
}
