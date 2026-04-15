package com.gusa.apex.domain.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderCreateRequest {

    @NotEmpty
    @Valid
    private List<OrderItemRequest> items;

    @NotBlank
    private String recipientName;

    @NotBlank
    private String phoneNumber;

    @NotBlank
    private String zipCode;

    @NotBlank
    private String address;

    private String addressDetail;

    private String deliveryMemo;

    private String paymentMethod;   // BANK_TRANSFER | PG (null이면 PG로 처리)
}
