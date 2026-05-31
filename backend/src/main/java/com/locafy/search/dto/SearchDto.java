package com.locafy.search.dto;

import com.locafy.product.dto.ProductDto;
import com.locafy.shop.dto.ShopDiscoveryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class SearchDto {

    public enum SearchType { ALL, SHOP, PRODUCT }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSearchItem {
        private String id;
        private String shopId;
        private String shopName;
        private String name;
        private String description;
        private Double price;
        private Double discountedPrice;
        private List<String> images;
        private String category;
        private Integer stock;
        private Boolean isAvailable;
        private String unit;
        private Double rating;
        private Double distanceKm;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchResponse {
        private List<ShopDiscoveryDto.ShopListItem> shops;
        private List<ProductSearchItem> products;
        private long totalShops;
        private long totalProducts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AutocompleteItem {
        private String type;
        private String id;
        private String label;
        private String subtitle;
    }
}
