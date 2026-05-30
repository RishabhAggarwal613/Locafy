package com.locafy.product.controller;

import com.locafy.product.dto.ProductDto;
import com.locafy.product.service.ProductService;
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
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/api/products/{id}")
    public ResponseEntity<ProductDto.ProductResponse> getProduct(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/api/shops/{shopId}/products")
    public ResponseEntity<ProductDto.PageResponse<ProductDto.ProductResponse>> listByShop(
            @PathVariable String shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.listByShop(shopId, page, size));
    }

    @PostMapping("/api/products")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ProductDto.ProductResponse> createProduct(
            @AuthenticationPrincipal String vendorId,
            @Valid @RequestBody ProductDto.CreateProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(vendorId, request));
    }

    @PutMapping("/api/products/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ProductDto.ProductResponse> updateProduct(
            @AuthenticationPrincipal String vendorId,
            @PathVariable String id,
            @Valid @RequestBody ProductDto.UpdateProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(vendorId, id, request));
    }

    @DeleteMapping("/api/products/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, String>> deleteProduct(
            @AuthenticationPrincipal String vendorId,
            @PathVariable String id) {
        productService.deleteProduct(vendorId, id);
        return ResponseEntity.ok(Map.of("message", "Product deleted"));
    }

    @PatchMapping("/api/products/{id}/stock")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ProductDto.ProductResponse> updateStock(
            @AuthenticationPrincipal String vendorId,
            @PathVariable String id,
            @Valid @RequestBody ProductDto.StockUpdateRequest request) {
        return ResponseEntity.ok(productService.updateStock(vendorId, id, request));
    }

    @PostMapping(value = "/api/products/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ProductDto.ProductResponse> uploadImage(
            @AuthenticationPrincipal String vendorId,
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(productService.uploadImage(vendorId, id, file));
    }

    @DeleteMapping("/api/products/{id}/images/{index}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ProductDto.ProductResponse> removeImage(
            @AuthenticationPrincipal String vendorId,
            @PathVariable String id,
            @PathVariable int index) {
        return ResponseEntity.ok(productService.removeImage(vendorId, id, index));
    }

    @PostMapping(value = "/api/products/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<ProductDto.ProductResponse>> bulkImport(
            @AuthenticationPrincipal String vendorId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.bulkImport(vendorId, file));
    }
}
