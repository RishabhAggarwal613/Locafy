package com.locafy.vendor.service;

import com.locafy.order.model.Order;
import com.locafy.order.repository.OrderRepository;
import com.locafy.product.repository.ProductRepository;
import com.locafy.shop.model.Shop;
import com.locafy.shop.repository.ShopRepository;
import com.locafy.vendor.dto.VendorDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VendorDashboardService {

    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public VendorDashboardResponse getDashboard(String vendorId) {
        Optional<Shop> shopOpt = shopRepository.findByOwnerId(vendorId);

        if (shopOpt.isEmpty()) {
            return VendorDashboardResponse.builder()
                    .hasShop(false)
                    .totalProducts(0)
                    .activeProducts(0)
                    .pendingOrders(0)
                    .todayOrders(0)
                    .todayRevenue(0)
                    .build();
        }

        Shop shop = shopOpt.get();
        long total = productRepository.countByShopId(shop.getId());
        long active = productRepository.countByShopIdAndIsAvailableTrue(shop.getId());

        long pending = orderRepository.countByShopIdAndStatus(shop.getId(), Order.OrderStatus.PLACED)
                + orderRepository.countByShopIdAndStatus(shop.getId(), Order.OrderStatus.CONFIRMED)
                + orderRepository.countByShopIdAndStatus(shop.getId(), Order.OrderStatus.PREPARING);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long todayOrders = orderRepository.countByShopIdAndCreatedAtAfter(shop.getId(), startOfDay);
        double todayRevenue = orderRepository.findByShopIdAndCreatedAtAfter(shop.getId(), startOfDay).stream()
                .filter(o -> o.getPaymentStatus() == Order.PaymentStatus.PAID
                        || o.getPaymentMethod() == Order.PaymentMethod.COD)
                .mapToDouble(o -> o.getTotal() != null ? o.getTotal() : 0)
                .sum();

        return VendorDashboardResponse.builder()
                .hasShop(true)
                .shopId(shop.getId())
                .shopName(shop.getName())
                .totalProducts(total)
                .activeProducts(active)
                .pendingOrders(pending)
                .todayOrders(todayOrders)
                .todayRevenue(todayRevenue)
                .build();
    }
}
