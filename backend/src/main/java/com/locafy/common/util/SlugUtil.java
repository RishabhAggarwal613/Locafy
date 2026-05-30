package com.locafy.common.util;

import java.util.Locale;
import java.util.UUID;

public final class SlugUtil {

    private SlugUtil() {}

    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return UUID.randomUUID().toString().substring(0, 8);
        }
        String slug = input.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        if (slug.isBlank()) {
            slug = UUID.randomUUID().toString().substring(0, 8);
        }
        return slug;
    }

    public static String uniqueSlug(String base, java.util.function.Predicate<String> exists) {
        String slug = toSlug(base);
        if (!exists.test(slug)) {
            return slug;
        }
        for (int i = 2; i < 100; i++) {
            String candidate = slug + "-" + i;
            if (!exists.test(candidate)) {
                return candidate;
            }
        }
        return slug + "-" + UUID.randomUUID().toString().substring(0, 6);
    }
}
