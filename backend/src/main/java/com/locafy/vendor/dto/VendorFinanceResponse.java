package com.locafy.vendor.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VendorFinanceResponse {
    private String shopId;
    private String shopName;
    private double todayRevenue;
    private long todayOrders;
    private double monthRevenue;
    private long monthOrders;
    private double totalRevenue;
    private long totalOrders;
    private double platformFeesCollected;
}
