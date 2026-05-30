package com.locafy.vendor.service;

import com.locafy.product.repository.ProductRepository;
import com.locafy.shop.model.Shop;
import com.locafy.shop.repository.ShopRepository;
import com.locafy.vendor.dto.VendorDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VendorDashboardService {

    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;

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

        return VendorDashboardResponse.builder()
                .hasShop(true)
                .shopId(shop.getId())
                .shopName(shop.getName())
                .totalProducts(total)
                .activeProducts(active)
                .pendingOrders(0)
                .todayOrders(0)
                .todayRevenue(0)
                .build();
    }
}
