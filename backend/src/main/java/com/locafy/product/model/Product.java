package com.locafy.product.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    private String id;

    @Indexed
    private String shopId;

    @Indexed
    private String vendorId;

    private String name;

    private String description;

    private Double price;

    private Double discountedPrice;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    private String category;

    private String subCategory;

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Builder.Default
    private Integer stock = 0;

    @Builder.Default
    private Boolean isAvailable = true;

    @Builder.Default
    private String unit = "piece";

    private Double weight;

    private String sku;

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer reviewCount = 0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
