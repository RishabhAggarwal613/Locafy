package com.locafy.product.dto;

import com.locafy.product.model.Product;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

import java.util.List;

public class ProductDto {

    @Data
    public static class CreateProductRequest {
        @NotBlank @Size(min = 2, max = 120) private String name;
        @Size(max = 2000) private String description;
        @NotNull @DecimalMin("0.01") private Double price;
        private Double discountedPrice;
        @NotBlank private String category;
        private String subCategory;
        private List<String> tags;
        @NotNull @Min(0) private Integer stock;
        private String unit;
        private Double weight;
        private String sku;
        private Boolean isAvailable;
    }

    @Data
    public static class UpdateProductRequest {
        @Size(min = 2, max = 120) private String name;
        @Size(max = 2000) private String description;
        @DecimalMin("0.01") private Double price;
        private Double discountedPrice;
        private String category;
        private String subCategory;
        private List<String> tags;
        @Min(0) private Integer stock;
        private String unit;
        private Double weight;
        private String sku;
        private Boolean isAvailable;
    }

    @Data
    public static class StockUpdateRequest {
        @NotNull @Min(0) private Integer stock;
        private Boolean isAvailable;
    }

    @Data
    @Builder
    public static class ProductResponse {
        private String id;
        private String shopId;
        private String vendorId;
        private String name;
        private String description;
        private Double price;
        private Double discountedPrice;
        private List<String> images;
        private String category;
        private String subCategory;
        private List<String> tags;
        private Integer stock;
        private Boolean isAvailable;
        private String unit;
        private Double weight;
        private String sku;
        private Double rating;
        private Integer reviewCount;
        private String createdAt;

        public static ProductResponse from(Product product) {
            return ProductResponse.builder()
                    .id(product.getId())
                    .shopId(product.getShopId())
                    .vendorId(product.getVendorId())
                    .name(product.getName())
                    .description(product.getDescription())
                    .price(product.getPrice())
                    .discountedPrice(product.getDiscountedPrice())
                    .images(product.getImages())
                    .category(product.getCategory())
                    .subCategory(product.getSubCategory())
                    .tags(product.getTags())
                    .stock(product.getStock())
                    .isAvailable(product.getIsAvailable())
                    .unit(product.getUnit())
                    .weight(product.getWeight())
                    .sku(product.getSku())
                    .rating(product.getRating())
                    .reviewCount(product.getReviewCount())
                    .createdAt(product.getCreatedAt() != null ? product.getCreatedAt().toString() : null)
                    .build();
        }
    }

    @Data
    @Builder
    public static class PageResponse<T> {
        private List<T> content;
        private long totalElements;
        private int totalPages;
        private int page;
        private int size;
        private boolean hasMore;

        public static <T> PageResponse<T> of(org.springframework.data.domain.Page<T> page) {
            return PageResponse.<T>builder()
                    .content(page.getContent())
                    .totalElements(page.getTotalElements())
                    .totalPages(page.getTotalPages())
                    .page(page.getNumber())
                    .size(page.getSize())
                    .hasMore(page.hasNext())
                    .build();
        }
    }
}
