package com.locafy.category.service;

import com.locafy.category.model.Category;
import com.locafy.category.repository.CategoryRepository;
import com.locafy.common.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CategorySeeder implements ApplicationRunner {

    private final CategoryRepository categoryRepository;

    private static final List<String[]> SEED = List.of(
            new String[]{"🍔", "Food"},
            new String[]{"🛒", "Grocery"},
            new String[]{"📱", "Electronics"},
            new String[]{"👗", "Fashion"},
            new String[]{"🏠", "Home"},
            new String[]{"💄", "Beauty"},
            new String[]{"💊", "Health"},
            new String[]{"📦", "Other"}
    );

    @Override
    public void run(ApplicationArguments args) {
        if (categoryRepository.count() > 0) {
            return;
        }
        log.info("Seeding default categories...");
        for (int i = 0; i < SEED.size(); i++) {
            String[] row = SEED.get(i);
            categoryRepository.save(Category.builder()
                    .name(row[1])
                    .slug(SlugUtil.toSlug(row[1]))
                    .icon(row[0])
                    .type("SHOP")
                    .displayOrder(i)
                    .build());
        }
    }
}
