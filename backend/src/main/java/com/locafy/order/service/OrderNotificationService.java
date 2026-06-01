package com.locafy.order.service;

import com.locafy.common.websocket.WebSocketRelayService;
import com.locafy.order.dto.OrderDto;
import com.locafy.order.model.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderNotificationService {

    private final WebSocketRelayService relay;

    public void notifyVendorNewOrder(Order order) {
        relay.send(
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
        OrderDto.OrderResponse response = OrderDto.OrderResponse.from(order);

        relay.send("/topic/orders/" + order.getId(), response);

        relay.send(
                "/topic/vendor/" + order.getShopId() + "/orders",
                Map.of(
                        "type", "ORDER_STATUS",
                        "order", response
                ));

        String message = switch (order.getStatus()) {
            case CONFIRMED -> "Your order has been confirmed";
            case PREPARING -> "Your order is being prepared";
            case READY -> order.getFulfillmentType() == Order.FulfillmentType.PICKUP
                    ? "Your order is ready for pickup"
                    : "Your order is ready — waiting for delivery partner";
            case PICKED_UP -> "Delivery partner picked up your order";
            case OUT_FOR_DELIVERY -> "Your order is on the way";
            case DELIVERED -> "Your order has been delivered";
            case CANCELLED -> "Your order was cancelled";
            default -> "Order status updated to " + order.getStatus().name();
        };

        relay.sendToUser(
                order.getCustomerId(),
                "/queue/notifications",
                Map.of(
                        "type", "ORDER_STATUS",
                        "orderId", order.getId(),
                        "orderNumber", order.getOrderNumber(),
                        "status", order.getStatus().name(),
                        "shopName", order.getShopName(),
                        "message", message,
                        "order", response
                ));

        if (order.getVendorId() != null) {
            relay.sendToUser(
                    order.getVendorId(),
                    "/queue/notifications",
                    Map.of(
                            "type", "ORDER_STATUS",
                            "orderId", order.getId(),
                            "orderNumber", order.getOrderNumber(),
                            "status", order.getStatus().name(),
                            "message", "Order " + order.getOrderNumber() + " → " + order.getStatus().name(),
                            "order", response
                    ));
        }
    }

    public void notifyDeliveryPool(Order order) {
        if (order.getFulfillmentType() != Order.FulfillmentType.DELIVERY
                || order.getStatus() != Order.OrderStatus.READY
                || order.getDeliveryPartnerId() != null) {
            return;
        }
        relay.send(
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
        relay.send(
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
