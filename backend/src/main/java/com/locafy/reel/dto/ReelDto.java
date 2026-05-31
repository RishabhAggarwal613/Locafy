package com.locafy.reel.dto;

import com.locafy.reel.model.Reel;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class ReelDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReelResponse {
        private String id;
        private String vendorId;
        private String shopId;
        private String shopName;
        private String shopLogoUrl;
        private String productId;
        private String productName;
        private Double productPrice;
        private String title;
        private String description;
        private String videoUrl;
        private String thumbnailUrl;
        private Double duration;
        private Long likes;
        private Long saves;
        private Long views;
        private Boolean isLiked;
        private Boolean isSaved;
        private Double distanceKm;
        private Boolean isPublished;
        private String processingStatus;
        private LocalDateTime publishedAt;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeedResponse {
        private List<ReelResponse> content;
        private String nextCursor;
        private boolean hasMore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageResponse {
        private List<ReelResponse> content;
        private long totalElements;
        private int page;
        private int size;
        private boolean hasMore;
    }

    @Data
    public static class UpdateReelRequest {
        private String title;
        private String description;
        private String productId;
        private Boolean isPublished;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ToggleResponse {
        private boolean active;
        private long count;
    }

    @Data
    public static class CloudinaryNotifyRequest {
        private String notification_type;
        private String status;
        private String public_id;
        private List<EagerResult> eager;

        @Data
        public static class EagerResult {
            private String secure_url;
        }
    }
}
