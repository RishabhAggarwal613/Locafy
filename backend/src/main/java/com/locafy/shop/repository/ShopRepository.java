package com.locafy.shop.repository;

import com.locafy.shop.model.Shop;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ShopRepository extends MongoRepository<Shop, String> {
    Optional<Shop> findByOwnerId(String ownerId);
    boolean existsByOwnerId(String ownerId);
    Optional<Shop> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
