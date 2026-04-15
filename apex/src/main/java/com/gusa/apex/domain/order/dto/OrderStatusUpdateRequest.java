package com.gusa.apex.domain.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderStatusUpdateRequest {

    @NotBlank
    private String status;  // PAID | SHIPPING | DELIVERED | CANCELED
}
