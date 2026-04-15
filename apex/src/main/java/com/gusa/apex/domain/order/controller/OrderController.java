package com.gusa.apex.domain.order.controller;

import com.gusa.apex.domain.order.dto.OrderCreateRequest;
import com.gusa.apex.domain.order.dto.OrderPageResponse;
import com.gusa.apex.domain.order.dto.OrderResponse;
import com.gusa.apex.domain.order.service.OrderService;
import com.gusa.apex.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** 주문 생성 */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            Principal principal,
            @Valid @RequestBody OrderCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(orderService.createOrder(principal.getName(), request)));
    }

    /** 주문 단건 조회 */
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            Principal principal,
            @PathVariable String orderId
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrder(orderId, principal.getName())));
    }

    /** 내 주문 목록 */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<OrderPageResponse>> getMyOrders(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getMyOrders(principal.getName(), page, size)));
    }

    /** 비회원 주문 생성 */
    @PostMapping("/guest")
    public ResponseEntity<ApiResponse<OrderResponse>> createGuestOrder(
            @Valid @RequestBody OrderCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(orderService.createOrder("GUEST", request)));
    }

    /** 주문 취소 */
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable String orderId,
            Principal principal
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.cancelOrder(orderId, principal.getName())));
    }
}
