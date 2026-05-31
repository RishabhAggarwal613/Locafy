package com.locafy.delivery.repository;

import com.locafy.delivery.model.DeliveryLocation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DeliveryLocationRepository extends MongoRepository<DeliveryLocation, String> {
    Optional<DeliveryLocation> findFirstByOrderIdOrderByUpdatedAtDesc(String orderId);
}
