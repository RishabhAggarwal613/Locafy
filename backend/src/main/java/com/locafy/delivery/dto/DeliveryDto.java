package com.locafy.delivery.dto;

import com.locafy.delivery.model.DeliveryProfile;
import com.locafy.order.dto.OrderDto;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.util.List;

public class DeliveryDto {

    @Data
    public static class UpdateProfileRequest {
        private Boolean isOnline;
        private Double zoneLatitude;
        private Double zoneLongitude;

        @Min(1)
        @Max(15)
        private Double zoneRadiusKm;

        private String vehicleType;
    }

    @Data
    @Builder
    public static class ProfileResponse {
        private String userId;
        private boolean isOnline;
        private Double zoneLatitude;
        private Double zoneLongitude;
        private Double zoneRadiusKm;
        private String vehicleType;

        public static ProfileResponse from(DeliveryProfile profile) {
            Double lat = null;
            Double lng = null;
            if (profile.getZoneCenter() != null && profile.getZoneCenter().length >= 2) {
                lng = profile.getZoneCenter()[0];
                lat = profile.getZoneCenter()[1];
            }
            return ProfileResponse.builder()
                    .userId(profile.getUserId())
                    .isOnline(Boolean.TRUE.equals(profile.getIsOnline()))
                    .zoneLatitude(lat)
                    .zoneLongitude(lng)
                    .zoneRadiusKm(profile.getZoneRadiusKm())
                    .vehicleType(profile.getVehicleType())
                    .build();
        }
    }

    @Data
    @Builder
    public static class DashboardResponse {
        private long todayDeliveries;
        private double todayEarnings;
        private long totalDeliveries;
        private double totalEarnings;
        private long activeOrders;
        private long availableInZone;
        private boolean isOnline;
    }

    @Data
    @Builder
    public static class DeliveryOrderResponse {
        private OrderDto.OrderResponse order;
        private Double shopLatitude;
        private Double shopLongitude;
        private String shopAddressLine;
        private Double customerLatitude;
        private Double customerLongitude;
        private Double partnerEarning;

        public static DeliveryOrderResponse from(
                OrderDto.OrderResponse order,
                Double shopLat, Double shopLng, String shopAddress,
                Double custLat, Double custLng, Double earning) {
            return DeliveryOrderResponse.builder()
                    .order(order)
                    .shopLatitude(shopLat)
                    .shopLongitude(shopLng)
                    .shopAddressLine(shopAddress)
                    .customerLatitude(custLat)
                    .customerLongitude(custLng)
                    .partnerEarning(earning)
                    .build();
        }
    }

    @Data
    @Builder
    public static class OrderPageResponse {
        private List<DeliveryOrderResponse> content;
        private long totalElements;
        private int page;
        private int size;
        private boolean hasMore;
    }

    @Data
    public static class UpdateDeliveryStatusRequest {
        @NotNull
        private com.locafy.order.model.Order.OrderStatus status;
        private String note;
    }

    @Data
    public static class LocationUpdateRequest {
        @NotNull
        private Double latitude;
        @NotNull
        private Double longitude;
    }

    @Data
    @Builder
    public static class LocationResponse {
        private String orderId;
        private String partnerId;
        private double latitude;
        private double longitude;
        private String updatedAt;
    }
}
