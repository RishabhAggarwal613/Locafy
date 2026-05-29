package com.locafy.auth.controller;

import com.locafy.auth.dto.*;
import com.locafy.auth.service.AuthService;
import com.locafy.auth.service.GoogleAuthService;
import com.locafy.common.exception.UnauthorizedException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;

    @Value("${jwt.refresh-expiry}")
    private long refreshExpiry;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // ── Email/Password ─────────────────────────────────────────────────────────

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(
            @Valid @RequestBody SignupRequest req,
            HttpServletResponse response) {
        AuthResponse auth = authService.signup(req);
        setRefreshCookie(response, auth.getRefreshToken());
        auth.setRefreshToken(null); // never send refresh in body
        return ResponseEntity.status(HttpStatus.CREATED).body(auth);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletResponse response) {
        AuthResponse auth = authService.login(req);
        setRefreshCookie(response, auth.getRefreshToken());
        auth.setRefreshToken(null);
        return ResponseEntity.ok(auth);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        String refreshToken = extractRefreshCookie(request);
        if (!StringUtils.hasText(refreshToken)) {
            throw new UnauthorizedException("Refresh token not found");
        }
        AuthResponse auth = authService.refresh(refreshToken);
        setRefreshCookie(response, auth.getRefreshToken());
        auth.setRefreshToken(null);
        return ResponseEntity.ok(auth);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            @AuthenticationPrincipal String userId) {
        String accessToken = extractBearerToken(request);
        if (StringUtils.hasText(accessToken) && StringUtils.hasText(userId)) {
            authService.logout(accessToken, userId);
        }
        clearRefreshCookie(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ── Google OAuth ───────────────────────────────────────────────────────────

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleSignIn(
            @Valid @RequestBody GoogleAuthRequest req,
            HttpServletResponse response) {
        AuthResponse auth = googleAuthService.authenticateWithGoogle(req.getIdToken(), req.getRole());
        setRefreshCookie(response, auth.getRefreshToken());
        auth.setRefreshToken(null);
        return ResponseEntity.ok(auth);
    }

    @PostMapping("/google/link")
    public ResponseEntity<Map<String, String>> linkGoogle(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal String userId) {
        String idToken = body.get("idToken");
        if (!StringUtils.hasText(idToken)) {
            throw new UnauthorizedException("Google ID token is required");
        }
        googleAuthService.linkGoogleAccount(userId, idToken);
        return ResponseEntity.ok(Map.of("message", "Google account linked successfully"));
    }

    @DeleteMapping("/google/unlink")
    public ResponseEntity<Map<String, String>> unlinkGoogle(
            @AuthenticationPrincipal String userId) {
        googleAuthService.unlinkGoogleAccount(userId);
        return ResponseEntity.ok(Map.of("message", "Google account unlinked successfully"));
    }

    // ── Cookie helpers ─────────────────────────────────────────────────────────

    private void setRefreshCookie(HttpServletResponse response, String refreshToken) {
        if (refreshToken == null) return;
        Cookie cookie = new Cookie("locafy-refresh", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // set true in production (HTTPS)
        cookie.setPath("/api/auth/refresh");
        cookie.setMaxAge((int) refreshExpiry);
        response.addCookie(cookie);
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("locafy-refresh", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/auth/refresh");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String extractRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> "locafy-refresh".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
