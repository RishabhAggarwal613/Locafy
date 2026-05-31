package com.locafy.category.repository;

import com.locafy.category.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CategoryRepository extends MongoRepository<Category, String> {
    List<Category> findAllByOrderByDisplayOrderAsc();
    boolean existsBySlug(String slug);
}
