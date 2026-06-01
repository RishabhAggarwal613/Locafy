package com.locafy.delivery.repository;

import com.locafy.delivery.model.DeliveryProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DeliveryProfileRepository extends MongoRepository<DeliveryProfile, String> {
    Optional<DeliveryProfile> findByUserId(String userId);
    long countByIsOnlineTrue();
}
