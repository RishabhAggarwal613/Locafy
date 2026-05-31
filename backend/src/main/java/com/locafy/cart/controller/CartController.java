package com.locafy.cart.controller;

import com.locafy.cart.dto.CartDto;
import com.locafy.cart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartDto.CartResponse> getCart(@AuthenticationPrincipal String customerId) {
        return ResponseEntity.ok(cartService.getCart(customerId));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDto.CartResponse> addItem(
            @AuthenticationPrincipal String customerId,
            @Valid @RequestBody CartDto.AddItemRequest req) {
        int qty = req.getQuantity() != null ? req.getQuantity() : 1;
        return ResponseEntity.ok(cartService.addItem(customerId, req.getProductId(), qty));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartDto.CartResponse> updateItem(
            @AuthenticationPrincipal String customerId,
            @PathVariable String productId,
            @Valid @RequestBody CartDto.UpdateItemRequest req) {
        return ResponseEntity.ok(cartService.updateItem(customerId, productId, req.getQuantity()));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartDto.CartResponse> removeItem(
            @AuthenticationPrincipal String customerId,
            @PathVariable String productId) {
        return ResponseEntity.ok(cartService.removeItem(customerId, productId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal String customerId) {
        cartService.clearCart(customerId);
        return ResponseEntity.noContent().build();
    }
}
