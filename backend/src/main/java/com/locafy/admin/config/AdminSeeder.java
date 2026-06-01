package com.locafy.admin.config;

import com.locafy.user.model.User;
import com.locafy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements ApplicationRunner {

    private static final String DEFAULT_ADMIN_EMAIL = "admin@locafy.in";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.initial-password:Admin1234}")
    private String initialPassword;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByEmail(DEFAULT_ADMIN_EMAIL).isPresent()) {
            return;
        }
        log.info("Seeding default admin account ({})", DEFAULT_ADMIN_EMAIL);
        userRepository.save(User.builder()
                .email(DEFAULT_ADMIN_EMAIL)
                .passwordHash(passwordEncoder.encode(initialPassword))
                .name("Locafy Admin")
                .role(User.Role.ADMIN)
                .authProvider(User.AuthProvider.EMAIL)
                .isVerified(true)
                .isActive(true)
                .build());
    }
}
