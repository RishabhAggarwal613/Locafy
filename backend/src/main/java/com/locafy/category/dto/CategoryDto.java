package com.locafy.category.dto;

import com.locafy.category.model.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private String id;
    private String name;
    private String slug;
    private String icon;
    private String parentCategory;
    private String type;
    private Integer displayOrder;

    public static CategoryDto from(Category c) {
        return CategoryDto.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .icon(c.getIcon())
                .parentCategory(c.getParentCategory())
                .type(c.getType())
                .displayOrder(c.getDisplayOrder())
                .build();
    }
}
