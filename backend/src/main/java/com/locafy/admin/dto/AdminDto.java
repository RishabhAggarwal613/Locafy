package com.locafy.admin.dto;

import com.locafy.admin.model.AuditLog;
import com.locafy.admin.model.PlatformSettings;
import com.locafy.category.dto.CategoryDto;
import com.locafy.order.dto.OrderDto;
import com.locafy.order.model.Order;
import com.locafy.product.model.Product;
import com.locafy.shop.model.Shop;
import com.locafy.user.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.util.List;

public class AdminDto {

    @Data
    @Builder
    public static class AnalyticsResponse {
        private long totalCustomers;
        private long totalVendors;
        private long totalDeliveryPartners;
        private long totalAdmins;
        private long activeShops;
        private long shopsPendingVerification;
        private long ordersToday;
        private double gmvToday;
        private double gmvThisMonth;
        private long deliveryPartnersOnline;
        private long flaggedProducts;
        private List<PendingShopSummary> pendingShops;
    }

    @Data
    @Builder
    public static class PendingShopSummary {
        private String id;
        private String name;
        private String ownerId;
        private String city;
        private String createdAt;
    }

    @Data
    @Builder
    public static class UserSummary {
        private String id;
        private String name;
        private String email;
        private String phone;
        private User.Role role;
        private boolean active;
        private boolean verified;
        private String city;
        private String createdAt;

        public static UserSummary from(User user) {
            String city = user.getLocality() != null ? user.getLocality().getCity() : null;
            boolean active = user.getIsActive() == null || Boolean.TRUE.equals(user.getIsActive());
            return UserSummary.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .role(user.getRole())
                    .active(active)
                    .verified(user.isVerified())
                    .city(city)
                    .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                    .build();
        }
    }

    @Data
    @Builder
    public static class UserPageResponse {
        private List<UserSummary> content;
        private long totalElements;
        private int page;
        private int size;
        private boolean hasMore;
    }

    @Data
    public static class UpdateUserStatusRequest {
        @NotNull
        private Boolean active;
        private String reason;
    }

    @Data
    @Builder
    public static class ShopSummary {
        private String id;
        private String name;
        private String ownerId;
        private String city;
        private List<String> categories;
        private boolean verified;
        private boolean active;
        private long productCount;
        private String createdAt;

        public static ShopSummary from(Shop shop, long productCount) {
            String city = shop.getAddress() != null ? shop.getAddress().getCity() : null;
            return ShopSummary.builder()
                    .id(shop.getId())
                    .name(shop.getName())
                    .ownerId(shop.getOwnerId())
                    .city(city)
                    .categories(shop.getCategories())
                    .verified(Boolean.TRUE.equals(shop.getIsVerified()))
                    .active(Boolean.TRUE.equals(shop.getIsActive()))
                    .productCount(productCount)
                    .createdAt(shop.getCreatedAt() != null ? shop.getCreatedAt().toString() : null)
                    .build();
        }
    }

    @Data
    @Builder
    public static class ShopPageResponse {
        private List<ShopSummary> content;
        private long totalElements;
        private int page;
        private int size;
        private boolean hasMore;
    }

    @Data
    public static class ShopStatusRequest {
        @NotNull
        private Boolean active;
        private String reason;
    }

    @Data
    public static class ShopVerifyRequest {
        @NotNull
        private Boolean verified;
        private String reason;
    }

    @Data
    @Builder
    public static class OrderPageResponse {
        private List<OrderDto.OrderResponse> content;
        private long totalElements;
        private int page;
        private int size;
        private boolean hasMore;
    }

    @Data
    public static class RefundRequest {
        private String reason;
    }

    @Data
    @Builder
    public static class ProductSummary {
        private String id;
        private String name;
        private String shopId;
        private String category;
        private Double price;
        private boolean available;
        private boolean flagged;
        private String flagReason;
        private Integer flagCount;

        public static ProductSummary from(Product product) {
            return ProductSummary.builder()
                    .id(product.getId())
                    .name(product.getName())
                    .shopId(product.getShopId())
                    .category(product.getCategory())
                    .price(product.getPrice())
                    .available(Boolean.TRUE.equals(product.getIsAvailable()))
                    .flagged(Boolean.TRUE.equals(product.getIsFlagged()))
                    .flagReason(product.getFlagReason())
                    .flagCount(product.getFlagCount())
                    .build();
        }
    }

    @Data
    @Builder
    public static class ProductPageResponse {
        private List<ProductSummary> content;
        private long totalElements;
        private int page;
        private int size;
        private boolean hasMore;
    }

    @Data
    public static class CreateCategoryRequest {
        @NotBlank
        private String name;
        private String icon;
        private String parentCategory;
        private String type;
        private Integer displayOrder;
    }

    @Data
    public static class UpdateCategoryRequest {
        private String name;
        private String icon;
        private String parentCategory;
        private String type;
        private Integer displayOrder;
        private Boolean isActive;
    }

    @Data
    @Builder
    public static class SettingsResponse {
        private Double platformFeePercent;
        private Double deliveryFeeBase;
        private Double deliveryFeePerKm;
        private Double maxDeliveryRadiusKm;
        private Boolean maintenanceMode;
        private String announcementBanner;

        public static SettingsResponse from(PlatformSettings s) {
            return SettingsResponse.builder()
                    .platformFeePercent(s.getPlatformFeePercent())
                    .deliveryFeeBase(s.getDeliveryFeeBase())
                    .deliveryFeePerKm(s.getDeliveryFeePerKm())
                    .maxDeliveryRadiusKm(s.getMaxDeliveryRadiusKm())
                    .maintenanceMode(s.getMaintenanceMode())
                    .announcementBanner(s.getAnnouncementBanner())
                    .build();
        }
    }

    @Data
    public static class UpdateSettingsRequest {
        private Double platformFeePercent;
        private Double deliveryFeeBase;
        private Double deliveryFeePerKm;
        private Double maxDeliveryRadiusKm;
        private Boolean maintenanceMode;
        private String announcementBanner;
    }

    @Data
    @Builder
    public static class AuditLogResponse {
        private String id;
        private String adminId;
        private String adminEmail;
        private AuditLog.Action action;
        private String targetId;
        private AuditLog.TargetType targetType;
        private String details;
        private String ip;
        private String timestamp;

        public static AuditLogResponse from(AuditLog log) {
            return AuditLogResponse.builder()
                    .id(log.getId())
                    .adminId(log.getAdminId())
                    .adminEmail(log.getAdminEmail())
                    .action(log.getAction())
                    .targetId(log.getTargetId())
                    .targetType(log.getTargetType())
                    .details(log.getDetails())
                    .ip(log.getIp())
                    .timestamp(log.getTimestamp() != null ? log.getTimestamp().toString() : null)
                    .build();
        }
    }

    @Data
    @Builder
    public static class AuditLogPageResponse {
        private List<AuditLogResponse> content;
        private long totalElements;
        private int page;
        private int size;
        private boolean hasMore;
    }

    @Data
    @Builder
    public static class CategoryListResponse {
        private List<CategoryDto> categories;
    }
}
