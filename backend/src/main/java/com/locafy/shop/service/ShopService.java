package com.locafy.shop.service;

import com.locafy.common.exception.ConflictException;
import com.locafy.common.exception.ResourceNotFoundException;
import com.locafy.common.exception.UnauthorizedException;
import com.locafy.common.util.SlugUtil;
import com.locafy.media.CloudinaryService;
import com.locafy.shop.dto.ShopDto;
import com.locafy.shop.model.Shop;
import com.locafy.shop.repository.ShopRepository;
import com.locafy.user.model.User;
import com.locafy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public ShopDto.ShopResponse createShop(String vendorId, ShopDto.CreateShopRequest req) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (vendor.getRole() != User.Role.VENDOR) {
            throw new UnauthorizedException("Only vendors can create shops");
        }
        if (shopRepository.existsByOwnerId(vendorId)) {
            throw new ConflictException("You already have a shop. Update your existing shop instead.");
        }

        String slug = SlugUtil.uniqueSlug(req.getName(), shopRepository::existsBySlug);

        Shop shop = Shop.builder()
                .ownerId(vendorId)
                .name(req.getName().trim())
                .slug(slug)
                .description(req.getDescription())
                .phone(req.getPhone())
                .email(req.getEmail() != null ? req.getEmail().toLowerCase().strip() : vendor.getEmail())
                .categories(req.getCategories())
                .address(mapAddress(req.getAddress()))
                .location(new GeoJsonPoint(req.getLongitude(), req.getLatitude()))
                .deliveryAvailable(req.getDeliveryAvailable() != null ? req.getDeliveryAvailable() : true)
                .pickupAvailable(req.getPickupAvailable() != null ? req.getPickupAvailable() : true)
                .minOrderAmount(req.getMinOrderAmount())
                .deliveryRadius(req.getDeliveryRadius() != null ? req.getDeliveryRadius() : 3.0)
                .isActive(true)
                .isVerified(false)
                .isOpen(true)
                .build();

        return ShopDto.ShopResponse.from(shopRepository.save(shop));
    }

    public ShopDto.ShopResponse updateShop(String vendorId, String shopId, ShopDto.UpdateShopRequest req) {
        Shop shop = getOwnedShop(vendorId, shopId);

        if (req.getName() != null && !req.getName().isBlank()) {
            shop.setName(req.getName().trim());
            if (!shop.getSlug().startsWith(SlugUtil.toSlug(req.getName()))) {
                shop.setSlug(SlugUtil.uniqueSlug(req.getName(), s -> shopRepository.existsBySlug(s) && !s.equals(shop.getSlug())));
            }
        }
        if (req.getDescription() != null) shop.setDescription(req.getDescription());
        if (req.getPhone() != null) shop.setPhone(req.getPhone());
        if (req.getEmail() != null) shop.setEmail(req.getEmail().toLowerCase().strip());
        if (req.getCategories() != null) shop.setCategories(req.getCategories());
        if (req.getAddress() != null) shop.setAddress(mapAddress(req.getAddress()));
        if (req.getLatitude() != null && req.getLongitude() != null) {
            shop.setLocation(new GeoJsonPoint(req.getLongitude(), req.getLatitude()));
        }
        if (req.getDeliveryAvailable() != null) shop.setDeliveryAvailable(req.getDeliveryAvailable());
        if (req.getPickupAvailable() != null) shop.setPickupAvailable(req.getPickupAvailable());
        if (req.getMinOrderAmount() != null) shop.setMinOrderAmount(req.getMinOrderAmount());
        if (req.getDeliveryRadius() != null) shop.setDeliveryRadius(req.getDeliveryRadius());
        if (req.getIsActive() != null) shop.setIsActive(req.getIsActive());

        return ShopDto.ShopResponse.from(shopRepository.save(shop));
    }

    public ShopDto.ShopResponse getShopById(String shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found"));
        return ShopDto.ShopResponse.from(shop);
    }

    public ShopDto.ShopResponse getShopByOwner(String vendorId) {
        Shop shop = shopRepository.findByOwnerId(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found. Create your shop first."));
        return ShopDto.ShopResponse.from(shop);
    }

    public ShopDto.ShopResponse uploadCover(String vendorId, String shopId, MultipartFile file) throws IOException {
        Shop shop = getOwnedShop(vendorId, shopId);
        String url = cloudinaryService.uploadImage(file, "shops/" + shopId + "/cover");
        if (shop.getCoverImageUrl() != null) {
            cloudinaryService.deleteImage(shop.getCoverImageUrl());
        }
        shop.setCoverImageUrl(url);
        return ShopDto.ShopResponse.from(shopRepository.save(shop));
    }

    public ShopDto.ShopResponse uploadLogo(String vendorId, String shopId, MultipartFile file) throws IOException {
        Shop shop = getOwnedShop(vendorId, shopId);
        String url = cloudinaryService.uploadImage(file, "shops/" + shopId + "/logo");
        if (shop.getLogoUrl() != null) {
            cloudinaryService.deleteImage(shop.getLogoUrl());
        }
        shop.setLogoUrl(url);
        return ShopDto.ShopResponse.from(shopRepository.save(shop));
    }

    public Shop getOwnedShopEntity(String vendorId, String shopId) {
        return getOwnedShop(vendorId, shopId);
    }

    private Shop getOwnedShop(String vendorId, String shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found"));
        if (!shop.getOwnerId().equals(vendorId)) {
            throw new UnauthorizedException("You do not own this shop");
        }
        return shop;
    }

    private Shop.Address mapAddress(ShopDto.AddressRequest req) {
        return Shop.Address.builder()
                .line1(req.getLine1())
                .line2(req.getLine2())
                .city(req.getCity())
                .state(req.getState())
                .pincode(req.getPincode())
                .build();
    }
}
