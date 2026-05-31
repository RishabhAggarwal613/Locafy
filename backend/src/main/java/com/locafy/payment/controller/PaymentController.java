package com.locafy.payment.controller;

import com.locafy.payment.dto.PaymentDto;
import com.locafy.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentDto.CreatePaymentResponse> createPayment(
            @AuthenticationPrincipal String customerId,
            @Valid @RequestBody PaymentDto.CreatePaymentRequest req) {
        return ResponseEntity.ok(paymentService.createPayment(customerId, req.getOrderId()));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentDto.VerifyPaymentResponse> verifyPayment(
            @AuthenticationPrincipal String customerId,
            @Valid @RequestBody PaymentDto.VerifyPaymentRequest req) {
        return ResponseEntity.ok(paymentService.verifyPayment(customerId, req));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> webhook(
            HttpServletRequest request,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) throws IOException {
        String payload = StreamUtils.copyToString(request.getInputStream(), StandardCharsets.UTF_8);
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok(java.util.Map.of("status", "ok"));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentDto.TransactionPageResponse> paymentHistory(
            @AuthenticationPrincipal String customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(paymentService.getPaymentHistory(customerId, page, size));
    }
}
