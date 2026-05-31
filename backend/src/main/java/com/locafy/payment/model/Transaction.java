package com.locafy.payment.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    private String id;

    @Indexed
    private String orderId;

    @Indexed
    private String customerId;

    private String shopId;

    private TransactionType type;
    private PaymentMethod method;
    private TransactionStatus status;

    private Double amount;
    private String currency;

    private String razorpayOrderId;
    private String razorpayPaymentId;

    private String note;

    @CreatedDate
    private LocalDateTime createdAt;

    public enum TransactionType { PAYMENT, REFUND }
    public enum PaymentMethod { COD, RAZORPAY }
    public enum TransactionStatus { PENDING, SUCCESS, FAILED, REFUNDED }
}
