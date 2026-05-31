package com.locafy.delivery.service;

import com.locafy.common.exception.BusinessException;
import com.locafy.common.exception.ResourceNotFoundException;
import com.locafy.common.exception.UnauthorizedException;
import com.locafy.delivery.dto.DeliveryDto;
import com.locafy.delivery.model.DeliveryLocation;
import com.locafy.delivery.model.DeliveryProfile;
import com.locafy.delivery.repository.DeliveryLocationRepository;
import com.locafy.delivery.repository.DeliveryProfileRepository;
import com.locafy.order.dto.OrderDto;
import com.locafy.order.model.Order;
import com.locafy.order.repository.OrderRepository;
import com.locafy.order.service.OrderNotificationService;
import com.locafy.shop.model.Shop;
import com.locafy.shop.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private static final Set<Order.OrderStatus> DELIVERY_ACTIONS = Set.of(
            Order.OrderStatus.PICKED_UP,
            Order.OrderStatus.OUT_FOR_DELIVERY,
            Order.OrderStatus.DELIVERED);
    private static final Set<Order.OrderStatus> ACTIVE_STATUSES = Set.of(
            Order.OrderStatus.READY,
            Order.OrderStatus.PICKED_UP,
            Order.OrderStatus.OUT_FOR_DELIVERY);

    private final DeliveryProfileRepository profileRepository;
    private final DeliveryLocationRepository locationRepository;
    private final OrderRepository orderRepository;
    private final ShopRepository shopRepository;
    private final OrderNotificationService notificationService;

    public DeliveryDto.ProfileResponse getProfile(String partnerId) {
        return DeliveryDto.ProfileResponse.from(getOrCreateProfile(partnerId));
    }

    @Transactional
    public DeliveryDto.ProfileResponse updateProfile(String partnerId, DeliveryDto.UpdateProfileRequest req) {
        DeliveryProfile profile = getOrCreateProfile(partnerId);
        if (req.getIsOnline() != null) {
            profile.setIsOnline(req.getIsOnline());
        }
        if (req.getZoneLatitude() != null && req.getZoneLongitude() != null) {
            profile.setZoneCenter(new double[]{req.getZoneLongitude(), req.getZoneLatitude()});
        }
        if (req.getZoneRadiusKm() != null) {
            profile.setZoneRadiusKm(req.getZoneRadiusKm());
        }
        if (req.getVehicleType() != null) {
            profile.setVehicleType(req.getVehicleType());
        }
        return DeliveryDto.ProfileResponse.from(profileRepository.save(profile));
    }

    public DeliveryDto.DashboardResponse getDashboard(String partnerId) {
        DeliveryProfile profile = getOrCreateProfile(partnerId);
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        long todayDeliveries = orderRepository.countByDeliveryPartnerIdAndStatusAndDeliveredAtAfter(
                partnerId, Order.OrderStatus.DELIVERED, startOfDay);
        long totalDeliveries = orderRepository.countByDeliveryPartnerIdAndStatus(partnerId, Order.OrderStatus.DELIVERED);
        long activeOrders = orderRepository.findByDeliveryPartnerIdAndStatusInOrderByCreatedAtDesc(
                partnerId, new ArrayList<>(ACTIVE_STATUSES), PageRequest.of(0, 1)).getTotalElements();

        Page<Order> available = orderRepository.findByStatusAndFulfillmentTypeAndDeliveryPartnerIdIsNullOrderByCreatedAtDesc(
                Order.OrderStatus.READY, Order.FulfillmentType.DELIVERY, PageRequest.of(0, 50));

        long availableInZone = available.getContent().stream()
                .filter(o -> isOrderInZone(o, profile))
                .count();

        double todayEarnings = todayDeliveries * averageDeliveryFee(partnerId, startOfDay);
        double totalEarnings = sumDeliveryEarnings(partnerId);

        return DeliveryDto.DashboardResponse.builder()
                .todayDeliveries(todayDeliveries)
                .todayEarnings(todayEarnings)
                .totalDeliveries(totalDeliveries)
                .totalEarnings(totalEarnings)
                .activeOrders(activeOrders)
                .availableInZone(availableInZone)
                .isOnline(Boolean.TRUE.equals(profile.getIsOnline()))
                .build();
    }

    public DeliveryDto.OrderPageResponse getAvailableOrders(String partnerId, int page, int size) {
        DeliveryProfile profile = getOrCreateProfile(partnerId);
        if (!Boolean.TRUE.equals(profile.getIsOnline())) {
            return emptyPage(page, size);
        }

        Page<Order> result = orderRepository.findByStatusAndFulfillmentTypeAndDeliveryPartnerIdIsNullOrderByCreatedAtDesc(
                Order.OrderStatus.READY, Order.FulfillmentType.DELIVERY, PageRequest.of(page, size));

        List<DeliveryDto.DeliveryOrderResponse> filtered = result.getContent().stream()
                .filter(o -> isOrderInZone(o, profile))
                .map(this::toDeliveryOrder)
                .toList();

        return DeliveryDto.OrderPageResponse.builder()
                .content(filtered)
                .totalElements(filtered.size())
                .page(page)
                .size(size)
                .hasMore(result.hasNext())
                .build();
    }

    public DeliveryDto.OrderPageResponse getActiveOrders(String partnerId, int page, int size) {
        Page<Order> result = orderRepository.findByDeliveryPartnerIdAndStatusInOrderByCreatedAtDesc(
                partnerId, new ArrayList<>(ACTIVE_STATUSES), PageRequest.of(page, size));
        return toPage(result, page, size);
    }

    public DeliveryDto.OrderPageResponse getHistory(String partnerId, int page, int size) {
        Page<Order> result = orderRepository.findByDeliveryPartnerIdAndStatusOrderByDeliveredAtDesc(
                partnerId, Order.OrderStatus.DELIVERED, PageRequest.of(page, size));
        return toPage(result, page, size);
    }

    public DeliveryDto.DeliveryOrderResponse getOrderForPartner(String partnerId, String orderId) {
        Order order = orderRepository.findByIdAndDeliveryPartnerId(orderId, partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return toDeliveryOrder(order);
    }

    @Transactional
    public DeliveryDto.DeliveryOrderResponse acceptOrder(String partnerId, String orderId) {
        DeliveryProfile profile = getOrCreateProfile(partnerId);
        if (!Boolean.TRUE.equals(profile.getIsOnline())) {
            throw new BusinessException("Go online to accept orders");
        }

        long active = orderRepository.findByDeliveryPartnerIdAndStatusInOrderByCreatedAtDesc(
                partnerId, new ArrayList<>(ACTIVE_STATUSES), PageRequest.of(0, 1)).getTotalElements();
        if (active > 0) {
            throw new BusinessException("Complete your current delivery before accepting another");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getFulfillmentType() != Order.FulfillmentType.DELIVERY) {
            throw new BusinessException("Not a delivery order");
        }
        if (order.getStatus() != Order.OrderStatus.READY) {
            throw new BusinessException("Order is not ready for pickup");
        }
        if (order.getDeliveryPartnerId() != null) {
            throw new BusinessException("Order already accepted by another partner");
        }
        if (!isOrderInZone(order, profile)) {
            throw new BusinessException("Order is outside your delivery zone");
        }

        order.setDeliveryPartnerId(partnerId);
        order = orderRepository.save(order);
        notificationService.notifyOrderStatusUpdate(order);
        return toDeliveryOrder(order);
    }

    @Transactional
    public DeliveryDto.DeliveryOrderResponse updateDeliveryStatus(
            String partnerId, String orderId, Order.OrderStatus status, String note) {
        if (!DELIVERY_ACTIONS.contains(status)) {
            throw new BusinessException("Invalid delivery status");
        }

        Order order = orderRepository.findByIdAndDeliveryPartnerId(orderId, partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new BusinessException("Order is cancelled");
        }
        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new BusinessException("Order already delivered");
        }

        validateTransition(order.getStatus(), status);

        order.setStatus(status);
        if (status == Order.OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
            if (order.getPaymentMethod() == Order.PaymentMethod.COD) {
                order.setPaymentStatus(Order.PaymentStatus.PAID);
            }
        }

        List<Order.StatusHistoryEntry> history = new ArrayList<>(order.getStatusHistory());
        history.add(Order.StatusHistoryEntry.builder()
                .status(status)
                .timestamp(LocalDateTime.now())
                .note(note != null ? note : status.name())
                .build());
        order.setStatusHistory(history);

        order = orderRepository.save(order);
        notificationService.notifyOrderStatusUpdate(order);
        return toDeliveryOrder(order);
    }

    @Transactional
    public DeliveryDto.LocationResponse updateLocation(String partnerId, String orderId, double lat, double lng) {
        Order order = orderRepository.findByIdAndDeliveryPartnerId(orderId, partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!ACTIVE_STATUSES.contains(order.getStatus()) && order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new BusinessException("Location updates only allowed for active deliveries");
        }

        LocalDateTime now = LocalDateTime.now();
        DeliveryLocation location = locationRepository.findFirstByOrderIdOrderByUpdatedAtDesc(orderId)
                .orElse(DeliveryLocation.builder().orderId(orderId).partnerId(partnerId).build());
        location.setPartnerId(partnerId);
        location.setLatitude(lat);
        location.setLongitude(lng);
        location.setUpdatedAt(now);
        location = locationRepository.save(location);

        notificationService.broadcastDeliveryLocation(orderId, partnerId, lat, lng);

        return DeliveryDto.LocationResponse.builder()
                .orderId(orderId)
                .partnerId(partnerId)
                .latitude(lat)
                .longitude(lng)
                .updatedAt(now.toString())
                .build();
    }

    public DeliveryDto.LocationResponse getLocationForOrder(String orderId, String requesterId, boolean isDeliveryPartner) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (isDeliveryPartner) {
            if (!requesterId.equals(order.getDeliveryPartnerId())) {
                throw new UnauthorizedException("Not your delivery");
            }
        } else if (!order.getCustomerId().equals(requesterId)) {
            throw new UnauthorizedException("Not your order");
        }

        DeliveryLocation location = locationRepository.findFirstByOrderIdOrderByUpdatedAtDesc(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not available yet"));

        return DeliveryDto.LocationResponse.builder()
                .orderId(orderId)
                .partnerId(location.getPartnerId())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .updatedAt(location.getUpdatedAt() != null ? location.getUpdatedAt().toString() : null)
                .build();
    }

    private void validateTransition(Order.OrderStatus current, Order.OrderStatus next) {
        boolean valid = switch (current) {
            case READY -> next == Order.OrderStatus.PICKED_UP;
            case PICKED_UP -> next == Order.OrderStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY -> next == Order.OrderStatus.DELIVERED;
            default -> false;
        };
        if (!valid) {
            throw new BusinessException("Cannot transition from " + current + " to " + next);
        }
    }

    private DeliveryProfile getOrCreateProfile(String partnerId) {
        return profileRepository.findByUserId(partnerId)
                .orElseGet(() -> profileRepository.save(DeliveryProfile.builder()
                        .userId(partnerId)
                        .isOnline(false)
                        .zoneRadiusKm(5.0)
                        .build()));
    }

    private boolean isOrderInZone(Order order, DeliveryProfile profile) {
        if (profile.getZoneCenter() == null || profile.getZoneCenter().length < 2) {
            return true;
        }
        Shop shop = shopRepository.findById(order.getShopId()).orElse(null);
        if (shop == null || shop.getLocation() == null) {
            return true;
        }
        double shopLat = shop.getLocation().getY();
        double shopLng = shop.getLocation().getX();
        double zoneLat = profile.getZoneCenter()[1];
        double zoneLng = profile.getZoneCenter()[0];
        double radius = profile.getZoneRadiusKm() != null ? profile.getZoneRadiusKm() : 5.0;
        return haversineKm(zoneLat, zoneLng, shopLat, shopLng) <= radius;
    }

    private double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private DeliveryDto.DeliveryOrderResponse toDeliveryOrder(Order order) {
        Shop shop = shopRepository.findById(order.getShopId()).orElse(null);
        Double shopLat = null;
        Double shopLng = null;
        String shopAddress = null;
        if (shop != null) {
            if (shop.getLocation() != null) {
                shopLng = shop.getLocation().getX();
                shopLat = shop.getLocation().getY();
            }
            if (shop.getAddress() != null) {
                shopAddress = shop.getAddress().getLine1() + ", " + shop.getAddress().getCity();
            }
        }

        Double custLat = null;
        Double custLng = null;
        if (order.getDeliveryAddress() != null && order.getDeliveryAddress().getCoordinates() != null
                && order.getDeliveryAddress().getCoordinates().getCoordinates() != null
                && order.getDeliveryAddress().getCoordinates().getCoordinates().length >= 2) {
            custLng = order.getDeliveryAddress().getCoordinates().getCoordinates()[0];
            custLat = order.getDeliveryAddress().getCoordinates().getCoordinates()[1];
        }

        double earning = order.getDeliveryFee() != null ? order.getDeliveryFee() : 0;

        return DeliveryDto.DeliveryOrderResponse.from(
                OrderDto.OrderResponse.from(order),
                shopLat, shopLng, shopAddress,
                custLat, custLng, earning);
    }

    private DeliveryDto.OrderPageResponse toPage(Page<Order> result, int page, int size) {
        return DeliveryDto.OrderPageResponse.builder()
                .content(result.getContent().stream().map(this::toDeliveryOrder).toList())
                .totalElements(result.getTotalElements())
                .page(page)
                .size(size)
                .hasMore(result.hasNext())
                .build();
    }

    private DeliveryDto.OrderPageResponse emptyPage(int page, int size) {
        return DeliveryDto.OrderPageResponse.builder()
                .content(List.of())
                .totalElements(0)
                .page(page)
                .size(size)
                .hasMore(false)
                .build();
    }

    private double averageDeliveryFee(String partnerId, LocalDateTime since) {
        return orderRepository.findByDeliveryPartnerIdAndStatusOrderByDeliveredAtDesc(
                        partnerId, Order.OrderStatus.DELIVERED, PageRequest.of(0, 100))
                .getContent().stream()
                .filter(o -> o.getDeliveredAt() != null && !o.getDeliveredAt().isBefore(since))
                .mapToDouble(o -> o.getDeliveryFee() != null ? o.getDeliveryFee() : 0)
                .average()
                .orElse(30.0);
    }

    private double sumDeliveryEarnings(String partnerId) {
        return orderRepository.findByDeliveryPartnerIdAndStatusOrderByDeliveredAtDesc(
                        partnerId, Order.OrderStatus.DELIVERED, PageRequest.of(0, 500))
                .getContent().stream()
                .mapToDouble(o -> o.getDeliveryFee() != null ? o.getDeliveryFee() : 0)
                .sum();
    }
}
