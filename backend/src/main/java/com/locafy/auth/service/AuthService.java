package com.locafy.auth.service;

import com.locafy.auth.dto.*;
import com.locafy.auth.jwt.JwtUtil;
import com.locafy.common.exception.ConflictException;
import com.locafy.common.exception.UnauthorizedException;
import com.locafy.user.model.User;
import com.locafy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${jwt.refresh-expiry}")
    private long refreshExpiry;

    private static final String REFRESH_KEY_PREFIX = "locafy:refresh:";
    private static final String BLOCKLIST_KEY_PREFIX = "locafy:token:blocklist:";

    public AuthResponse signup(SignupRequest req) {
        String normalizedEmail = req.getEmail().toLowerCase().strip();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("An account with this email already exists");
        }
        if (req.getPhone() != null && !req.getPhone().isBlank()
                && userRepository.existsByPhone(req.getPhone())) {
            throw new ConflictException("An account with this phone number already exists");
        }

        // Prevent creating ADMIN accounts via self-signup
        if (req.getRole() == User.Role.ADMIN) {
            throw new UnauthorizedException("Admin accounts cannot be self-registered");
        }

        User user = User.builder()
                .name(req.getName())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(req.getRole())
                .authProvider(User.AuthProvider.EMAIL)
                .isVerified(false)
                .isActive(Boolean.TRUE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase().strip())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // Boolean.FALSE.equals handles null (absent field) gracefully — null = active
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Your account has been suspended. Contact support.");
        }

        if (user.getPasswordHash() == null) {
            throw new UnauthorizedException("This account uses Google sign-in. Please sign in with Google.");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        String userId = jwtUtil.extractUserId(refreshToken);
        String storedToken = (String) redisTemplate.opsForValue().get(REFRESH_KEY_PREFIX + userId);

        if (!refreshToken.equals(storedToken)) {
            throw new UnauthorizedException("Refresh token has been revoked or replaced");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Account is suspended");
        }

        // Rotate refresh token
        String newRefreshToken = jwtUtil.generateRefreshToken(user);
        storeRefreshToken(userId, newRefreshToken);

        String newAccessToken = jwtUtil.generateAccessToken(user);
        return AuthResponse.of(newAccessToken, user);
    }

    public void logout(String accessToken, String userId) {
        // Blocklist the access token until it expires
        long remaining = jwtUtil.getTokenRemainingMs(accessToken);
        if (remaining > 0) {
            redisTemplate.opsForValue().set(
                    BLOCKLIST_KEY_PREFIX + accessToken,
                    "1",
                    remaining,
                    TimeUnit.MILLISECONDS
            );
        }
        // Remove refresh token
        redisTemplate.delete(REFRESH_KEY_PREFIX + userId);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        storeRefreshToken(user.getId(), refreshToken);

        AuthResponse response = AuthResponse.of(accessToken, user);
        response.setRefreshToken(refreshToken);
        return response;
    }

    private void storeRefreshToken(String userId, String refreshToken) {
        redisTemplate.opsForValue().set(
                REFRESH_KEY_PREFIX + userId,
                refreshToken,
                refreshExpiry,
                TimeUnit.SECONDS
        );
    }
}
