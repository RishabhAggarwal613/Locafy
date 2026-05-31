package com.locafy.order.service;

import com.locafy.cart.service.CartService;
import com.locafy.common.exception.BusinessException;
import com.locafy.common.exception.ResourceNotFoundException;
import com.locafy.common.exception.UnauthorizedException;
import com.locafy.order.dto.OrderDto;
import com.locafy.order.model.Order;
import com.locafy.order.repository.OrderRepository;
import com.locafy.payment.service.RazorpayService;
import com.locafy.product.model.Product;
import com.locafy.product.repository.ProductRepository;
import com.locafy.shop.model.Shop;
import com.locafy.shop.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final double DELIVERY_FEE = 30.0;
    private static final Set<Order.OrderStatus> CUSTOMER_CANCELLABLE = Set.of(
            Order.OrderStatus.PLACED, Order.OrderStatus.CONFIRMED);
    private static final Set<Order.OrderStatus> VENDOR_TRANSITIONS = Set.of(
            Order.OrderStatus.CONFIRMED, Order.OrderStatus.PREPARING,
            Order.OrderStatus.READY, Order.OrderStatus.DELIVERED);

    private final OrderRepository orderRepository;
    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final RazorpayService razorpayService;
    private final OrderNotificationService notificationService;

    @Value("${app.platform-fee-percent:10}")
    private double platformFeePercent;

    @Transactional
    public OrderDto.PlaceOrderResponse placeOrder(String customerId, OrderDto.PlaceOrderRequest req) {
        Shop shop = shopRepository.findById(req.getShopId())
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found"));
        if (!Boolean.TRUE.equals(shop.getIsActive())) {
            throw new BusinessException("Shop is not active");
        }
        if (req.getFulfillmentType() == Order.FulfillmentType.DELIVERY
                && !Boolean.TRUE.equals(shop.getDeliveryAvailable())) {
            throw new BusinessException("Shop does not offer delivery");
        }
        if (req.getFulfillmentType() == Order.FulfillmentType.PICKUP
                && !Boolean.TRUE.equals(shop.getPickupAvailable())) {
            throw new BusinessException("Shop does not offer pickup");
        }
        if (req.getFulfillmentType() == Order.FulfillmentType.DELIVERY && req.getDeliveryAddress() == null) {
            throw new BusinessException("Delivery address is required");
        }

        List<Order.OrderItem> orderItems = new ArrayList<>();
        double subtotal = 0;

        for (OrderDto.OrderItemRequest itemReq : req.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));
            if (!product.getShopId().equals(shop.getId())) {
                throw new BusinessException("All items must be from the same shop");
            }
            if (!Boolean.TRUE.equals(product.getIsAvailable()) || product.getStock() < itemReq.getQuantity()) {
                throw new BusinessException("Product unavailable: " + product.getName());
            }

            double unitPrice = product.getDiscountedPrice() != null && product.getDiscountedPrice() > 0
                    ? product.getDiscountedPrice() : product.getPrice();
            double lineTotal = unitPrice * itemReq.getQuantity();
            subtotal += lineTotal;

            orderItems.add(Order.OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productImage(product.getImages().isEmpty() ? null : product.getImages().get(0))
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(lineTotal)
                    .build());

            product.setStock(product.getStock() - itemReq.getQuantity());
            if (product.getStock() <= 0) product.setIsAvailable(false);
            productRepository.save(product);
        }

        if (shop.getMinOrderAmount() != null && subtotal < shop.getMinOrderAmount()) {
            throw new BusinessException("Minimum order amount is ₹" + shop.getMinOrderAmount());
        }

        double deliveryFee = req.getFulfillmentType() == Order.FulfillmentType.DELIVERY ? DELIVERY_FEE : 0;
        double platformFee = Math.round(subtotal * platformFeePercent) / 100.0;
        double total = subtotal + deliveryFee + platformFee;

        Order.DeliveryAddress deliveryAddress = null;
        if (req.getDeliveryAddress() != null) {
            OrderDto.DeliveryAddressRequest addr = req.getDeliveryAddress();
            Order.DeliveryAddress.DeliveryAddressBuilder builder = Order.DeliveryAddress.builder()
                    .label(addr.getLabel())
                    .line1(addr.getLine1())
                    .line2(addr.getLine2())
                    .city(addr.getCity())
                    .pincode(addr.getPincode());
            if (addr.getLatitude() != null && addr.getLongitude() != null) {
                builder.coordinates(Order.GeoPoint.builder()
                        .coordinates(new double[]{addr.getLongitude(), addr.getLatitude()})
                        .build());
            }
            deliveryAddress = builder.build();
        }

        LocalDateTime now = LocalDateTime.now();
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .customerId(customerId)
                .shopId(shop.getId())
                .shopName(shop.getName())
                .vendorId(shop.getOwnerId())
                .items(orderItems)
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .platformFee(platformFee)
                .discount(0.0)
                .total(total)
                .fulfillmentType(req.getFulfillmentType())
                .status(Order.OrderStatus.PLACED)
                .paymentMethod(req.getPaymentMethod())
                .paymentStatus(Order.PaymentStatus.PENDING)
                .deliveryAddress(deliveryAddress)
                .statusHistory(List.of(Order.StatusHistoryEntry.builder()
                        .status(Order.OrderStatus.PLACED)
                        .timestamp(now)
                        .note("Order placed")
                        .build()))
                .build();

        order = orderRepository.save(order);
        cartService.clearCart(customerId);

        OrderDto.PlaceOrderResponse.PlaceOrderResponseBuilder response = OrderDto.PlaceOrderResponse.builder()
                .order(OrderDto.OrderResponse.from(order));

        if (req.getPaymentMethod() == Order.PaymentMethod.RAZORPAY) {
            String razorpayOrderId = razorpayService.createOrder(total, order.getOrderNumber());
            order.setRazorpayOrderId(razorpayOrderId);
            order = orderRepository.save(order);
            response.razorpayOrderId(razorpayOrderId)
                    .razorpayKeyId(razorpayService.getKeyId())
                    .razorpayAmount(Math.round(total * 100));
        }

        notificationService.notifyVendorNewOrder(order);
        response.order(OrderDto.OrderResponse.from(order));
        return response.build();
    }

    public OrderDto.OrderPageResponse getCustomerOrders(String customerId, int page, int size) {
        Page<Order> result = orderRepository.findByCustomerIdOrderByCreatedAtDesc(
                customerId, PageRequest.of(page, size));
        return toPage(result, page, size);
    }

    public OrderDto.OrderPageResponse getVendorOrders(String vendorId, Order.OrderStatus status, int page, int size) {
        Shop shop = shopRepository.findByOwnerId(vendorId)
                .orElseThrow(() -> new BusinessException("Shop not found"));
        Page<Order> result = status != null
                ? orderRepository.findByShopIdAndStatusOrderByCreatedAtDesc(shop.getId(), status, PageRequest.of(page, size))
                : orderRepository.findByShopIdOrderByCreatedAtDesc(shop.getId(), PageRequest.of(page, size));
        return toPage(result, page, size);
    }

    public OrderDto.OrderResponse getOrderForCustomer(String customerId, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getCustomerId().equals(customerId)) {
            throw new UnauthorizedException("Not your order");
        }
        return OrderDto.OrderResponse.from(order);
    }

    public OrderDto.OrderResponse getOrderForVendor(String vendorId, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getVendorId().equals(vendorId)) {
            throw new UnauthorizedException("Not your shop's order");
        }
        return OrderDto.OrderResponse.from(order);
    }

    @Transactional
    public OrderDto.OrderResponse cancelOrder(String customerId, String orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getCustomerId().equals(customerId)) {
            throw new UnauthorizedException("Not your order");
        }
        if (!CUSTOMER_CANCELLABLE.contains(order.getStatus())) {
            throw new BusinessException("Order cannot be cancelled at this stage");
        }
        restoreStock(order);
        return updateStatus(order, Order.OrderStatus.CANCELLED, reason != null ? reason : "Cancelled by customer");
    }

    @Transactional
    public OrderDto.OrderResponse updateVendorStatus(String vendorId, String orderId, Order.OrderStatus status, String note) {
        if (!VENDOR_TRANSITIONS.contains(status)) {
            throw new BusinessException("Invalid status transition");
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        Shop shop = shopRepository.findByOwnerId(vendorId)
                .orElseThrow(() -> new BusinessException("Shop not found"));
        if (!order.getShopId().equals(shop.getId())) {
            throw new UnauthorizedException("Not your shop's order");
        }
        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new BusinessException("Order is cancelled");
        }
        if (status == Order.OrderStatus.DELIVERED && order.getFulfillmentType() != Order.FulfillmentType.PICKUP) {
            throw new BusinessException("Use delivery flow for delivery orders");
        }
        if (status == Order.OrderStatus.DELIVERED && order.getPaymentMethod() == Order.PaymentMethod.COD) {
            order.setPaymentStatus(Order.PaymentStatus.PAID);
        }
        return updateStatus(order, status, note);
    }

    public void markPaymentPaid(Order order, String razorpayPaymentId) {
        order.setPaymentStatus(Order.PaymentStatus.PAID);
        order.setRazorpayPaymentId(razorpayPaymentId);
        orderRepository.save(order);
        notificationService.notifyVendorNewOrder(order);
    }

    public Order findByRazorpayOrderId(String razorpayOrderId) {
        return orderRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found for Razorpay ID"));
    }

    private OrderDto.OrderResponse updateStatus(Order order, Order.OrderStatus status, String note) {
        order.setStatus(status);
        if (status == Order.OrderStatus.CANCELLED) {
            order.setCancelReason(note);
        }
        if (status == Order.OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        List<Order.StatusHistoryEntry> history = new ArrayList<>(order.getStatusHistory());
        history.add(Order.StatusHistoryEntry.builder()
                .status(status)
                .timestamp(LocalDateTime.now())
                .note(note)
                .build());
        order.setStatusHistory(history);
        order = orderRepository.save(order);
        notificationService.notifyOrderStatusUpdate(order);
        return OrderDto.OrderResponse.from(order);
    }

    private void restoreStock(Order order) {
        for (Order.OrderItem item : order.getItems()) {
            productRepository.findById(item.getProductId()).ifPresent(product -> {
                product.setStock(product.getStock() + item.getQuantity());
                product.setIsAvailable(true);
                productRepository.save(product);
            });
        }
    }

    private OrderDto.OrderPageResponse toPage(Page<Order> result, int page, int size) {
        return OrderDto.OrderPageResponse.builder()
                .content(result.getContent().stream().map(OrderDto.OrderResponse::from).toList())
                .totalElements(result.getTotalElements())
                .page(page)
                .size(size)
                .hasMore(result.hasNext())
                .build();
    }

    private String generateOrderNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        long count = orderRepository.count() + 1;
        return "LOC-" + date + "-" + String.format("%04d", count % 10000);
    }
}
