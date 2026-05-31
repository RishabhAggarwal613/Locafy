package com.locafy.search.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.locafy.common.cache.DiscoveryCacheService;
import com.locafy.product.model.Product;
import com.locafy.search.dto.SearchDto;
import com.locafy.shop.dto.ShopDiscoveryDto;
import com.locafy.shop.model.Shop;
import com.locafy.shop.repository.ShopRepository;
import com.locafy.shop.service.ShopDiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ShopDiscoveryService shopDiscoveryService;
    private final ShopRepository shopRepository;
    private final MongoTemplate mongoTemplate;
    private final DiscoveryCacheService cacheService;

    public SearchDto.SearchResponse search(
            String q,
            SearchDto.SearchType type,
            double lat, double lng, double radiusKm,
            String category,
            Double minPrice, Double maxPrice,
            Double minRating,
            Boolean openNow, Boolean delivery,
            int page, int size) {

        String cacheKey = String.format("locafy:search:%s:%.3f:%.3f:%.1f:%s:%s:%s:%s:%s:%s:%d:%d",
                nullSafe(q), lat, lng, radiusKm, type, nullSafe(category),
                minPrice, maxPrice, minRating, openNow, delivery, page, size);

        return cacheService.getOrLoad(cacheKey, 300, new TypeReference<>() {},
                () -> doSearch(q, type, lat, lng, radiusKm, category, minPrice, maxPrice,
                        minRating, openNow, delivery, page, size));
    }

    public List<SearchDto.AutocompleteItem> autocomplete(String q, double lat, double lng, double radiusKm) {
        if (!StringUtils.hasText(q) || q.length() < 2) {
            return List.of();
        }
        String cacheKey = String.format("locafy:autocomplete:%s:%.3f:%.3f:%.1f",
                q.toLowerCase(Locale.ROOT), lat, lng, radiusKm);

        return cacheService.getOrLoad(cacheKey, 60, new TypeReference<>() {},
                () -> doAutocomplete(q, lat, lng, radiusKm));
    }

    public List<SearchDto.ProductSearchItem> recentProducts(double lat, double lng, double radiusKm, int limit) {
        String cacheKey = String.format("locafy:products:recent:%.3f:%.3f:%.1f:%d", lat, lng, radiusKm, limit);
        return cacheService.getOrLoad(cacheKey, 300, new TypeReference<>() {},
                () -> doRecentProducts(lat, lng, radiusKm, limit));
    }

    private SearchDto.SearchResponse doSearch(
            String q, SearchDto.SearchType type,
            double lat, double lng, double radiusKm,
            String category, Double minPrice, Double maxPrice,
            Double minRating, Boolean openNow, Boolean delivery,
            int page, int size) {

        List<ShopDiscoveryDto.ShopListItem> shops = List.of();
        List<SearchDto.ProductSearchItem> products = List.of();

        if (type == SearchDto.SearchType.ALL || type == SearchDto.SearchType.SHOP) {
            ShopDiscoveryDto.ShopPageResponse shopPage = shopDiscoveryService.findNearby(
                    lat, lng, radiusKm, category, q, openNow, delivery, page, size);
            shops = shopPage.getContent();
            if (minRating != null) {
                shops = shops.stream()
                        .filter(s -> s.getRating() != null && s.getRating() >= minRating)
                        .toList();
            }
        }

        if (type == SearchDto.SearchType.ALL || type == SearchDto.SearchType.PRODUCT) {
            products = searchProducts(q, lat, lng, radiusKm, category, minPrice, maxPrice, page, size);
        }

        return SearchDto.SearchResponse.builder()
                .shops(shops)
                .products(products)
                .totalShops(shops.size())
                .totalProducts(products.size())
                .build();
    }

    private List<SearchDto.ProductSearchItem> searchProducts(
            String q, double lat, double lng, double radiusKm,
            String category, Double minPrice, Double maxPrice,
            int page, int size) {

        Map<String, ShopDiscoveryDto.ShopListItem> shopMap = shopDiscoveryService
                .findNearby(lat, lng, radiusKm, category, null, null, null, 0, 500)
                .getContent().stream()
                .collect(Collectors.toMap(ShopDiscoveryDto.ShopListItem::getId, s -> s));

        if (shopMap.isEmpty()) return List.of();

        Query query = new Query();
        query.addCriteria(Criteria.where("shopId").in(shopMap.keySet()));
        query.addCriteria(Criteria.where("isAvailable").is(true));

        if (StringUtils.hasText(category)) {
            query.addCriteria(Criteria.where("category").is(category));
        }
        if (StringUtils.hasText(q)) {
            String pattern = ".*" + Pattern.quote(q.trim()) + ".*";
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("name").regex(pattern, "i"),
                    Criteria.where("description").regex(pattern, "i"),
                    Criteria.where("category").regex(pattern, "i")
            ));
        }
        if (minPrice != null) {
            query.addCriteria(Criteria.where("price").gte(minPrice));
        }
        if (maxPrice != null) {
            query.addCriteria(Criteria.where("price").lte(maxPrice));
        }

        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        query.skip((long) page * size);
        query.limit(size);

        List<Product> found = mongoTemplate.find(query, Product.class);
        return found.stream()
                .map(p -> toProductItem(p, shopMap.get(p.getShopId())))
                .filter(Objects::nonNull)
                .toList();
    }

    private List<SearchDto.ProductSearchItem> doRecentProducts(double lat, double lng, double radiusKm, int limit) {
        List<String> shopIds = shopDiscoveryService.findNearbyShopIds(lat, lng, radiusKm);
        if (shopIds.isEmpty()) return List.of();

        Map<String, Shop> shopMap = shopRepository.findAllById(shopIds).stream()
                .collect(Collectors.toMap(Shop::getId, s -> s));

        Query query = new Query();
        query.addCriteria(Criteria.where("shopId").in(shopIds));
        query.addCriteria(Criteria.where("isAvailable").is(true));
        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        query.limit(limit);

        return mongoTemplate.find(query, Product.class).stream()
                .map(p -> {
                    Shop shop = shopMap.get(p.getShopId());
                    ShopDiscoveryDto.ShopListItem item = shop != null
                            ? ShopDiscoveryDto.ShopListItem.from(shop, 0)
                            : null;
                    return toProductItem(p, item);
                })
                .filter(Objects::nonNull)
                .toList();
    }

    private List<SearchDto.AutocompleteItem> doAutocomplete(String q, double lat, double lng, double radiusKm) {
        List<SearchDto.AutocompleteItem> items = new ArrayList<>();

        ShopDiscoveryDto.ShopPageResponse shops = shopDiscoveryService.findNearby(
                lat, lng, radiusKm, null, q, null, null, 0, 5);
        for (ShopDiscoveryDto.ShopListItem shop : shops.getContent()) {
            items.add(SearchDto.AutocompleteItem.builder()
                    .type("SHOP")
                    .id(shop.getId())
                    .label(shop.getName())
                    .subtitle(shop.getDistanceKm() + " km away")
                    .build());
        }

        List<SearchDto.ProductSearchItem> products = searchProducts(q, lat, lng, radiusKm, null, null, null, 0, 5);
        for (SearchDto.ProductSearchItem product : products) {
            items.add(SearchDto.AutocompleteItem.builder()
                    .type("PRODUCT")
                    .id(product.getId())
                    .label(product.getName())
                    .subtitle(product.getShopName())
                    .build());
        }

        return items.stream().limit(8).toList();
    }

    private SearchDto.ProductSearchItem toProductItem(Product p, ShopDiscoveryDto.ShopListItem shop) {
        if (shop == null && p.getShopId() != null) {
            shop = shopRepository.findById(p.getShopId())
                    .map(s -> ShopDiscoveryDto.ShopListItem.from(s, 0))
                    .orElse(null);
        }
        return SearchDto.ProductSearchItem.builder()
                .id(p.getId())
                .shopId(p.getShopId())
                .shopName(shop != null ? shop.getName() : "Shop")
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .discountedPrice(p.getDiscountedPrice())
                .images(p.getImages())
                .category(p.getCategory())
                .stock(p.getStock())
                .isAvailable(p.getIsAvailable())
                .unit(p.getUnit())
                .rating(p.getRating())
                .distanceKm(shop != null ? shop.getDistanceKm() : null)
                .build();
    }

    private String nullSafe(String s) {
        return s == null ? "" : s.toLowerCase(Locale.ROOT);
    }
}
