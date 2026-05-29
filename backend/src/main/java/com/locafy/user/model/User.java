package com.locafy.user.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    @Indexed(sparse = true)
    private String googleId;

    private AuthProvider authProvider;

    private Role role;

    private String name;

    private String phone;

    private String avatarUrl;

    private boolean isVerified;

    // Boolean wrapper so absent MongoDB field → null (treated as active, not suspended)
    private Boolean isActive;

    private Locality locality;

    private List<SavedAddress> savedAddresses;

    private NotificationPrefs notificationPrefs;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime lastLoginAt;

    public enum Role { CUSTOMER, VENDOR, DELIVERY, ADMIN }
    public enum AuthProvider { EMAIL, GOOGLE, BOTH }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Locality {
        private String name;
        private String city;
        private String state;
        private String pincode;
        private GeoPoint coordinates;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SavedAddress {
        private String id;
        private String label;
        private String line1;
        private String line2;
        private String city;
        private String pincode;
        private GeoPoint coordinates;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationPrefs {
        private boolean sms = true;
        private boolean email = true;
        private boolean push = true;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeoPoint {
        private String type = "Point";
        private double[] coordinates; // [lng, lat]
    }
}
