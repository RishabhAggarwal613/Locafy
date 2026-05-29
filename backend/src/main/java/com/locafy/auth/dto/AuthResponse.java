package com.locafy.auth.dto;

import com.locafy.user.model.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserInfo user;

    @Data
    @Builder
    public static class UserInfo {
        private String id;
        private String email;
        private String name;
        private String phone;
        private String avatarUrl;
        private User.Role role;
        private User.AuthProvider authProvider;
        private boolean isVerified;
    }

    public static AuthResponse of(String accessToken, User user) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .user(UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .phone(user.getPhone())
                        .avatarUrl(user.getAvatarUrl())
                        .role(user.getRole())
                        .authProvider(user.getAuthProvider())
                        .isVerified(user.isVerified())
                        .build())
                .build();
    }
}
