package com.locafy.order.dto;

import com.locafy.order.model.Order;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

import java.util.List;

public class OrderDto {

    @Data
    public static class PlaceOrderRequest {
        @NotBlank
        private String shopId;

        @NotEmpty
        private List<OrderItemRequest> items;

        @NotNull
        private Order.FulfillmentType fulfillmentType;

        @NotNull
        private Order.PaymentMethod paymentMethod;

        private DeliveryAddressRequest deliveryAddress;
    }

    @Data
    public static class OrderItemRequest {
        @NotBlank
        private String productId;

        @NotNull
        @Min(1)
        private Integer quantity;
    }

    @Data
    public static class DeliveryAddressRequest {
        private String label;
        @NotBlank
        private String line1;
        private String line2;
        @NotBlank
        private String city;
        @NotBlank
        @Pattern(regexp = "^\\d{6}$")
        private String pincode;
        private Double latitude;
        private Double longitude;
    }

    @Data
    public static class UpdateStatusRequest {
        @NotNull
        private Order.OrderStatus status;
        private String note;
    }

    @Data
    @Builder
    public static class PlaceOrderResponse {
        private OrderResponse order;
        private String razorpayOrderId;
        private String razorpayKeyId;
        private Long razorpayAmount;
    }

    @Data
    @Builder
    public static class OrderResponse {
        private String id;
        private String orderNumber;
        private String customerId;
        private String shopId;
        private String shopName;
        private List<OrderItemResponse> items;
        private Double subtotal;
        private Double deliveryFee;
        private Double platformFee;
        private Double total;
        private Order.FulfillmentType fulfillmentType;
        private Order.OrderStatus status;
        private Order.PaymentMethod paymentMethod;
        private Order.PaymentStatus paymentStatus;
        private String razorpayOrderId;
        private DeliveryAddressResponse deliveryAddress;
        private List<StatusHistoryResponse> statusHistory;
        private String createdAt;

        public static OrderResponse from(Order order) {
            return OrderResponse.builder()
                    .id(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .customerId(order.getCustomerId())
                    .shopId(order.getShopId())
                    .shopName(order.getShopName())
                    .items(order.getItems().stream().map(OrderItemResponse::from).toList())
                    .subtotal(order.getSubtotal())
                    .deliveryFee(order.getDeliveryFee())
                    .platformFee(order.getPlatformFee())
                    .total(order.getTotal())
                    .fulfillmentType(order.getFulfillmentType())
                    .status(order.getStatus())
                    .paymentMethod(order.getPaymentMethod())
                    .paymentStatus(order.getPaymentStatus())
                    .razorpayOrderId(order.getRazorpayOrderId())
                    .deliveryAddress(order.getDeliveryAddress() != null
                            ? DeliveryAddressResponse.from(order.getDeliveryAddress()) : null)
                    .statusHistory(order.getStatusHistory().stream().map(StatusHistoryResponse::from).toList())
                    .createdAt(order.getCreatedAt() != null ? order.getCreatedAt().toString() : null)
                    .build();
        }
    }

    @Data
    @Builder
    public static class OrderItemResponse {
        private String productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;

        public static OrderItemResponse from(Order.OrderItem item) {
            return OrderItemResponse.builder()
                    .productId(item.getProductId())
                    .productName(item.getProductName())
                    .productImage(item.getProductImage())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .totalPrice(item.getTotalPrice())
                    .build();
        }
    }

    @Data
    @Builder
    public static class DeliveryAddressResponse {
        private String label;
        private String line1;
        private String line2;
        private String city;
        private String pincode;

        public static DeliveryAddressResponse from(Order.DeliveryAddress addr) {
            return DeliveryAddressResponse.builder()
                    .label(addr.getLabel())
                    .line1(addr.getLine1())
                    .line2(addr.getLine2())
                    .city(addr.getCity())
                    .pincode(addr.getPincode())
                    .build();
        }
    }

    @Data
    @Builder
    public static class StatusHistoryResponse {
        private Order.OrderStatus status;
        private String timestamp;
        private String note;

        public static StatusHistoryResponse from(Order.StatusHistoryEntry entry) {
            return StatusHistoryResponse.builder()
                    .status(entry.getStatus())
                    .timestamp(entry.getTimestamp() != null ? entry.getTimestamp().toString() : null)
                    .note(entry.getNote())
                    .build();
        }
    }

    @Data
    @Builder
    public static class OrderPageResponse {
        private List<OrderResponse> content;
        private long totalElements;
        private int page;
        private int size;
        private boolean hasMore;
    }
}
