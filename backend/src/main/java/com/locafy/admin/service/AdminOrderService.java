package com.locafy.admin.service;

import com.locafy.admin.dto.AdminDto;
import com.locafy.admin.model.AuditLog;
import com.locafy.common.exception.BusinessException;
import com.locafy.common.exception.ResourceNotFoundException;
import com.locafy.order.dto.OrderDto;
import com.locafy.order.model.Order;
import com.locafy.order.repository.OrderRepository;
import com.locafy.order.service.OrderNotificationService;
import com.locafy.payment.model.Transaction;
import com.locafy.payment.repository.TransactionRepository;
import com.locafy.payment.service.RazorpayService;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final RazorpayService razorpayService;
    private final TransactionRepository transactionRepository;
    private final OrderNotificationService notificationService;
    private final AuditLogService auditLogService;
    private final MongoTemplate mongoTemplate;

    public AdminDto.OrderPageResponse listOrders(Order.OrderStatus status, int page, int size) {
        Query query = new Query();
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status.name()));
        }
        long total = mongoTemplate.count(query, "orders");
        query.with(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<Document> docs = mongoTemplate.find(query, Document.class, "orders");

        return AdminDto.OrderPageResponse.builder()
                .content(docs.stream().map(this::toOrderResponse).toList())
                .totalElements(total)
                .page(page)
                .size(size)
                .hasMore((long) (page + 1) * size < total)
                .build();
    }

    private OrderDto.OrderResponse toOrderResponse(Document doc) {
        OrderDto.DeliveryAddressResponse deliveryAddress = null;
        Object addr = doc.get("deliveryAddress");
        if (addr instanceof Document addrDoc) {
            deliveryAddress = OrderDto.DeliveryAddressResponse.builder()
                    .label(addrDoc.getString("label"))
                    .line1(addrDoc.getString("line1"))
                    .line2(addrDoc.getString("line2"))
                    .city(addrDoc.getString("city"))
                    .pincode(addrDoc.getString("pincode"))
                    .build();
        } else if (addr instanceof String s) {
            deliveryAddress = OrderDto.DeliveryAddressResponse.builder().line1(s).build();
        }

        List<OrderDto.StatusHistoryResponse> history = List.of();
        List<Document> historyDocs = doc.getList("statusHistory", Document.class);
        if (historyDocs != null) {
            history = historyDocs.stream()
                    .map(h -> OrderDto.StatusHistoryResponse.builder()
                            .status(h.getString("status") != null
                                    ? Order.OrderStatus.valueOf(h.getString("status")) : null)
                            .timestamp(h.get("timestamp") != null ? h.get("timestamp").toString() : null)
                            .note(h.getString("note"))
                            .build())
                    .toList();
        }

        List<OrderDto.OrderItemResponse> items = List.of();
        List<Document> itemDocs = doc.getList("items", Document.class);
        if (itemDocs != null) {
            items = itemDocs.stream()
                    .map(i -> OrderDto.OrderItemResponse.builder()
                            .productId(i.getString("productId"))
                            .productName(i.getString("productName"))
                            .productImage(i.getString("productImage"))
                            .quantity(i.getInteger("quantity"))
                            .unitPrice(i.getDouble("unitPrice"))
                            .totalPrice(i.getDouble("totalPrice"))
                            .build())
                    .toList();
        }

        return OrderDto.OrderResponse.builder()
                .id(doc.getObjectId("_id").toHexString())
                .orderNumber(doc.getString("orderNumber"))
                .customerId(doc.getString("customerId"))
                .shopId(doc.getString("shopId"))
                .shopName(doc.getString("shopName"))
                .deliveryPartnerId(doc.getString("deliveryPartnerId"))
                .items(items)
                .subtotal(doc.getDouble("subtotal"))
                .deliveryFee(doc.getDouble("deliveryFee"))
                .platformFee(doc.getDouble("platformFee"))
                .total(doc.getDouble("total"))
                .fulfillmentType(enumField(doc, "fulfillmentType", Order.FulfillmentType.class))
                .status(enumField(doc, "status", Order.OrderStatus.class))
                .paymentMethod(enumField(doc, "paymentMethod", Order.PaymentMethod.class))
                .paymentStatus(enumField(doc, "paymentStatus", Order.PaymentStatus.class))
                .razorpayOrderId(doc.getString("razorpayOrderId"))
                .deliveryAddress(deliveryAddress)
                .statusHistory(history)
                .createdAt(doc.get("createdAt") != null ? doc.get("createdAt").toString() : null)
                .build();
    }

    private <E extends Enum<E>> E enumField(Document doc, String field, Class<E> type) {
        String value = doc.getString(field);
        return value != null ? Enum.valueOf(type, value) : null;
    }

    @Transactional
    public OrderDto.OrderResponse overrideStatus(String adminId, String orderId,
                                                 OrderDto.UpdateStatusRequest req, String ip) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(req.getStatus());
        if (req.getStatus() == Order.OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        if (req.getStatus() == Order.OrderStatus.CANCELLED) {
            order.setCancelReason(req.getNote());
        }
        List<Order.StatusHistoryEntry> history = new ArrayList<>(order.getStatusHistory());
        history.add(Order.StatusHistoryEntry.builder()
                .status(req.getStatus())
                .timestamp(LocalDateTime.now())
                .note("Admin override: " + (req.getNote() != null ? req.getNote() : req.getStatus().name()))
                .build());
        order.setStatusHistory(history);
        order = orderRepository.save(order);
        notificationService.notifyOrderStatusUpdate(order);
        auditLogService.record(adminId, AuditLog.Action.ORDER_STATUS_OVERRIDE, orderId,
                AuditLog.TargetType.ORDER, "Status set to " + req.getStatus(), ip);
        return OrderDto.OrderResponse.from(order);
    }

    @Transactional
    public OrderDto.OrderResponse refundOrder(String adminId, String orderId,
                                              AdminDto.RefundRequest req, String ip) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (order.getPaymentStatus() == Order.PaymentStatus.REFUNDED) {
            throw new BusinessException("Order already refunded");
        }
        if (order.getPaymentMethod() == Order.PaymentMethod.RAZORPAY
                && order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            if (!razorpayService.isConfigured()) {
                throw new BusinessException("Razorpay is not configured");
            }
            razorpayService.refundPayment(order.getRazorpayPaymentId(), order.getTotal());
        }
        order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        order.setStatus(Order.OrderStatus.REFUNDED);
        List<Order.StatusHistoryEntry> history = new ArrayList<>(order.getStatusHistory());
        history.add(Order.StatusHistoryEntry.builder()
                .status(Order.OrderStatus.REFUNDED)
                .timestamp(LocalDateTime.now())
                .note("Admin refund" + (req.getReason() != null ? ": " + req.getReason() : ""))
                .build());
        order.setStatusHistory(history);
        order = orderRepository.save(order);

        transactionRepository.save(Transaction.builder()
                .orderId(order.getId())
                .customerId(order.getCustomerId())
                .shopId(order.getShopId())
                .type(Transaction.TransactionType.REFUND)
                .method(order.getPaymentMethod() == Order.PaymentMethod.RAZORPAY
                        ? Transaction.PaymentMethod.RAZORPAY
                        : Transaction.PaymentMethod.COD)
                .status(Transaction.TransactionStatus.SUCCESS)
                .amount(order.getTotal())
                .currency("INR")
                .razorpayPaymentId(order.getRazorpayPaymentId())
                .note("Admin refund")
                .build());

        notificationService.notifyOrderStatusUpdate(order);
        auditLogService.record(adminId, AuditLog.Action.ORDER_REFUNDED, orderId,
                AuditLog.TargetType.ORDER, req.getReason() != null ? req.getReason() : "Order refunded", ip);
        return OrderDto.OrderResponse.from(order);
    }
}
