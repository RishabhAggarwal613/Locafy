package com.locafy.shop.dto;

import com.locafy.shop.model.Shop;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;

import java.util.List;

public class ShopDto {

    @Data
    public static class AddressRequest {
        @NotBlank private String line1;
        private String line2;
        @NotBlank private String city;
        @NotBlank private String state;
        @NotBlank @Pattern(regexp = "^\\d{6}$", message = "Pincode must be 6 digits") private String pincode;
    }

    @Data
    public static class CreateShopRequest {
        @NotBlank @Size(min = 2, max = 100) private String name;
        @Size(max = 1000) private String description;
        private String phone;
        private String email;
        @NotEmpty private List<String> categories;
        @NotNull private AddressRequest address;
        @NotNull @DecimalMin("-90") @DecimalMax("90") private Double latitude;
        @NotNull @DecimalMin("-180") @DecimalMax("180") private Double longitude;
        private Boolean deliveryAvailable;
        private Boolean pickupAvailable;
        private Double minOrderAmount;
        private Double deliveryRadius;
    }

    @Data
    public static class UpdateShopRequest {
        @Size(min = 2, max = 100) private String name;
        @Size(max = 1000) private String description;
        private String phone;
        private String email;
        private List<String> categories;
        private AddressRequest address;
        private Double latitude;
        private Double longitude;
        private Boolean deliveryAvailable;
        private Boolean pickupAvailable;
        private Double minOrderAmount;
        private Double deliveryRadius;
        private Boolean isActive;
    }

    @Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ShopResponse {
        private String id;
        private String ownerId;
        private String name;
        private String slug;
        private String description;
        private String coverImageUrl;
        private String logoUrl;
        private String phone;
        private String email;
        private List<String> categories;
        private AddressResponse address;
        private LocationResponse location;
        private Boolean isOpen;
        private Boolean isActive;
        private Boolean isVerified;
        private Double rating;
        private Integer reviewCount;
        private Boolean deliveryAvailable;
        private Boolean pickupAvailable;
        private Double minOrderAmount;
        private Double deliveryRadius;
        private String createdAt;

        public static ShopResponse from(Shop shop) {
            AddressResponse address = null;
            if (shop.getAddress() != null) {
                address = AddressResponse.builder()
                        .line1(shop.getAddress().getLine1())
                        .line2(shop.getAddress().getLine2())
                        .city(shop.getAddress().getCity())
                        .state(shop.getAddress().getState())
                        .pincode(shop.getAddress().getPincode())
                        .build();
            }
            LocationResponse location = null;
            if (shop.getLocation() != null) {
                location = LocationResponse.builder()
                        .type("Point")
                        .coordinates(new double[]{
                                shop.getLocation().getX(),
                                shop.getLocation().getY()
                        })
                        .build();
            }
            return ShopResponse.builder()
                    .id(shop.getId())
                    .ownerId(shop.getOwnerId())
                    .name(shop.getName())
                    .slug(shop.getSlug())
                    .description(shop.getDescription())
                    .coverImageUrl(shop.getCoverImageUrl())
                    .logoUrl(shop.getLogoUrl())
                    .phone(shop.getPhone())
                    .email(shop.getEmail())
                    .categories(shop.getCategories())
                    .address(address)
                    .location(location)
                    .isOpen(shop.getIsOpen())
                    .isActive(shop.getIsActive())
                    .isVerified(shop.getIsVerified())
                    .rating(shop.getRating())
                    .reviewCount(shop.getReviewCount())
                    .deliveryAvailable(shop.getDeliveryAvailable())
                    .pickupAvailable(shop.getPickupAvailable())
                    .minOrderAmount(shop.getMinOrderAmount())
                    .deliveryRadius(shop.getDeliveryRadius())
                    .createdAt(shop.getCreatedAt() != null ? shop.getCreatedAt().toString() : null)
                    .build();
        }
    }

    @Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class AddressResponse {
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String pincode;
    }

    @Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class LocationResponse {
        private String type;
        private double[] coordinates;
    }
}
