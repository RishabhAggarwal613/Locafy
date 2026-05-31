package com.locafy.order.repository;

import com.locafy.order.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, String> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);
    Page<Order> findByCustomerIdOrderByCreatedAtDesc(String customerId, Pageable pageable);
    Page<Order> findByShopIdOrderByCreatedAtDesc(String shopId, Pageable pageable);
    Page<Order> findByShopIdAndStatusOrderByCreatedAtDesc(String shopId, Order.OrderStatus status, Pageable pageable);
    long countByShopIdAndStatus(String shopId, Order.OrderStatus status);
    long countByShopIdAndCreatedAtAfter(String shopId, LocalDateTime after);
    List<Order> findByShopIdAndCreatedAtAfter(String shopId, LocalDateTime after);
}
