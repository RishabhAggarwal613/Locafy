package com.locafy.shop.dto;

import com.locafy.shop.model.Shop;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class ShopDiscoveryDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShopListItem {
        private String id;
        private String name;
        private String slug;
        private String description;
        private String coverImageUrl;
        private String logoUrl;
        private List<String> categories;
        private Double rating;
        private Integer reviewCount;
        private Boolean isOpen;
        private Boolean isVerified;
        private Boolean deliveryAvailable;
        private Boolean pickupAvailable;
        private Double minOrderAmount;
        private Double deliveryRadius;
        private ShopDto.AddressResponse address;
        private ShopDto.LocationResponse location;
        private Double distanceKm;

        public static ShopListItem from(Shop shop, double distanceKm) {
            ShopDto.ShopResponse base = ShopDto.ShopResponse.from(shop);
            return ShopListItem.builder()
                    .id(base.getId())
                    .name(base.getName())
                    .slug(base.getSlug())
                    .description(base.getDescription())
                    .coverImageUrl(base.getCoverImageUrl())
                    .logoUrl(base.getLogoUrl())
                    .categories(base.getCategories())
                    .rating(base.getRating())
                    .reviewCount(base.getReviewCount())
                    .isOpen(base.getIsOpen())
                    .isVerified(base.getIsVerified())
                    .deliveryAvailable(base.getDeliveryAvailable())
                    .pickupAvailable(base.getPickupAvailable())
                    .minOrderAmount(base.getMinOrderAmount())
                    .deliveryRadius(base.getDeliveryRadius())
                    .address(base.getAddress())
                    .location(base.getLocation())
                    .distanceKm(Math.round(distanceKm * 10.0) / 10.0)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShopPageResponse {
        private List<ShopListItem> content;
        private long totalElements;
        private int page;
        private int size;
        private boolean hasMore;
    }
}
