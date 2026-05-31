package com.locafy.order.service;

import com.locafy.order.dto.OrderDto;
import com.locafy.order.model.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyVendorNewOrder(Order order) {
        messagingTemplate.convertAndSend(
                "/topic/vendor/" + order.getShopId() + "/orders",
                Map.of(
                        "type", "NEW_ORDER",
                        "orderId", order.getId(),
                        "orderNumber", order.getOrderNumber(),
                        "total", order.getTotal(),
                        "fulfillmentType", order.getFulfillmentType().name(),
                        "paymentMethod", order.getPaymentMethod().name(),
                        "itemCount", order.getItems().size()
                ));
    }

    public void notifyOrderStatusUpdate(Order order) {
        messagingTemplate.convertAndSend(
                "/topic/orders/" + order.getId(),
                OrderDto.OrderResponse.from(order));
    }

    public void notifyDeliveryPool(Order order) {
        if (order.getFulfillmentType() != Order.FulfillmentType.DELIVERY
                || order.getStatus() != Order.OrderStatus.READY
                || order.getDeliveryPartnerId() != null) {
            return;
        }
        messagingTemplate.convertAndSend(
                "/topic/delivery/pool",
                Map.of(
                        "type", "ORDER_AVAILABLE",
                        "orderId", order.getId(),
                        "orderNumber", order.getOrderNumber(),
                        "shopId", order.getShopId(),
                        "shopName", order.getShopName(),
                        "deliveryFee", order.getDeliveryFee() != null ? order.getDeliveryFee() : 0,
                        "total", order.getTotal()
                ));
    }

    public void broadcastDeliveryLocation(String orderId, String partnerId, double lat, double lng) {
        messagingTemplate.convertAndSend(
                "/topic/delivery/" + orderId,
                Map.of(
                        "type", "LOCATION_UPDATE",
                        "orderId", orderId,
                        "partnerId", partnerId,
                        "latitude", lat,
                        "longitude", lng,
                        "timestamp", java.time.Instant.now().toString()
                ));
    }
}
