package com.locafy.cart.repository;

import com.locafy.cart.model.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CartRepository extends MongoRepository<Cart, String> {
    Optional<Cart> findByCustomerId(String customerId);
    void deleteByCustomerId(String customerId);
}
