package com.locafy.delivery.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "deliveryLocations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryLocation {

    @Id
    private String id;

    @Indexed
    private String orderId;

    @Indexed
    private String partnerId;

    private double latitude;

    private double longitude;

    private LocalDateTime updatedAt;
}
