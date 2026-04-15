package com.gusa.apex.domain.payment.service;

import com.gusa.apex.domain.order.service.OrderService;
import com.gusa.apex.domain.payment.client.PgClient;
import com.gusa.apex.domain.payment.client.PgClientFactory;
import com.gusa.apex.domain.payment.dto.PaymentConfirmRequest;
import com.gusa.apex.domain.payment.dto.PaymentConfirmResponse;
import com.gusa.apex.domain.payment.entity.Payment;
import com.gusa.apex.domain.payment.repository.PaymentRepository;
import com.gusa.apex.global.exception.CustomException;
import com.gusa.apex.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PgClientFactory pgClientFactory;
    private final OrderService orderService;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                               PgClientFactory pgClientFactory,
                               @Lazy OrderService orderService) {
        this.paymentRepository = paymentRepository;
        this.pgClientFactory   = pgClientFactory;
        this.orderService      = orderService;
    }

    @Override
    @Transactional
    public PaymentConfirmResponse confirm(PaymentConfirmRequest request, String userId) {
        // 주문 금액 검증 — 클라이언트가 보낸 amount와 DB 저장 금액 비교
        long expectedAmount = orderService.getOrderFinalAmount(request.getOrderId());
        if (request.getAmount() != expectedAmount) {
            throw new CustomException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }

        PgClient client = pgClientFactory.getClient(request.getPgProvider());
        PaymentConfirmResponse response = client.confirm(request);

        Payment payment = Payment.builder()
                .paymentId(response.getPaymentId())
                .orderId(response.getOrderId())
                .amount(response.getAmount())
                .status(response.getStatus())
                .pgProvider(response.getPgProvider())
                .userId(userId)
                .approvedAt(response.getApprovedAt() != null ? LocalDateTime.now() : null)
                .build();

        paymentRepository.save(payment);
        log.info("[Payment] 저장 완료 paymentId={}", payment.getPaymentId());

        // 주문 상태를 PAID로 업데이트
        try {
            orderService.linkPayment(request.getOrderId(), response.getPaymentId());
        } catch (Exception e) {
            log.warn("[Payment] 주문 연동 실패 orderId={} : {}", request.getOrderId(), e.getMessage());
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentConfirmResponse getPayment(String paymentId, String userId) {
        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!payment.getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        return toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentConfirmResponse> getPaymentsByUser(String userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentConfirmResponse cancelPayment(String paymentId, String userId) {
        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!payment.getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        payment.cancel();
        log.info("[Payment] 취소 완료 paymentId={}", paymentId);

        return toResponse(payment);
    }

    private PaymentConfirmResponse toResponse(Payment payment) {
        return PaymentConfirmResponse.builder()
                .paymentId(payment.getPaymentId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .pgProvider(payment.getPgProvider())
                .approvedAt(payment.getApprovedAt() != null ? payment.getApprovedAt().toString() : null)
                .build();
    }
}
