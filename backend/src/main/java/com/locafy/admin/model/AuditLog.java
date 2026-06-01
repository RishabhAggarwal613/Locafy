package com.locafy.admin.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "auditLogs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    private String id;

    @Indexed
    private String adminId;

    private String adminEmail;

    @Indexed
    private Action action;

    @Indexed
    private String targetId;

    private TargetType targetType;

    private String details;

    private String ip;

    @CreatedDate
    @Indexed
    private LocalDateTime timestamp;

    public enum Action {
        USER_SUSPENDED,
        USER_ACTIVATED,
        SHOP_VERIFIED,
        SHOP_UNVERIFIED,
        SHOP_SUSPENDED,
        SHOP_ACTIVATED,
        ORDER_STATUS_OVERRIDE,
        ORDER_REFUNDED,
        CATEGORY_CREATED,
        CATEGORY_UPDATED,
        PRODUCT_HIDDEN,
        PRODUCT_FLAG_DISMISSED,
        SETTINGS_UPDATED
    }

    public enum TargetType {
        USER, SHOP, ORDER, PRODUCT, CATEGORY, SETTINGS
    }
}
