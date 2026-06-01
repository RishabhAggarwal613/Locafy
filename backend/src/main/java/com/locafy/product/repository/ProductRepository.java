package com.locafy.product.repository;

import com.locafy.product.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product, String> {
    Page<Product> findByShopId(String shopId, Pageable pageable);
    List<Product> findByShopId(String shopId);
    Page<Product> findByVendorId(String vendorId, Pageable pageable);
    long countByShopId(String shopId);
    long countByShopIdAndIsAvailableTrue(String shopId);
    Optional<Product> findByIdAndVendorId(String id, String vendorId);
    Page<Product> findByIsFlaggedTrueOrderByUpdatedAtDesc(Pageable pageable);
    long countByIsFlaggedTrue();
}
