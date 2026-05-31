package com.locafy.reel.repository;

import com.locafy.reel.model.Reel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ReelRepository extends MongoRepository<Reel, String> {

    Page<Reel> findByVendorIdOrderByCreatedAtDesc(String vendorId, Pageable pageable);

    List<Reel> findByShopIdOrderByCreatedAtDesc(String shopId);

    Optional<Reel> findByCloudinaryPublicId(String cloudinaryPublicId);

    Page<Reel> findBySavedByContainingOrderByCreatedAtDesc(String customerId, Pageable pageable);
}
