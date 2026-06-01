package com.locafy.admin.service;

import com.locafy.admin.dto.AdminDto;
import com.locafy.delivery.repository.DeliveryProfileRepository;
import com.locafy.order.model.Order;
import com.locafy.order.repository.OrderRepository;
import com.locafy.product.repository.ProductRepository;
import com.locafy.shop.repository.ShopRepository;
import com.locafy.user.model.User;
import com.locafy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final OrderRepository orderRepository;
    private final DeliveryProfileRepository deliveryProfileRepository;
    private final ProductRepository productRepository;

    public AdminDto.AnalyticsResponse getAnalytics() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        List<Order> todayOrders = orderRepository.findByCreatedAtAfter(startOfDay);
        double gmvToday = sumGmv(todayOrders);
        double gmvMonth = orderRepository.findByCreatedAtAfter(startOfMonth).stream()
                .mapToDouble(this::orderGmv)
                .sum();

        List<AdminDto.PendingShopSummary> pendingShops = shopRepository
                .findByIsVerifiedFalseOrderByCreatedAtDesc(PageRequest.of(0, 5))
                .getContent().stream()
                .map(shop -> AdminDto.PendingShopSummary.builder()
                        .id(shop.getId())
                        .name(shop.getName())
                        .ownerId(shop.getOwnerId())
                        .city(shop.getAddress() != null ? shop.getAddress().getCity() : null)
                        .createdAt(shop.getCreatedAt() != null ? shop.getCreatedAt().toString() : null)
                        .build())
                .toList();

        return AdminDto.AnalyticsResponse.builder()
                .totalCustomers(userRepository.countByRole(User.Role.CUSTOMER))
                .totalVendors(userRepository.countByRole(User.Role.VENDOR))
                .totalDeliveryPartners(userRepository.countByRole(User.Role.DELIVERY))
                .totalAdmins(userRepository.countByRole(User.Role.ADMIN))
                .activeShops(shopRepository.countByIsActiveTrue())
                .shopsPendingVerification(shopRepository.countByIsVerifiedFalse())
                .ordersToday(todayOrders.size())
                .gmvToday(gmvToday)
                .gmvThisMonth(gmvMonth)
                .deliveryPartnersOnline(deliveryProfileRepository.countByIsOnlineTrue())
                .flaggedProducts(productRepository.countByIsFlaggedTrue())
                .pendingShops(pendingShops)
                .build();
    }

    private double sumGmv(List<Order> orders) {
        return orders.stream().mapToDouble(this::orderGmv).sum();
    }

    private double orderGmv(Order order) {
        if (order.getStatus() == Order.OrderStatus.CANCELLED
                || order.getStatus() == Order.OrderStatus.REFUNDED) {
            return 0;
        }
        if (order.getPaymentMethod() == Order.PaymentMethod.COD
                || order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            return order.getTotal() != null ? order.getTotal() : 0;
        }
        return 0;
    }
}
