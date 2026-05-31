package com.locafy.delivery.controller;

import com.locafy.delivery.dto.DeliveryDto;
import com.locafy.delivery.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DELIVERY')")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/profile")
    public ResponseEntity<DeliveryDto.ProfileResponse> getProfile(@AuthenticationPrincipal String partnerId) {
        return ResponseEntity.ok(deliveryService.getProfile(partnerId));
    }

    @PutMapping("/profile")
    public ResponseEntity<DeliveryDto.ProfileResponse> updateProfile(
            @AuthenticationPrincipal String partnerId,
            @RequestBody DeliveryDto.UpdateProfileRequest req) {
        return ResponseEntity.ok(deliveryService.updateProfile(partnerId, req));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DeliveryDto.DashboardResponse> getDashboard(@AuthenticationPrincipal String partnerId) {
        return ResponseEntity.ok(deliveryService.getDashboard(partnerId));
    }

    @GetMapping("/orders/available")
    public ResponseEntity<DeliveryDto.OrderPageResponse> getAvailableOrders(
            @AuthenticationPrincipal String partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(deliveryService.getAvailableOrders(partnerId, page, size));
    }

    @GetMapping("/orders/active")
    public ResponseEntity<DeliveryDto.OrderPageResponse> getActiveOrders(
            @AuthenticationPrincipal String partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(deliveryService.getActiveOrders(partnerId, page, size));
    }

    @GetMapping("/orders/history")
    public ResponseEntity<DeliveryDto.OrderPageResponse> getHistory(
            @AuthenticationPrincipal String partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(deliveryService.getHistory(partnerId, page, size));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<DeliveryDto.DeliveryOrderResponse> getOrder(
            @AuthenticationPrincipal String partnerId,
            @PathVariable String id) {
        return ResponseEntity.ok(deliveryService.getOrderForPartner(partnerId, id));
    }

    @PostMapping("/orders/{id}/accept")
    public ResponseEntity<DeliveryDto.DeliveryOrderResponse> acceptOrder(
            @AuthenticationPrincipal String partnerId,
            @PathVariable String id) {
        return ResponseEntity.ok(deliveryService.acceptOrder(partnerId, id));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<DeliveryDto.DeliveryOrderResponse> updateStatus(
            @AuthenticationPrincipal String partnerId,
            @PathVariable String id,
            @Valid @RequestBody DeliveryDto.UpdateDeliveryStatusRequest req) {
        return ResponseEntity.ok(deliveryService.updateDeliveryStatus(
                partnerId, id, req.getStatus(), req.getNote()));
    }

    @PostMapping("/orders/{id}/location")
    public ResponseEntity<DeliveryDto.LocationResponse> updateLocation(
            @AuthenticationPrincipal String partnerId,
            @PathVariable String id,
            @Valid @RequestBody DeliveryDto.LocationUpdateRequest req) {
        return ResponseEntity.ok(deliveryService.updateLocation(
                partnerId, id, req.getLatitude(), req.getLongitude()));
    }
}
