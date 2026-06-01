package com.locafy.config;

import com.locafy.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CacheWarmupRunner implements ApplicationRunner {

    private final CategoryService categoryService;

    @Override
    public void run(ApplicationArguments args) {
        try {
            categoryService.listAll();
            log.info("Discovery cache warmed (categories)");
        } catch (Exception e) {
            log.warn("Cache warmup skipped: {}", e.getMessage());
        }
    }
}
