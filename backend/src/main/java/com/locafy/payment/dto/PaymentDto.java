package com.locafy.payment.dto;

import com.locafy.payment.model.Transaction;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

import java.util.List;

public class PaymentDto {

    @Data
    public static class CreatePaymentRequest {
        @NotBlank
        private String orderId;
    }

    @Data
    public static class VerifyPaymentRequest {
        @NotBlank
        private String razorpayOrderId;
        @NotBlank
        private String razorpayPaymentId;
        @NotBlank
        private String razorpaySignature;
    }

    @Data
    @Builder
    public static class CreatePaymentResponse {
        private String razorpayOrderId;
        private String keyId;
        private Long amount;
        private String currency;
        private String orderNumber;
    }

    @Data
    @Builder
    public static class VerifyPaymentResponse {
        private boolean verified;
        private String orderId;
        private String paymentStatus;
    }

    @Data
    @Builder
    public static class TransactionResponse {
        private String id;
        private String orderId;
        private String type;
        private String method;
        private String status;
        private Double amount;
        private String currency;
        private String createdAt;

        public static TransactionResponse from(Transaction tx) {
            return TransactionResponse.builder()
                    .id(tx.getId())
                    .orderId(tx.getOrderId())
                    .type(tx.getType() != null ? tx.getType().name() : null)
                    .method(tx.getMethod() != null ? tx.getMethod().name() : null)
                    .status(tx.getStatus() != null ? tx.getStatus().name() : null)
                    .amount(tx.getAmount())
                    .currency(tx.getCurrency())
                    .createdAt(tx.getCreatedAt() != null ? tx.getCreatedAt().toString() : null)
                    .build();
        }
    }

    @Data
    @Builder
    public static class TransactionPageResponse {
        private List<TransactionResponse> content;
        private long totalElements;
        private int page;
        private int size;
        private boolean hasMore;
    }
}
