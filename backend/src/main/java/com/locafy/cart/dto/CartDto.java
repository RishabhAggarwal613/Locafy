package com.locafy.cart.dto;

import com.locafy.cart.model.Cart;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.util.List;

public class CartDto {

    @Data
    @Builder
    public static class AddItemRequest {
        @NotBlank
        private String productId;
        @Min(1)
        private Integer quantity;
    }

    @Data
    @Builder
    public static class UpdateItemRequest {
        @NotNull
        @Min(1)
        private Integer quantity;
    }

    @Data
    @Builder
    public static class CartResponse {
        private String shopId;
        private String shopName;
        private List<CartItemResponse> items;
        private Double subtotal;
        private Integer itemCount;

        public static CartResponse from(Cart cart) {
            if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
                return CartResponse.builder()
                        .items(List.of())
                        .subtotal(0.0)
                        .itemCount(0)
                        .build();
            }
            int count = cart.getItems().stream().mapToInt(i -> i.getQuantity() != null ? i.getQuantity() : 0).sum();
            return CartResponse.builder()
                    .shopId(cart.getShopId())
                    .shopName(cart.getShopName())
                    .items(cart.getItems().stream().map(CartItemResponse::from).toList())
                    .subtotal(cart.getSubtotal())
                    .itemCount(count)
                    .build();
        }
    }

    @Data
    @Builder
    public static class CartItemResponse {
        private String productId;
        private String productName;
        private String productImage;
        private Double unitPrice;
        private Integer quantity;
        private Double totalPrice;

        public static CartItemResponse from(Cart.CartItem item) {
            return CartItemResponse.builder()
                    .productId(item.getProductId())
                    .productName(item.getProductName())
                    .productImage(item.getProductImage())
                    .unitPrice(item.getUnitPrice())
                    .quantity(item.getQuantity())
                    .totalPrice(item.getTotalPrice())
                    .build();
        }
    }
}
