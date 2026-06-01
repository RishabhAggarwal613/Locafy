package com.locafy.admin.service;

import com.locafy.admin.dto.AdminDto;
import com.locafy.admin.model.AuditLog;
import com.locafy.category.dto.CategoryDto;
import com.locafy.category.model.Category;
import com.locafy.category.repository.CategoryRepository;
import com.locafy.common.cache.DiscoveryCacheService;
import com.locafy.common.exception.ResourceNotFoundException;
import com.locafy.common.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCategoryService {

    private final CategoryRepository categoryRepository;
    private final DiscoveryCacheService cacheService;
    private final AuditLogService auditLogService;

    public AdminDto.CategoryListResponse listCategories() {
        List<CategoryDto> categories = categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(CategoryDto::from)
                .toList();
        return AdminDto.CategoryListResponse.builder().categories(categories).build();
    }

    @Transactional
    public CategoryDto createCategory(String adminId, AdminDto.CreateCategoryRequest req, String ip) {
        String slug = SlugUtil.uniqueSlug(req.getName(), categoryRepository::existsBySlug);
        Category category = categoryRepository.save(Category.builder()
                .name(req.getName())
                .slug(slug)
                .icon(req.getIcon())
                .parentCategory(req.getParentCategory())
                .type(req.getType() != null ? req.getType() : "SHOP")
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .isActive(true)
                .build());
        evictCategoryCache();
        auditLogService.record(adminId, AuditLog.Action.CATEGORY_CREATED, category.getId(),
                AuditLog.TargetType.CATEGORY, "Created category: " + category.getName(), ip);
        return CategoryDto.from(category);
    }

    @Transactional
    public CategoryDto updateCategory(String adminId, String categoryId,
                                      AdminDto.UpdateCategoryRequest req, String ip) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (req.getName() != null && !req.getName().equals(category.getName())) {
            String currentSlug = category.getSlug();
            String slug = SlugUtil.uniqueSlug(req.getName(),
                    s -> !s.equals(currentSlug) && categoryRepository.existsBySlug(s));
            category.setName(req.getName());
            category.setSlug(slug);
        }
        if (req.getIcon() != null) category.setIcon(req.getIcon());
        if (req.getParentCategory() != null) category.setParentCategory(req.getParentCategory());
        if (req.getType() != null) category.setType(req.getType());
        if (req.getDisplayOrder() != null) category.setDisplayOrder(req.getDisplayOrder());
        if (req.getIsActive() != null) category.setIsActive(req.getIsActive());
        category = categoryRepository.save(category);
        evictCategoryCache();
        auditLogService.record(adminId, AuditLog.Action.CATEGORY_UPDATED, categoryId,
                AuditLog.TargetType.CATEGORY, "Updated category: " + category.getName(), ip);
        return CategoryDto.from(category);
    }

    private void evictCategoryCache() {
        cacheService.invalidate("locafy:categories");
    }
}
