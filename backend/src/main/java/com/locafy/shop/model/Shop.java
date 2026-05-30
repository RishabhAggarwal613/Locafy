package com.locafy.shop.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "shops")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Shop {

    @Id
    private String id;

    @Indexed
    private String ownerId;

    private String name;

    @Indexed(unique = true)
    private String slug;

    private String description;

    private String coverImageUrl;

    private String logoUrl;

    private String phone;

    private String email;

    @Builder.Default
    private List<String> categories = new ArrayList<>();

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private Address address;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;

    @Builder.Default
    private List<BusinessHours> businessHours = new ArrayList<>();

    @Builder.Default
    private Boolean isOpen = true;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Boolean isVerified = false;

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer reviewCount = 0;

    @Builder.Default
    private Boolean deliveryAvailable = true;

    @Builder.Default
    private Boolean pickupAvailable = true;

    private Double minOrderAmount;

    @Builder.Default
    private Double deliveryRadius = 3.0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Day { MON, TUE, WED, THU, FRI, SAT, SUN }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Address {
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String pincode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusinessHours {
        private Day day;
        private String openTime;
        private String closeTime;
        @Builder.Default
        private Boolean isClosed = false;
    }
}
