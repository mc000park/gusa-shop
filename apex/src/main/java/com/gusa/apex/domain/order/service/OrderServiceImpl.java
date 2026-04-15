package com.gusa.apex.domain.order.service;

import com.gusa.apex.domain.order.dto.*;
import com.gusa.apex.domain.order.entity.Order;
import com.gusa.apex.domain.order.entity.OrderItem;
import com.gusa.apex.domain.order.repository.OrderRepository;
import com.gusa.apex.domain.product.entity.Product;
import com.gusa.apex.domain.product.repository.ProductRepository;
import com.gusa.apex.global.exception.CustomException;
import com.gusa.apex.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final long FREE_SHIPPING_THRESHOLD = 30_000L;
    private static final long DELIVERY_FEE = 3_000L;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(String userId, OrderCreateRequest request) {
        // 상품 가격 합산
        long totalAmount = 0L;
        for (OrderItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
            totalAmount += (long) product.getPrice() * item.getQuantity();
        }

        long deliveryFee = totalAmount >= FREE_SHIPPING_THRESHOLD ? 0L : DELIVERY_FEE;
        long finalAmount = totalAmount + deliveryFee;

        Order order = Order.builder()
                .orderId(UUID.randomUUID().toString().replace("-", "").substring(0, 20))
                .userId(userId)
                .status("PENDING")
                .totalAmount(totalAmount)
                .deliveryFee(deliveryFee)
                .finalAmount(finalAmount)
                .recipientName(request.getRecipientName())
                .phoneNumber(request.getPhoneNumber())
                .zipCode(request.getZipCode())
                .address(request.getAddress())
                .addressDetail(request.getAddressDetail())
                .deliveryMemo(request.getDeliveryMemo())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "PG")
                .build();

        orderRepository.save(order);

        // OrderItem 생성
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productTitle(product.getTitle())
                    .quantity(itemReq.getQuantity())
                    .unitPrice((long) product.getPrice())
                    .build();

            order.getItems().add(item);
        }

        log.info("[Order] 주문 생성 orderId={} userId={}", order.getOrderId(), userId);
        return OrderResponse.from(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrder(String orderId, String userId) {
        Order order = findOrder(orderId);
        if (!order.getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }
        return OrderResponse.from(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderPageResponse getMyOrders(String userId, int page, int size) {
        Page<Order> result = orderRepository.findByUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(page, size));
        return toPageResponse(result, page, size);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(String orderId, String userId) {
        Order order = findOrder(orderId);

        if (!order.getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }
        if ("CANCELED".equals(order.getStatus())) {
            throw new CustomException(ErrorCode.ORDER_ALREADY_CANCELED);
        }
        if ("SHIPPING".equals(order.getStatus()) || "DELIVERED".equals(order.getStatus())) {
            throw new CustomException(ErrorCode.ORDER_CANCEL_NOT_ALLOWED);
        }

        order.updateStatus("CANCELED");
        log.info("[Order] 주문 취소 orderId={}", orderId);
        return OrderResponse.from(order);
    }

    @Override
    @Transactional
    public void linkPayment(String orderId, String paymentId) {
        Order order = findOrder(orderId);
        order.linkPayment(paymentId);
        log.info("[Order] 결제 연동 orderId={} paymentId={}", orderId, paymentId);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderPageResponse getOrders(String keyword, String status, int page, int size) {
        String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String st = (status != null && !status.isBlank()) ? status : null;

        Page<Order> result = orderRepository.searchOrders(kw, st, PageRequest.of(page, size));
        return toPageResponse(result, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public long getOrderFinalAmount(String orderId) {
        return findOrder(orderId).getFinalAmount();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderForAdmin(String orderId) {
        return OrderResponse.from(findOrder(orderId));
    }

    private static final java.util.Map<String, java.util.Set<String>> VALID_TRANSITIONS = java.util.Map.of(
            "PENDING",   java.util.Set.of("PAID", "CANCELED"),
            "PAID",      java.util.Set.of("SHIPPING", "CANCELED"),
            "SHIPPING",  java.util.Set.of("DELIVERED"),
            "DELIVERED", java.util.Set.of(),
            "CANCELED",  java.util.Set.of()
    );

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(String orderId, String status) {
        Order order = findOrder(orderId);
        java.util.Set<String> allowed = VALID_TRANSITIONS.getOrDefault(order.getStatus(), java.util.Set.of());
        if (!allowed.contains(status)) {
            throw new CustomException(ErrorCode.ORDER_STATUS_INVALID_TRANSITION);
        }
        order.updateStatus(status);
        log.info("[Order] 상태 변경 orderId={} status={}", orderId, status);
        return OrderResponse.from(order);
    }

    private Order findOrder(String orderId) {
        return orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
    }

    private OrderPageResponse toPageResponse(Page<Order> result, int page, int size) {
        List<OrderResponse> content = result.getContent().stream()
                .map(OrderResponse::from)
                .toList();
        return OrderPageResponse.builder()
                .content(content)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .page(page)
                .size(size)
                .build();
    }
}
