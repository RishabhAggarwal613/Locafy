package com.locafy.vendor.controller;

import com.locafy.product.dto.ProductDto;
import com.locafy.product.service.ProductService;
import com.locafy.shop.dto.ShopDto;
import com.locafy.shop.service.ShopService;
import com.locafy.vendor.dto.VendorDashboardResponse;
import com.locafy.vendor.service.VendorDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VENDOR')")
public class VendorController {

    private final VendorDashboardService dashboardService;
    private final ShopService shopService;
    private final ProductService productService;

    @GetMapping("/dashboard")
    public ResponseEntity<VendorDashboardResponse> getDashboard(@AuthenticationPrincipal String vendorId) {
        return ResponseEntity.ok(dashboardService.getDashboard(vendorId));
    }

    @GetMapping("/me/shop")
    public ResponseEntity<ShopDto.ShopResponse> getMyShop(@AuthenticationPrincipal String vendorId) {
        return ResponseEntity.ok(shopService.getShopByOwner(vendorId));
    }

    @GetMapping("/me/products")
    public ResponseEntity<ProductDto.PageResponse<ProductDto.ProductResponse>> getMyProducts(
            @AuthenticationPrincipal String vendorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.listByVendor(vendorId, page, size));
    }
}
