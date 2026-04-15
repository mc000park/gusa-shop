package com.gusa.apex.domain.order.controller;

import com.gusa.apex.domain.order.dto.OrderPageResponse;
import com.gusa.apex.domain.order.dto.OrderResponse;
import com.gusa.apex.domain.order.dto.OrderStatusUpdateRequest;
import com.gusa.apex.domain.order.service.OrderService;
import com.gusa.apex.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    /** 주문 목록 (검색 + 페이지) */
    @GetMapping
    public ResponseEntity<ApiResponse<OrderPageResponse>> getOrders(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getOrders(keyword, status, page, size)
        ));
    }

    /** 주문 단건 조회 */
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderForAdmin(orderId)));
    }

    /** 주문 상태 변경 */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable String orderId,
            @Valid @RequestBody OrderStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.updateOrderStatus(orderId, request.getStatus())
        ));
    }
}
