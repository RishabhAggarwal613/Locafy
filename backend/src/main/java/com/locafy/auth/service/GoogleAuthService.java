package com.locafy.auth.service;

import com.locafy.auth.dto.AuthResponse;
import com.locafy.auth.jwt.JwtUtil;
import com.locafy.common.exception.UnauthorizedException;
import com.locafy.user.model.User;
import com.locafy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RestTemplate restTemplate;

    @Value("${google.client-id}")
    private String googleClientId;

    @Value("${jwt.refresh-expiry}")
    private long refreshExpiry;

    private static final String REFRESH_KEY_PREFIX = "locafy:refresh:";
    private static final String GOOGLE_TOKEN_INFO_URL =
            "https://oauth2.googleapis.com/tokeninfo?id_token=";

    public AuthResponse authenticateWithGoogle(String idToken, User.Role requestedRole) {
        if (requestedRole == User.Role.ADMIN) {
            throw new UnauthorizedException("Admin accounts do not support Google sign-in");
        }

        GoogleUserInfo googleUser = verifyIdToken(idToken);
        User user = upsertUser(googleUser, requestedRole);

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Your account has been suspended. Contact support.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    public void linkGoogleAccount(String userId, String idToken) {
        GoogleUserInfo googleUser = verifyIdToken(idToken);

        if (userRepository.findByGoogleId(googleUser.sub()).isPresent()) {
            throw new UnauthorizedException("This Google account is already linked to another user");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        user.setGoogleId(googleUser.sub());
        user.setAuthProvider(User.AuthProvider.BOTH);
        if (user.getAvatarUrl() == null && googleUser.picture() != null) {
            user.setAvatarUrl(googleUser.picture());
        }
        userRepository.save(user);
    }

    public void unlinkGoogleAccount(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (user.getPasswordHash() == null) {
            throw new UnauthorizedException(
                    "Cannot unlink Google — no password set. Please set a password first.");
        }

        user.setGoogleId(null);
        user.setAuthProvider(User.AuthProvider.EMAIL);
        userRepository.save(user);
    }

    @SuppressWarnings("unchecked")
    private GoogleUserInfo verifyIdToken(String idToken) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new UnauthorizedException("Google OAuth is not configured on this server");
        }

        try {
            Map<String, Object> tokenInfo = restTemplate.getForObject(
                    GOOGLE_TOKEN_INFO_URL + idToken, Map.class);

            if (tokenInfo == null) {
                throw new UnauthorizedException("Could not verify Google ID token");
            }

            // Verify audience matches our client ID
            String aud = (String) tokenInfo.get("aud");
            if (!googleClientId.equals(aud)) {
                throw new UnauthorizedException("Google token audience mismatch");
            }

            String sub = (String) tokenInfo.get("sub");
            String email = (String) tokenInfo.get("email");
            String name = (String) tokenInfo.get("name");
            String picture = (String) tokenInfo.get("picture");

            if (sub == null || email == null) {
                throw new UnauthorizedException("Incomplete Google token payload");
            }

            return new GoogleUserInfo(sub, email, name, picture);
        } catch (UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Google token verification failed: {}", e.getMessage());
            throw new UnauthorizedException("Invalid Google ID token");
        }
    }

    private User upsertUser(GoogleUserInfo googleUser, User.Role role) {
        return userRepository.findByGoogleId(googleUser.sub())
                .or(() -> userRepository.findByEmail(googleUser.email()))
                .map(existing -> {
                    if (existing.getGoogleId() == null) {
                        existing.setGoogleId(googleUser.sub());
                        existing.setAuthProvider(
                                existing.getPasswordHash() != null
                                        ? User.AuthProvider.BOTH
                                        : User.AuthProvider.GOOGLE);
                    }
                    if (existing.getAvatarUrl() == null && googleUser.picture() != null) {
                        existing.setAvatarUrl(googleUser.picture());
                    }
                    existing.setUpdatedAt(LocalDateTime.now());
                    return userRepository.save(existing);
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(googleUser.email())
                        .name(googleUser.name())
                        .googleId(googleUser.sub())
                        .avatarUrl(googleUser.picture())
                        .role(role)
                        .authProvider(User.AuthProvider.GOOGLE)
                        .isVerified(true)
                        .isActive(Boolean.TRUE)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()));
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        redisTemplate.opsForValue().set(
                REFRESH_KEY_PREFIX + user.getId(),
                refreshToken,
                refreshExpiry,
                TimeUnit.SECONDS
        );

        AuthResponse response = AuthResponse.of(accessToken, user);
        response.setRefreshToken(refreshToken);
        return response;
    }

    private record GoogleUserInfo(String sub, String email, String name, String picture) {}
}
