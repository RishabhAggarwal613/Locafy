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

    Page<Order> findByStatusAndFulfillmentTypeAndDeliveryPartnerIdIsNullOrderByCreatedAtDesc(
            Order.OrderStatus status, Order.FulfillmentType fulfillmentType, Pageable pageable);

    Page<Order> findByDeliveryPartnerIdAndStatusInOrderByCreatedAtDesc(
            String deliveryPartnerId, List<Order.OrderStatus> statuses, Pageable pageable);

    Page<Order> findByDeliveryPartnerIdAndStatusOrderByDeliveredAtDesc(
            String deliveryPartnerId, Order.OrderStatus status, Pageable pageable);

    long countByDeliveryPartnerIdAndStatusAndDeliveredAtAfter(
            String deliveryPartnerId, Order.OrderStatus status, LocalDateTime after);

    long countByDeliveryPartnerIdAndStatus(String deliveryPartnerId, Order.OrderStatus status);

    Optional<Order> findByIdAndDeliveryPartnerId(String id, String deliveryPartnerId);
}
