package com.locafy.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.locafy.auth.jwt.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Instant;
import java.util.Map;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/shops/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/reels/cloudinary-notify").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reels/saved").hasRole("CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/reels/mine").hasRole("VENDOR")
                .requestMatchers(HttpMethod.POST, "/api/reels/*/like", "/api/reels/*/save").hasRole("CUSTOMER")
                .requestMatchers(HttpMethod.POST, "/api/reels").hasRole("VENDOR")
                .requestMatchers(HttpMethod.PUT, "/api/reels/**").hasRole("VENDOR")
                .requestMatchers(HttpMethod.DELETE, "/api/reels/**").hasRole("VENDOR")
                .requestMatchers(HttpMethod.GET, "/api/reels/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/search/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers("/api/payments/webhook").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                // Vendor write endpoints
                .requestMatchers(HttpMethod.POST, "/api/shops/**").hasRole("VENDOR")
                .requestMatchers(HttpMethod.PUT, "/api/shops/**").hasRole("VENDOR")
                .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("VENDOR")
                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("VENDOR")
                .requestMatchers(HttpMethod.PATCH, "/api/products/**").hasRole("VENDOR")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("VENDOR")
                // Role-protected endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/vendors/**").hasRole("VENDOR")
                .requestMatchers("/api/delivery/**").hasRole("DELIVERY")
                .requestMatchers("/api/customers/**").hasRole("CUSTOMER")
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, e) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    new ObjectMapper().writeValue(response.getOutputStream(), Map.of(
                        "status", 401,
                        "error", "Unauthorized",
                        "message", "Authentication required",
                        "timestamp", Instant.now().toString(),
                        "path", request.getRequestURI()
                    ));
                })
                .accessDeniedHandler((request, response, e) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    new ObjectMapper().writeValue(response.getOutputStream(), Map.of(
                        "status", 403,
                        "error", "Forbidden",
                        "message", "You do not have permission to access this resource",
                        "timestamp", Instant.now().toString(),
                        "path", request.getRequestURI()
                    ));
                })
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendUrl));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
