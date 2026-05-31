package com.locafy.order.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    private String id;

    @Indexed(unique = true, sparse = true)
    private String orderNumber;

    @Indexed
    private String customerId;

    @Indexed
    private String shopId;

    private String shopName;

    @Indexed
    private String vendorId;

    private String deliveryPartnerId;

    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    private Double subtotal;
    private Double deliveryFee;
    private Double platformFee;
    private Double discount;
    private Double total;

    private FulfillmentType fulfillmentType;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;

    @Indexed(sparse = true)
    private String razorpayOrderId;

    private String razorpayPaymentId;

    private DeliveryAddress deliveryAddress;

    @Builder.Default
    private List<StatusHistoryEntry> statusHistory = new ArrayList<>();

    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime deliveredAt;
    private String cancelReason;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum FulfillmentType { DELIVERY, PICKUP }
    public enum PaymentMethod { COD, RAZORPAY }
    public enum PaymentStatus { PENDING, PAID, FAILED, REFUNDED }
    public enum OrderStatus {
        PLACED, CONFIRMED, PREPARING, READY, PICKED_UP,
        OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REFUNDED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryAddress {
        private String label;
        private String line1;
        private String line2;
        private String city;
        private String pincode;
        private GeoPoint coordinates;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeoPoint {
        private String type = "Point";
        private double[] coordinates;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusHistoryEntry {
        private OrderStatus status;
        private LocalDateTime timestamp;
        private String note;
    }
}
