package com.locafy.admin.service;

import com.locafy.admin.dto.AdminDto;
import com.locafy.admin.model.AuditLog;
import com.locafy.common.exception.ResourceNotFoundException;
import com.locafy.product.repository.ProductRepository;
import com.locafy.shop.model.Shop;
import com.locafy.shop.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminShopService {

    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final AuditLogService auditLogService;
    private final MongoTemplate mongoTemplate;

    public AdminDto.ShopPageResponse listShops(Boolean pendingOnly, int page, int size) {
        Query query = new Query();
        if (Boolean.TRUE.equals(pendingOnly)) {
            query.addCriteria(Criteria.where("isVerified").ne(true));
        }
        long total = mongoTemplate.count(query, "shops");
        query.with(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<Document> docs = mongoTemplate.find(query, Document.class, "shops");

        return AdminDto.ShopPageResponse.builder()
                .content(docs.stream().map(this::toSummary).toList())
                .totalElements(total)
                .page(page)
                .size(size)
                .hasMore((long) (page + 1) * size < total)
                .build();
    }

    private AdminDto.ShopSummary toSummary(Document doc) {
        String id = doc.getObjectId("_id").toHexString();
        Object address = doc.get("address");
        String city = null;
        if (address instanceof Document addrDoc) {
            city = addrDoc.getString("city");
        } else if (address instanceof String s) {
            city = s;
        }
        @SuppressWarnings("unchecked")
        List<String> categories = doc.getList("categories", String.class);
        return AdminDto.ShopSummary.builder()
                .id(id)
                .name(doc.getString("name"))
                .ownerId(doc.getString("ownerId"))
                .city(city)
                .categories(categories != null ? categories : List.of())
                .verified(Boolean.TRUE.equals(doc.get("isVerified")))
                .active(doc.get("isActive") == null || Boolean.TRUE.equals(doc.get("isActive")))
                .productCount(productRepository.countByShopId(id))
                .createdAt(doc.get("createdAt") != null ? doc.get("createdAt").toString() : null)
                .build();
    }

    @Transactional
    public AdminDto.ShopSummary verifyShop(String adminId, String shopId,
                                           AdminDto.ShopVerifyRequest req, String ip) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found"));
        shop.setIsVerified(req.getVerified());
        shop = shopRepository.save(shop);

        AuditLog.Action action = Boolean.TRUE.equals(req.getVerified())
                ? AuditLog.Action.SHOP_VERIFIED
                : AuditLog.Action.SHOP_UNVERIFIED;
        auditLogService.record(adminId, action, shopId, AuditLog.TargetType.SHOP,
                (Boolean.TRUE.equals(req.getVerified()) ? "Shop verified" : "Shop unverified")
                        + (req.getReason() != null ? ": " + req.getReason() : ""), ip);
        return AdminDto.ShopSummary.from(shop, productRepository.countByShopId(shop.getId()));
    }

    @Transactional
    public AdminDto.ShopSummary updateShopStatus(String adminId, String shopId,
                                                 AdminDto.ShopStatusRequest req, String ip) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found"));
        shop.setIsActive(req.getActive());
        shop = shopRepository.save(shop);

        AuditLog.Action action = Boolean.TRUE.equals(req.getActive())
                ? AuditLog.Action.SHOP_ACTIVATED
                : AuditLog.Action.SHOP_SUSPENDED;
        auditLogService.record(adminId, action, shopId, AuditLog.TargetType.SHOP,
                (Boolean.TRUE.equals(req.getActive()) ? "Shop activated" : "Shop suspended")
                        + (req.getReason() != null ? ": " + req.getReason() : ""), ip);
        return AdminDto.ShopSummary.from(shop, productRepository.countByShopId(shop.getId()));
    }
}
