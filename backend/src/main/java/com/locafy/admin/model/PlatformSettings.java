package com.locafy.admin.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "platformSettings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformSettings {

    public static final String SINGLETON_ID = "platform";

    @Id
    @Builder.Default
    private String id = SINGLETON_ID;

    @Builder.Default
    private Double platformFeePercent = 10.0;

    @Builder.Default
    private Double deliveryFeeBase = 30.0;

    @Builder.Default
    private Double deliveryFeePerKm = 5.0;

    @Builder.Default
    private Double maxDeliveryRadiusKm = 10.0;

    @Builder.Default
    private Boolean maintenanceMode = false;

    private String announcementBanner;
}
