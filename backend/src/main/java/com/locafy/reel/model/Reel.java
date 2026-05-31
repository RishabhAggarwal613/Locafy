package com.locafy.reel.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "reels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reel {

    public enum ProcessingStatus { PROCESSING, READY }

    @Id
    private String id;

    @Indexed
    private String vendorId;

    @Indexed
    private String shopId;

    private String productId;

    private String title;

    private String description;

    private String videoUrl;

    private String thumbnailUrl;

    private String cloudinaryPublicId;

    @Builder.Default
    private Double duration = 0.0;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint shopLocation;

    @Builder.Default
    private Long likes = 0L;

    @Builder.Default
    private Long saves = 0L;

    @Builder.Default
    private Long views = 0L;

    @Builder.Default
    private List<String> likedBy = new ArrayList<>();

    @Builder.Default
    private List<String> savedBy = new ArrayList<>();

    @Builder.Default
    private Boolean isPublished = false;

    private LocalDateTime publishedAt;

    @Builder.Default
    private ProcessingStatus processingStatus = ProcessingStatus.PROCESSING;

    @CreatedDate
    private LocalDateTime createdAt;
}
