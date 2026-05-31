package com.locafy.delivery.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "deliveryProfiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryProfile {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    @Builder.Default
    private Boolean isOnline = false;

    /** Centre of delivery zone — [lng, lat] */
    private double[] zoneCenter;

    @Builder.Default
    private Double zoneRadiusKm = 5.0;

    private String vehicleType;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
