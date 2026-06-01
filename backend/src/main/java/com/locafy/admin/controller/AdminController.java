package com.locafy.admin.controller;

import com.locafy.admin.dto.AdminDto;
import com.locafy.admin.service.*;
import com.locafy.category.dto.CategoryDto;
import com.locafy.order.dto.OrderDto;
import com.locafy.order.model.Order;
import com.locafy.user.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminAnalyticsService analyticsService;
    private final AdminUserService userService;
    private final AdminShopService shopService;
    private final AdminOrderService orderService;
    private final AdminCategoryService categoryService;
    private final AdminSettingsService settingsService;
    private final AdminProductService productService;
    private final AuditLogService auditLogService;

    @GetMapping("/analytics")
    public ResponseEntity<AdminDto.AnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getAnalytics());
    }

    @GetMapping("/users")
    public ResponseEntity<AdminDto.UserPageResponse> listUsers(
            @RequestParam(required = false) User.Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userService.listUsers(role, page, size));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<AdminDto.UserSummary> updateUserStatus(
            @AuthenticationPrincipal String adminId,
            @PathVariable String id,
            @Valid @RequestBody AdminDto.UpdateUserStatusRequest req,
            HttpServletRequest request) {
        return ResponseEntity.ok(userService.updateStatus(adminId, id, req, clientIp(request)));
    }

    @GetMapping("/shops")
    public ResponseEntity<AdminDto.ShopPageResponse> listShops(
            @RequestParam(required = false) Boolean pendingOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(shopService.listShops(pendingOnly, page, size));
    }

    @PutMapping("/shops/{id}/verify")
    public ResponseEntity<AdminDto.ShopSummary> verifyShop(
            @AuthenticationPrincipal String adminId,
            @PathVariable String id,
            @Valid @RequestBody AdminDto.ShopVerifyRequest req,
            HttpServletRequest request) {
        return ResponseEntity.ok(shopService.verifyShop(adminId, id, req, clientIp(request)));
    }

    @PutMapping("/shops/{id}/status")
    public ResponseEntity<AdminDto.ShopSummary> updateShopStatus(
            @AuthenticationPrincipal String adminId,
            @PathVariable String id,
            @Valid @RequestBody AdminDto.ShopStatusRequest req,
            HttpServletRequest request) {
        return ResponseEntity.ok(shopService.updateShopStatus(adminId, id, req, clientIp(request)));
    }

    @GetMapping("/orders")
    public ResponseEntity<AdminDto.OrderPageResponse> listOrders(
            @RequestParam(required = false) Order.OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.listOrders(status, page, size));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderDto.OrderResponse> overrideOrderStatus(
            @AuthenticationPrincipal String adminId,
            @PathVariable String id,
            @Valid @RequestBody OrderDto.UpdateStatusRequest req,
            HttpServletRequest request) {
        return ResponseEntity.ok(orderService.overrideStatus(adminId, id, req, clientIp(request)));
    }

    @PostMapping("/orders/{id}/refund")
    public ResponseEntity<OrderDto.OrderResponse> refundOrder(
            @AuthenticationPrincipal String adminId,
            @PathVariable String id,
            @RequestBody(required = false) AdminDto.RefundRequest req,
            HttpServletRequest request) {
        AdminDto.RefundRequest body = req != null ? req : new AdminDto.RefundRequest();
        return ResponseEntity.ok(orderService.refundOrder(adminId, id, body, clientIp(request)));
    }

    @GetMapping("/categories")
    public ResponseEntity<AdminDto.CategoryListResponse> listCategories() {
        return ResponseEntity.ok(categoryService.listCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryDto> createCategory(
            @AuthenticationPrincipal String adminId,
            @Valid @RequestBody AdminDto.CreateCategoryRequest req,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.createCategory(adminId, req, clientIp(request)));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryDto> updateCategory(
            @AuthenticationPrincipal String adminId,
            @PathVariable String id,
            @Valid @RequestBody AdminDto.UpdateCategoryRequest req,
            HttpServletRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(adminId, id, req, clientIp(request)));
    }

    @GetMapping("/settings")
    public ResponseEntity<AdminDto.SettingsResponse> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<AdminDto.SettingsResponse> updateSettings(
            @AuthenticationPrincipal String adminId,
            @Valid @RequestBody AdminDto.UpdateSettingsRequest req,
            HttpServletRequest request) {
        return ResponseEntity.ok(settingsService.updateSettings(adminId, req, clientIp(request)));
    }

    @GetMapping("/products/flagged")
    public ResponseEntity<AdminDto.ProductPageResponse> listFlaggedProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.listFlagged(page, size));
    }

    @PutMapping("/products/{id}/hide")
    public ResponseEntity<AdminDto.ProductSummary> hideProduct(
            @AuthenticationPrincipal String adminId,
            @PathVariable String id,
            HttpServletRequest request) {
        return ResponseEntity.ok(productService.hideProduct(adminId, id, clientIp(request)));
    }

    @PutMapping("/products/{id}/dismiss-flag")
    public ResponseEntity<AdminDto.ProductSummary> dismissFlag(
            @AuthenticationPrincipal String adminId,
            @PathVariable String id,
            HttpServletRequest request) {
        return ResponseEntity.ok(productService.dismissFlag(adminId, id, clientIp(request)));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<AdminDto.AuditLogPageResponse> listAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditLogService.list(page, size));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
