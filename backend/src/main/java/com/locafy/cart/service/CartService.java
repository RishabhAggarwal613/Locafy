package com.locafy.cart.service;

import com.locafy.cart.dto.CartDto;
import com.locafy.cart.model.Cart;
import com.locafy.cart.repository.CartRepository;
import com.locafy.common.exception.BusinessException;
import com.locafy.common.exception.ResourceNotFoundException;
import com.locafy.product.model.Product;
import com.locafy.product.repository.ProductRepository;
import com.locafy.shop.model.Shop;
import com.locafy.shop.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;

    public CartDto.CartResponse getCart(String customerId) {
        return cartRepository.findByCustomerId(customerId)
                .map(CartDto.CartResponse::from)
                .orElseGet(() -> CartDto.CartResponse.from(null));
    }

    public CartDto.CartResponse addItem(String customerId, String productId, int quantity) {
        if (quantity < 1) throw new BusinessException("Quantity must be at least 1");

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        if (!Boolean.TRUE.equals(product.getIsAvailable()) || product.getStock() < quantity) {
            throw new BusinessException("Product is not available in requested quantity");
        }

        Shop shop = shopRepository.findById(product.getShopId())
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found"));

        Cart cart = cartRepository.findByCustomerId(customerId).orElseGet(() ->
                Cart.builder().customerId(customerId).items(new ArrayList<>()).build());

        if (cart.getShopId() != null && !cart.getShopId().equals(product.getShopId())) {
            cart.setItems(new ArrayList<>());
        }

        cart.setShopId(shop.getId());
        cart.setShopName(shop.getName());

        double unitPrice = product.getDiscountedPrice() != null && product.getDiscountedPrice() > 0
                ? product.getDiscountedPrice() : product.getPrice();

        Optional<Cart.CartItem> existing = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId)).findFirst();

        if (existing.isPresent()) {
            int newQty = existing.get().getQuantity() + quantity;
            if (product.getStock() < newQty) throw new BusinessException("Insufficient stock");
            existing.get().setQuantity(newQty);
            existing.get().setTotalPrice(unitPrice * newQty);
        } else {
            cart.getItems().add(Cart.CartItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productImage(product.getImages().isEmpty() ? null : product.getImages().get(0))
                    .unitPrice(unitPrice)
                    .quantity(quantity)
                    .totalPrice(unitPrice * quantity)
                    .build());
        }

        recalcSubtotal(cart);
        return CartDto.CartResponse.from(cartRepository.save(cart));
    }

    public CartDto.CartResponse updateItem(String customerId, String productId, int quantity) {
        if (quantity < 1) return removeItem(customerId, productId);

        Cart cart = cartRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart is empty"));

        Cart.CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item not in cart"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        if (product.getStock() < quantity) throw new BusinessException("Insufficient stock");

        item.setQuantity(quantity);
        item.setTotalPrice(item.getUnitPrice() * quantity);
        recalcSubtotal(cart);
        return CartDto.CartResponse.from(cartRepository.save(cart));
    }

    public CartDto.CartResponse removeItem(String customerId, String productId) {
        Cart cart = cartRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart is empty"));

        cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        if (cart.getItems().isEmpty()) {
            cartRepository.delete(cart);
            return CartDto.CartResponse.from(null);
        }
        recalcSubtotal(cart);
        return CartDto.CartResponse.from(cartRepository.save(cart));
    }

    public void clearCart(String customerId) {
        cartRepository.deleteByCustomerId(customerId);
    }

    private void recalcSubtotal(Cart cart) {
        double subtotal = cart.getItems().stream()
                .mapToDouble(i -> i.getTotalPrice() != null ? i.getTotalPrice() : 0)
                .sum();
        cart.setSubtotal(subtotal);
    }
}
