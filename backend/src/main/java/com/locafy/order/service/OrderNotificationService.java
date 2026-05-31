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
}
