package com.locafy.shop.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.locafy.common.cache.DiscoveryCacheService;
import com.locafy.shop.dto.ShopDiscoveryDto;
import com.locafy.shop.model.Shop;
import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.NearQuery;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShopDiscoveryService {

    private final MongoTemplate mongoTemplate;
    private final DiscoveryCacheService cacheService;

    public ShopDiscoveryDto.ShopPageResponse findNearby(
            double lat, double lng, double radiusKm,
            String category, String q, Boolean openNow, Boolean delivery,
            int page, int size) {

        String cacheKey = String.format("locafy:shops:near:%.3f:%.3f:%.1f:%s:%s:%s:%s:%d:%d",
                lat, lng, radiusKm,
                nullSafe(category), nullSafe(q), openNow, delivery, page, size);

        return cacheService.getOrLoad(cacheKey, 300, new TypeReference<>() {},
                () -> doFindNearby(lat, lng, radiusKm, category, q, openNow, delivery, page, size));
    }

    public List<String> findNearbyShopIds(double lat, double lng, double radiusKm) {
        List<ShopDiscoveryDto.ShopListItem> items = doFindNearby(lat, lng, radiusKm, null, null, null, null, 0, 500)
                .getContent();
        return items.stream().map(ShopDiscoveryDto.ShopListItem::getId).collect(Collectors.toList());
    }

    private ShopDiscoveryDto.ShopPageResponse doFindNearby(
            double lat, double lng, double radiusKm,
            String category, String q, Boolean openNow, Boolean delivery,
            int page, int size) {

        Query query = new Query();
        query.addCriteria(Criteria.where("isActive").ne(false));

        if (StringUtils.hasText(category)) {
            query.addCriteria(Criteria.where("categories").is(category));
        }
        if (Boolean.TRUE.equals(openNow)) {
            query.addCriteria(Criteria.where("isOpen").is(true));
        }
        if (Boolean.TRUE.equals(delivery)) {
            query.addCriteria(Criteria.where("deliveryAvailable").is(true));
        }
        if (StringUtils.hasText(q)) {
            String pattern = ".*" + Pattern.quote(q.trim()) + ".*";
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("name").regex(pattern, "i"),
                    Criteria.where("description").regex(pattern, "i"),
                    Criteria.where("categories").regex(pattern, "i")
            ));
        }

        NearQuery nearQuery = NearQuery.near(new Point(lng, lat))
                .maxDistance(new Distance(radiusKm, Metrics.KILOMETERS))
                .spherical(true)
                .query(query);

        GeoResults<Shop> geoResults = mongoTemplate.geoNear(nearQuery, Shop.class);

        List<ShopDiscoveryDto.ShopListItem> all = new ArrayList<>();
        for (GeoResult<Shop> result : geoResults.getContent()) {
            double distanceKm = result.getDistance().getValue();
            all.add(ShopDiscoveryDto.ShopListItem.from(result.getContent(), distanceKm));
        }

        all.sort(Comparator.comparing(ShopDiscoveryDto.ShopListItem::getDistanceKm));

        int from = page * size;
        int to = Math.min(from + size, all.size());
        List<ShopDiscoveryDto.ShopListItem> pageContent = from >= all.size()
                ? List.of()
                : new ArrayList<>(all.subList(from, to));

        return ShopDiscoveryDto.ShopPageResponse.builder()
                .content(pageContent)
                .totalElements(all.size())
                .page(page)
                .size(size)
                .hasMore(to < all.size())
                .build();
    }

    private String nullSafe(String s) {
        return s == null ? "" : s.toLowerCase(Locale.ROOT);
    }
}
