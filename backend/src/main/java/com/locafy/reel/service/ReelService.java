package com.locafy.reel.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.locafy.common.cache.DiscoveryCacheService;
import com.locafy.common.exception.BusinessException;
import com.locafy.common.exception.ResourceNotFoundException;
import com.locafy.common.exception.UnauthorizedException;
import com.locafy.media.CloudinaryService;
import com.locafy.product.model.Product;
import com.locafy.product.repository.ProductRepository;
import com.locafy.reel.dto.ReelDto;
import com.locafy.reel.model.Reel;
import com.locafy.reel.repository.ReelRepository;
import com.locafy.shop.model.Shop;
import com.locafy.shop.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.geo.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.NearQuery;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReelService {

    private static final double DEFAULT_RADIUS_KM = 10.0;
    private static final int MAX_FEED_CANDIDATES = 200;

    private final ReelRepository reelRepository;
    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;
    private final MongoTemplate mongoTemplate;
    private final DiscoveryCacheService cacheService;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    public ReelDto.FeedResponse getFeed(double lat, double lng, String cursor, int size, String customerId) {
        int pageSize = Math.min(Math.max(size, 1), 20);
        String cacheKey = String.format("locafy:reels:feed:%.3f:%.3f:%s:%d", lat, lng, nullSafe(cursor), pageSize);

        ReelDto.FeedResponse cached = cacheService.getOrLoad(cacheKey, 600, new TypeReference<>() {},
                () -> buildFeed(lat, lng, cursor, pageSize, null));

        if (customerId == null) {
            return cached;
        }
        List<ReelDto.ReelResponse> enriched = cached.getContent().stream()
                .map(r -> enrichWithUserFlags(r, customerId))
                .collect(Collectors.toList());
        return ReelDto.FeedResponse.builder()
                .content(enriched)
                .nextCursor(cached.getNextCursor())
                .hasMore(cached.isHasMore())
                .build();
    }

    private ReelDto.FeedResponse buildFeed(double lat, double lng, String cursor, int size, String customerId) {
        Query query = new Query();
        query.addCriteria(Criteria.where("isPublished").is(true));
        query.addCriteria(Criteria.where("processingStatus").is(Reel.ProcessingStatus.READY));
        query.addCriteria(Criteria.where("videoUrl").ne(null));

        NearQuery nearQuery = NearQuery.near(new Point(lng, lat))
                .maxDistance(new Distance(DEFAULT_RADIUS_KM, Metrics.KILOMETERS))
                .spherical(true)
                .query(query);

        GeoResults<Reel> geoResults = mongoTemplate.geoNear(nearQuery, Reel.class);

        List<ScoredReel> scored = new ArrayList<>();
        for (GeoResult<Reel> result : geoResults.getContent()) {
            if (scored.size() >= MAX_FEED_CANDIDATES) break;
            Reel reel = result.getContent();
            double distanceKm = result.getDistance().getValue();
            scored.add(new ScoredReel(reel, distanceKm, computeScore(reel, distanceKm)));
        }

        scored.sort(Comparator.comparingDouble(ScoredReel::score).reversed());

        int startIdx = 0;
        if (StringUtils.hasText(cursor)) {
            for (int i = 0; i < scored.size(); i++) {
                if (cursorKey(scored.get(i).reel()).equals(cursor)) {
                    startIdx = i + 1;
                    break;
                }
            }
        }

        int endIdx = Math.min(startIdx + size, scored.size());
        List<Reel> page = scored.subList(startIdx, endIdx).stream()
                .map(ScoredReel::reel)
                .collect(Collectors.toList());

        Map<String, Shop> shopCache = loadShops(page);
        Map<String, Product> productCache = loadProducts(page);

        List<ReelDto.ReelResponse> content = page.stream()
                .map(r -> toResponse(r, shopCache, productCache, customerId, findDistance(scored, r)))
                .collect(Collectors.toList());

        String nextCursor = endIdx < scored.size() ? cursorKey(scored.get(endIdx - 1).reel()) : null;

        return ReelDto.FeedResponse.builder()
                .content(content)
                .nextCursor(nextCursor)
                .hasMore(endIdx < scored.size())
                .build();
    }

    public ReelDto.ReelResponse getReel(String id, String customerId) {
        Reel reel = reelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reel not found"));
        if (!Boolean.TRUE.equals(reel.getIsPublished()) || reel.getProcessingStatus() != Reel.ProcessingStatus.READY) {
            throw new ResourceNotFoundException("Reel not found");
        }
        reel.setViews(reel.getViews() + 1);
        reelRepository.save(reel);
        Shop shop = shopRepository.findById(reel.getShopId()).orElse(null);
        Product product = reel.getProductId() != null
                ? productRepository.findById(reel.getProductId()).orElse(null)
                : null;
        return toResponse(reel, shop, product, customerId, null);
    }

    public ReelDto.PageResponse listVendorReels(String vendorId, int page, int size) {
        Page<Reel> result = reelRepository.findByVendorIdOrderByCreatedAtDesc(
                vendorId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        Map<String, Shop> shopCache = loadShops(result.getContent());
        Map<String, Product> productCache = loadProducts(result.getContent());
        List<ReelDto.ReelResponse> content = result.getContent().stream()
                .map(r -> toResponse(r, shopCache, productCache, vendorId, null))
                .collect(Collectors.toList());
        return ReelDto.PageResponse.builder()
                .content(content)
                .totalElements(result.getTotalElements())
                .page(page)
                .size(size)
                .hasMore(result.hasNext())
                .build();
    }

    public ReelDto.PageResponse listSavedReels(String customerId, int page, int size) {
        Page<Reel> result = reelRepository.findBySavedByContainingOrderByCreatedAtDesc(
                customerId, PageRequest.of(page, size));
        Map<String, Shop> shopCache = loadShops(result.getContent());
        Map<String, Product> productCache = loadProducts(result.getContent());
        List<ReelDto.ReelResponse> content = result.getContent().stream()
                .map(r -> toResponse(r, shopCache, productCache, customerId, null))
                .collect(Collectors.toList());
        return ReelDto.PageResponse.builder()
                .content(content)
                .totalElements(result.getTotalElements())
                .page(page)
                .size(size)
                .hasMore(result.hasNext())
                .build();
    }

    public ReelDto.ReelResponse createReel(
            String vendorId,
            MultipartFile video,
            String title,
            String description,
            String productId,
            boolean publish) throws IOException {

        Shop shop = shopRepository.findByOwnerId(vendorId)
                .orElseThrow(() -> new BusinessException("Create your shop before uploading reels"));

        if (productId != null && !productId.isBlank()) {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            if (!shop.getId().equals(product.getShopId())) {
                throw new UnauthorizedException("Product does not belong to your shop");
            }
        }

        CloudinaryService.VideoUploadResult upload = cloudinaryService.uploadReelVideo(video, vendorId);

        Reel reel = Reel.builder()
                .vendorId(vendorId)
                .shopId(shop.getId())
                .productId(StringUtils.hasText(productId) ? productId : null)
                .title(title)
                .description(description)
                .videoUrl(upload.videoUrl())
                .thumbnailUrl(upload.thumbnailUrl())
                .cloudinaryPublicId(upload.publicId())
                .duration(upload.duration())
                .shopLocation(shop.getLocation())
                .processingStatus(upload.ready() ? Reel.ProcessingStatus.READY : Reel.ProcessingStatus.PROCESSING)
                .isPublished(publish && upload.ready())
                .publishedAt(publish && upload.ready() ? LocalDateTime.now() : null)
                .build();

        reel = reelRepository.save(reel);
        invalidateFeedCache();
        return toResponse(reel, shop, loadProduct(reel.getProductId()), vendorId, null);
    }

    public ReelDto.ReelResponse updateReel(String vendorId, String reelId, ReelDto.UpdateReelRequest req) {
        Reel reel = getOwnedReel(vendorId, reelId);

        if (req.getTitle() != null) reel.setTitle(req.getTitle());
        if (req.getDescription() != null) reel.setDescription(req.getDescription());
        if (req.getProductId() != null) {
            if (req.getProductId().isBlank()) {
                reel.setProductId(null);
            } else {
                Product product = productRepository.findById(req.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
                if (!reel.getShopId().equals(product.getShopId())) {
                    throw new UnauthorizedException("Product does not belong to your shop");
                }
                reel.setProductId(req.getProductId());
            }
        }
        if (req.getIsPublished() != null) {
            if (Boolean.TRUE.equals(req.getIsPublished()) && reel.getProcessingStatus() != Reel.ProcessingStatus.READY) {
                throw new BusinessException("Reel is still processing. Try again once transcoding completes.");
            }
            reel.setIsPublished(req.getIsPublished());
            reel.setPublishedAt(Boolean.TRUE.equals(req.getIsPublished()) ? LocalDateTime.now() : null);
        }

        reel = reelRepository.save(reel);
        invalidateFeedCache();
        Shop shop = shopRepository.findById(reel.getShopId()).orElse(null);
        return toResponse(reel, shop, loadProduct(reel.getProductId()), vendorId, null);
    }

    public void deleteReel(String vendorId, String reelId) {
        Reel reel = getOwnedReel(vendorId, reelId);
        if (StringUtils.hasText(reel.getCloudinaryPublicId())) {
            cloudinaryService.deleteVideo(reel.getCloudinaryPublicId());
        }
        reelRepository.delete(reel);
        invalidateFeedCache();
    }

    public ReelDto.ToggleResponse toggleLike(String customerId, String reelId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResourceNotFoundException("Reel not found"));
        boolean liked = reel.getLikedBy().contains(customerId);
        if (liked) {
            reel.getLikedBy().remove(customerId);
            reel.setLikes(Math.max(0, reel.getLikes() - 1));
        } else {
            reel.getLikedBy().add(customerId);
            reel.setLikes(reel.getLikes() + 1);
        }
        reelRepository.save(reel);
        return ReelDto.ToggleResponse.builder().active(!liked).count(reel.getLikes()).build();
    }

    public ReelDto.ToggleResponse toggleSave(String customerId, String reelId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResourceNotFoundException("Reel not found"));
        boolean saved = reel.getSavedBy().contains(customerId);
        if (saved) {
            reel.getSavedBy().remove(customerId);
            reel.setSaves(Math.max(0, reel.getSaves() - 1));
        } else {
            reel.getSavedBy().add(customerId);
            reel.setSaves(reel.getSaves() + 1);
        }
        reelRepository.save(reel);
        return ReelDto.ToggleResponse.builder().active(!saved).count(reel.getSaves()).build();
    }

    public void markReadyFromWebhook(String publicId, String hlsUrl, String thumbnailUrl) {
        reelRepository.findByCloudinaryPublicId(publicId).ifPresent(reel -> {
            reel.setVideoUrl(hlsUrl);
            if (StringUtils.hasText(thumbnailUrl)) {
                reel.setThumbnailUrl(thumbnailUrl);
            }
            reel.setProcessingStatus(Reel.ProcessingStatus.READY);
            if (Boolean.TRUE.equals(reel.getIsPublished()) && reel.getPublishedAt() == null) {
                reel.setPublishedAt(LocalDateTime.now());
            }
            reelRepository.save(reel);
            invalidateFeedCache();
        });
    }

    private Reel getOwnedReel(String vendorId, String reelId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResourceNotFoundException("Reel not found"));
        if (!vendorId.equals(reel.getVendorId())) {
            throw new UnauthorizedException("You do not own this reel");
        }
        return reel;
    }

    private double computeScore(Reel reel, double distanceKm) {
        double proximity = 1.0 / (1.0 + distanceKm);
        double engagement = Math.min(1.0,
                (reel.getLikes() + reel.getSaves() * 2 + reel.getViews() * 0.01) / 1000.0);
        double recency = recencyScore(reel.getPublishedAt());
        double quality = reel.getVideoUrl() != null && reel.getVideoUrl().contains(".m3u8") ? 1.0
                : reel.getVideoUrl() != null ? 0.8 : 0.0;
        return proximity * 0.4 + engagement * 0.3 + recency * 0.2 + quality * 0.1;
    }

    private double recencyScore(LocalDateTime publishedAt) {
        if (publishedAt == null) return 0.1;
        long hours = Duration.between(publishedAt, LocalDateTime.now()).toHours();
        if (hours < 24) return 1.0;
        if (hours < 24 * 7) return 0.7;
        if (hours < 24 * 30) return 0.3;
        return 0.1;
    }

    private String cursorKey(Reel reel) {
        return reel.getId();
    }

    private Double findDistance(List<ScoredReel> scored, Reel reel) {
        return scored.stream()
                .filter(s -> s.reel().getId().equals(reel.getId()))
                .map(ScoredReel::distanceKm)
                .findFirst()
                .orElse(null);
    }

    private ReelDto.ReelResponse enrichWithUserFlags(ReelDto.ReelResponse response, String customerId) {
        Reel reel = reelRepository.findById(response.getId()).orElse(null);
        if (reel == null) return response;
        response.setIsLiked(reel.getLikedBy().contains(customerId));
        response.setIsSaved(reel.getSavedBy().contains(customerId));
        return response;
    }

    private ReelDto.ReelResponse toResponse(
            Reel reel, Map<String, Shop> shopCache, Map<String, Product> productCache,
            String userId, Double distanceKm) {
        Shop shop = shopCache.get(reel.getShopId());
        Product product = reel.getProductId() != null ? productCache.get(reel.getProductId()) : null;
        return toResponse(reel, shop, product, userId, distanceKm);
    }

    private ReelDto.ReelResponse toResponse(Reel reel, Shop shop, Product product, String userId, Double distanceKm) {
        Double productPrice = product != null
                ? (product.getDiscountedPrice() != null ? product.getDiscountedPrice() : product.getPrice())
                : null;
        return ReelDto.ReelResponse.builder()
                .id(reel.getId())
                .vendorId(reel.getVendorId())
                .shopId(reel.getShopId())
                .shopName(shop != null ? shop.getName() : null)
                .shopLogoUrl(shop != null ? shop.getLogoUrl() : null)
                .productId(reel.getProductId())
                .productName(product != null ? product.getName() : null)
                .productPrice(productPrice)
                .title(reel.getTitle())
                .description(reel.getDescription())
                .videoUrl(reel.getVideoUrl())
                .thumbnailUrl(reel.getThumbnailUrl())
                .duration(reel.getDuration())
                .likes(reel.getLikes())
                .saves(reel.getSaves())
                .views(reel.getViews())
                .isLiked(userId != null && reel.getLikedBy().contains(userId))
                .isSaved(userId != null && reel.getSavedBy().contains(userId))
                .distanceKm(distanceKm)
                .isPublished(reel.getIsPublished())
                .processingStatus(reel.getProcessingStatus() != null ? reel.getProcessingStatus().name() : null)
                .publishedAt(reel.getPublishedAt())
                .createdAt(reel.getCreatedAt())
                .build();
    }

    private Map<String, Shop> loadShops(List<Reel> reels) {
        Set<String> ids = reels.stream().map(Reel::getShopId).collect(Collectors.toSet());
        return shopRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Shop::getId, s -> s));
    }

    private Map<String, Product> loadProducts(List<Reel> reels) {
        Set<String> ids = reels.stream()
                .map(Reel::getProductId)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());
        if (ids.isEmpty()) return Map.of();
        return productRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
    }

    private Product loadProduct(String productId) {
        if (!StringUtils.hasText(productId)) return null;
        return productRepository.findById(productId).orElse(null);
    }

    private void invalidateFeedCache() {
        cacheService.invalidate("locafy:reels:feed");
    }

    private String nullSafe(String s) {
        return s == null ? "" : s;
    }

    private record ScoredReel(Reel reel, double distanceKm, double score) {}
}
