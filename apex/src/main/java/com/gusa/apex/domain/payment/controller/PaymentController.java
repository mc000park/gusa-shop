package com.gusa.apex.domain.payment.controller;

import com.gusa.apex.domain.payment.dto.PaymentConfirmRequest;
import com.gusa.apex.domain.payment.dto.PaymentConfirmResponse;
import com.gusa.apex.domain.payment.service.PaymentService;
import com.gusa.apex.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<PaymentConfirmResponse>> confirm(
            Principal principal,
            @Valid @RequestBody PaymentConfirmRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.confirm(request, principal.getName())));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentConfirmResponse>> getPayment(
            Principal principal,
            @PathVariable String paymentId
    ) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPayment(paymentId, principal.getName())));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<PaymentConfirmResponse>>> getMyPayments(
            Principal principal
    ) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentsByUser(principal.getName())));
    }

    @PostMapping("/{paymentId}/cancel")
    public ResponseEntity<ApiResponse<PaymentConfirmResponse>> cancelPayment(
            Principal principal,
            @PathVariable String paymentId
    ) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.cancelPayment(paymentId, principal.getName())));
    }
}
