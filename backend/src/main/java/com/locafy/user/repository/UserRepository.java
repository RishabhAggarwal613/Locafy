package com.locafy.user.repository;

import com.locafy.user.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    long countByRole(User.Role role);
    Page<User> findByRoleOrderByCreatedAtDesc(User.Role role, Pageable pageable);
    Page<User> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
