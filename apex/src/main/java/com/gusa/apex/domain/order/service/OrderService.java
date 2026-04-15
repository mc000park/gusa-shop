package com.gusa.apex.domain.order.service;

import com.gusa.apex.domain.order.dto.*;

public interface OrderService {

    OrderResponse createOrder(String userId, OrderCreateRequest request);

    OrderResponse getOrder(String orderId, String userId);

    OrderPageResponse getMyOrders(String userId, int page, int size);

    OrderResponse cancelOrder(String orderId, String userId);

    void linkPayment(String orderId, String paymentId);

    /** 결제 금액 검증용 — 소유권 체크 없이 주문 finalAmount 반환 */
    long getOrderFinalAmount(String orderId);

    // Admin
    OrderResponse getOrderForAdmin(String orderId);

    OrderPageResponse getOrders(String keyword, String status, int page, int size);

    OrderResponse updateOrderStatus(String orderId, String status);
}
