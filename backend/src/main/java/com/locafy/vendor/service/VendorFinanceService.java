package com.locafy.vendor.service;

import com.locafy.common.exception.BusinessException;
import com.locafy.order.model.Order;
import com.locafy.order.repository.OrderRepository;
import com.locafy.shop.model.Shop;
import com.locafy.shop.repository.ShopRepository;
import com.locafy.vendor.dto.VendorFinanceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorFinanceService {

    private final ShopRepository shopRepository;
    private final OrderRepository orderRepository;

    public VendorFinanceResponse getFinanceSummary(String vendorId) {
        Shop shop = shopRepository.findByOwnerId(vendorId)
                .orElseThrow(() -> new BusinessException("Shop not found"));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        List<Order> todayOrders = orderRepository.findByShopIdAndCreatedAtAfter(shop.getId(), startOfDay);
        List<Order> monthOrders = orderRepository.findByShopIdAndCreatedAtAfter(shop.getId(), startOfMonth);
        List<Order> allOrders = orderRepository.findByShopId(shop.getId());

        return VendorFinanceResponse.builder()
                .shopId(shop.getId())
                .shopName(shop.getName())
                .todayRevenue(sumRevenue(todayOrders))
                .todayOrders(countCompleted(todayOrders))
                .monthRevenue(sumRevenue(monthOrders))
                .monthOrders(countCompleted(monthOrders))
                .totalRevenue(sumRevenue(allOrders))
                .totalOrders(countCompleted(allOrders))
                .platformFeesCollected(sumPlatformFees(allOrders))
                .build();
    }

    private double sumRevenue(List<Order> orders) {
        return orders.stream()
                .filter(this::countsAsRevenue)
                .mapToDouble(o -> o.getTotal() != null ? o.getTotal() : 0)
                .sum();
    }

    private long countCompleted(List<Order> orders) {
        return orders.stream().filter(this::countsAsRevenue).count();
    }

    private double sumPlatformFees(List<Order> orders) {
        return orders.stream()
                .filter(this::countsAsRevenue)
                .mapToDouble(o -> o.getPlatformFee() != null ? o.getPlatformFee() : 0)
                .sum();
    }

    private boolean countsAsRevenue(Order order) {
        if (order.getStatus() == Order.OrderStatus.CANCELLED
                || order.getStatus() == Order.OrderStatus.REFUNDED) {
            return false;
        }
        return order.getPaymentMethod() == Order.PaymentMethod.COD
                || order.getPaymentStatus() == Order.PaymentStatus.PAID;
    }
}
