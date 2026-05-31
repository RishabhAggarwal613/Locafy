package com.locafy.order.controller;

import com.locafy.order.dto.OrderDto;
import com.locafy.order.model.Order;
import com.locafy.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final com.locafy.delivery.service.DeliveryService deliveryService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto.PlaceOrderResponse> placeOrder(
            @AuthenticationPrincipal String customerId,
            @Valid @RequestBody OrderDto.PlaceOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.placeOrder(customerId, req));
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto.OrderPageResponse> getCustomerOrders(
            @AuthenticationPrincipal String customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.getCustomerOrders(customerId, page, size));
    }

    @GetMapping("/vendor")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<OrderDto.OrderPageResponse> getVendorOrders(
            @AuthenticationPrincipal String vendorId,
            @RequestParam(required = false) Order.OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.getVendorOrders(vendorId, status, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER','VENDOR')")
    public ResponseEntity<OrderDto.OrderResponse> getOrder(
            @AuthenticationPrincipal String userId,
            @PathVariable String id) {
        boolean isVendor = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_VENDOR"));
        if (isVendor) {
            return ResponseEntity.ok(orderService.getOrderForVendor(userId, id));
        }
        return ResponseEntity.ok(orderService.getOrderForCustomer(userId, id));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDto.OrderResponse> cancelOrder(
            @AuthenticationPrincipal String customerId,
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(orderService.cancelOrder(customerId, id, reason));
    }

    @GetMapping("/{id}/location")
    @PreAuthorize("hasAnyRole('CUSTOMER','DELIVERY')")
    public ResponseEntity<com.locafy.delivery.dto.DeliveryDto.LocationResponse> getOrderLocation(
            @AuthenticationPrincipal String userId,
            @PathVariable String id) {
        boolean isDelivery = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DELIVERY"));
        return ResponseEntity.ok(deliveryService.getLocationForOrder(id, userId, isDelivery));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<OrderDto.OrderResponse> updateStatus(
            @AuthenticationPrincipal String vendorId,
            @PathVariable String id,
            @Valid @RequestBody OrderDto.UpdateStatusRequest req) {
        return ResponseEntity.ok(orderService.updateVendorStatus(vendorId, id, req.getStatus(), req.getNote()));
    }
}
