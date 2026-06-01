package com.locafy.admin.service;

import com.locafy.admin.dto.AdminDto;
import com.locafy.admin.model.AuditLog;
import com.locafy.common.exception.ResourceNotFoundException;
import com.locafy.product.model.Product;
import com.locafy.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;
    private final AuditLogService auditLogService;

    public AdminDto.ProductPageResponse listFlagged(int page, int size) {
        Page<Product> result = productRepository.findByIsFlaggedTrueOrderByUpdatedAtDesc(PageRequest.of(page, size));
        return AdminDto.ProductPageResponse.builder()
                .content(result.getContent().stream().map(AdminDto.ProductSummary::from).toList())
                .totalElements(result.getTotalElements())
                .page(page)
                .size(size)
                .hasMore(result.hasNext())
                .build();
    }

    @Transactional
    public AdminDto.ProductSummary hideProduct(String adminId, String productId, String ip) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setIsAvailable(false);
        product = productRepository.save(product);
        auditLogService.record(adminId, AuditLog.Action.PRODUCT_HIDDEN, productId,
                AuditLog.TargetType.PRODUCT, "Product hidden from catalog: " + product.getName(), ip);
        return AdminDto.ProductSummary.from(product);
    }

    @Transactional
    public AdminDto.ProductSummary dismissFlag(String adminId, String productId, String ip) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setIsFlagged(false);
        product.setFlagReason(null);
        product.setFlagCount(0);
        product = productRepository.save(product);
        auditLogService.record(adminId, AuditLog.Action.PRODUCT_FLAG_DISMISSED, productId,
                AuditLog.TargetType.PRODUCT, "Flag dismissed: " + product.getName(), ip);
        return AdminDto.ProductSummary.from(product);
    }
}
