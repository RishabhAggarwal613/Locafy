package com.locafy.product.service;

import com.locafy.common.exception.BusinessException;
import com.locafy.common.exception.ResourceNotFoundException;
import com.locafy.common.exception.UnauthorizedException;
import com.locafy.media.CloudinaryService;
import com.locafy.product.dto.ProductDto;
import com.locafy.product.model.Product;
import com.locafy.product.repository.ProductRepository;
import com.locafy.shop.model.Shop;
import com.locafy.shop.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final int MAX_IMAGES = 8;

    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final CloudinaryService cloudinaryService;

    public ProductDto.ProductResponse createProduct(String vendorId, ProductDto.CreateProductRequest req) {
        Shop shop = shopRepository.findByOwnerId(vendorId)
                .orElseThrow(() -> new BusinessException("Create your shop before adding products"));

        Product product = Product.builder()
                .shopId(shop.getId())
                .vendorId(vendorId)
                .name(req.getName().trim())
                .description(req.getDescription())
                .price(req.getPrice())
                .discountedPrice(req.getDiscountedPrice())
                .category(req.getCategory())
                .subCategory(req.getSubCategory())
                .tags(req.getTags() != null ? req.getTags() : List.of())
                .stock(req.getStock())
                .isAvailable(req.getIsAvailable() != null ? req.getIsAvailable() : req.getStock() > 0)
                .unit(req.getUnit() != null ? req.getUnit() : "piece")
                .weight(req.getWeight())
                .sku(req.getSku())
                .images(new ArrayList<>())
                .build();

        return ProductDto.ProductResponse.from(productRepository.save(product));
    }

    public ProductDto.ProductResponse updateProduct(String vendorId, String productId, ProductDto.UpdateProductRequest req) {
        Product product = getOwnedProduct(vendorId, productId);

        if (req.getName() != null) product.setName(req.getName().trim());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getPrice() != null) product.setPrice(req.getPrice());
        if (req.getDiscountedPrice() != null) product.setDiscountedPrice(req.getDiscountedPrice());
        if (req.getCategory() != null) product.setCategory(req.getCategory());
        if (req.getSubCategory() != null) product.setSubCategory(req.getSubCategory());
        if (req.getTags() != null) product.setTags(req.getTags());
        if (req.getStock() != null) product.setStock(req.getStock());
        if (req.getUnit() != null) product.setUnit(req.getUnit());
        if (req.getWeight() != null) product.setWeight(req.getWeight());
        if (req.getSku() != null) product.setSku(req.getSku());
        if (req.getIsAvailable() != null) product.setIsAvailable(req.getIsAvailable());

        return ProductDto.ProductResponse.from(productRepository.save(product));
    }

    public void deleteProduct(String vendorId, String productId) {
        Product product = getOwnedProduct(vendorId, productId);
        product.getImages().forEach(cloudinaryService::deleteImage);
        productRepository.delete(product);
    }

    public ProductDto.ProductResponse getProductById(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return ProductDto.ProductResponse.from(product);
    }

    public ProductDto.PageResponse<ProductDto.ProductResponse> listByShop(String shopId, int page, int size) {
        Page<Product> result = productRepository.findByShopId(
                shopId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return mapPage(result);
    }

    public ProductDto.PageResponse<ProductDto.ProductResponse> listByVendor(String vendorId, int page, int size) {
        Page<Product> result = productRepository.findByVendorId(
                vendorId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return mapPage(result);
    }

    public ProductDto.ProductResponse updateStock(String vendorId, String productId, ProductDto.StockUpdateRequest req) {
        Product product = getOwnedProduct(vendorId, productId);
        product.setStock(req.getStock());
        if (req.getIsAvailable() != null) {
            product.setIsAvailable(req.getIsAvailable());
        } else {
            product.setIsAvailable(req.getStock() > 0);
        }
        return ProductDto.ProductResponse.from(productRepository.save(product));
    }

    public ProductDto.ProductResponse uploadImage(String vendorId, String productId, MultipartFile file) throws IOException {
        Product product = getOwnedProduct(vendorId, productId);
        if (product.getImages().size() >= MAX_IMAGES) {
            throw new BusinessException("Maximum " + MAX_IMAGES + " images allowed per product");
        }
        String url = cloudinaryService.uploadImage(file, "products/" + vendorId + "/" + productId);
        product.getImages().add(url);
        return ProductDto.ProductResponse.from(productRepository.save(product));
    }

    public ProductDto.ProductResponse removeImage(String vendorId, String productId, int imageIndex) {
        Product product = getOwnedProduct(vendorId, productId);
        if (imageIndex < 0 || imageIndex >= product.getImages().size()) {
            throw new BusinessException("Invalid image index");
        }
        String removed = product.getImages().remove(imageIndex);
        cloudinaryService.deleteImage(removed);
        return ProductDto.ProductResponse.from(productRepository.save(product));
    }

    public List<ProductDto.ProductResponse> bulkImport(String vendorId, MultipartFile file) throws IOException {
        Shop shop = shopRepository.findByOwnerId(vendorId)
                .orElseThrow(() -> new BusinessException("Create your shop before bulk importing products"));

        List<ProductDto.ProductResponse> created = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String header = reader.readLine();
            if (header == null) {
                throw new BusinessException("CSV file is empty");
            }
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] cols = line.split(",", -1);
                if (cols.length < 4) continue;

                ProductDto.CreateProductRequest req = new ProductDto.CreateProductRequest();
                req.setName(cols[0].trim());
                req.setDescription(cols.length > 1 ? cols[1].trim() : "");
                req.setPrice(Double.parseDouble(cols[2].trim()));
                req.setCategory(cols[3].trim());
                req.setStock(cols.length > 4 && !cols[4].isBlank() ? Integer.parseInt(cols[4].trim()) : 0);
                req.setUnit(cols.length > 5 && !cols[5].isBlank() ? cols[5].trim() : "piece");
                if (cols.length > 6 && !cols[6].isBlank()) {
                    req.setSku(cols[6].trim());
                }
                created.add(createProduct(vendorId, req));
            }
        }
        if (created.isEmpty()) {
            throw new BusinessException("No valid products found in CSV");
        }
        return created;
    }

    private Product getOwnedProduct(String vendorId, String productId) {
        Product product = productRepository.findByIdAndVendorId(productId, vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return product;
    }

    private ProductDto.PageResponse<ProductDto.ProductResponse> mapPage(Page<Product> page) {
        Page<ProductDto.ProductResponse> mapped = page.map(ProductDto.ProductResponse::from);
        return ProductDto.PageResponse.of(mapped);
    }
}
