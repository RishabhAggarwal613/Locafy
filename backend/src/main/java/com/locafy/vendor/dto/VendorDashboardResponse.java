package com.locafy.vendor.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VendorDashboardResponse {
    private long totalProducts;
    private long activeProducts;
    private long pendingOrders;
    private long todayOrders;
    private double todayRevenue;
    private boolean hasShop;
    private String shopId;
    private String shopName;
}
