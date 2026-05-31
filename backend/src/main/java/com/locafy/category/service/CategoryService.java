package com.locafy.category.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.locafy.category.dto.CategoryDto;
import com.locafy.category.repository.CategoryRepository;
import com.locafy.common.cache.DiscoveryCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final DiscoveryCacheService cacheService;

    public List<CategoryDto> listAll() {
        return cacheService.getOrLoad("locafy:categories:all", 86400,
                new TypeReference<>() {},
                () -> categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                        .map(CategoryDto::from)
                        .toList());
    }
}
