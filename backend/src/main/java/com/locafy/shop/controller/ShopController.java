package com.locafy.shop.controller;

import com.locafy.shop.dto.ShopDiscoveryDto;
import com.locafy.shop.dto.ShopDto;
import com.locafy.shop.service.ShopDiscoveryService;
import com.locafy.shop.service.ShopService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;
    private final ShopDiscoveryService shopDiscoveryService;

    @GetMapping
    public ResponseEntity<ShopDiscoveryDto.ShopPageResponse> listShops(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5") double radius,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean open,
            @RequestParam(required = false) Boolean delivery,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(shopDiscoveryService.findNearby(
                lat, lng, radius, category, q, open, delivery, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShopDto.ShopResponse> getShop(@PathVariable String id) {
        return ResponseEntity.ok(shopService.getShopById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ShopDto.ShopResponse> createShop(
            @AuthenticationPrincipal String vendorId,
            @Valid @RequestBody ShopDto.CreateShopRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shopService.createShop(vendorId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ShopDto.ShopResponse> updateShop(
            @AuthenticationPrincipal String vendorId,
            @PathVariable String id,
            @Valid @RequestBody ShopDto.UpdateShopRequest request) {
        return ResponseEntity.ok(shopService.updateShop(vendorId, id, request));
    }

    @PostMapping(value = "/{id}/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ShopDto.ShopResponse> uploadCover(
            @AuthenticationPrincipal String vendorId,
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(shopService.uploadCover(vendorId, id, file));
    }

    @PostMapping(value = "/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ShopDto.ShopResponse> uploadLogo(
            @AuthenticationPrincipal String vendorId,
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(shopService.uploadLogo(vendorId, id, file));
    }
}
