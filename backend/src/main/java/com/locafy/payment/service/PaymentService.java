package com.locafy.payment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.locafy.common.exception.BusinessException;
import com.locafy.common.exception.ResourceNotFoundException;
import com.locafy.common.exception.UnauthorizedException;
import com.locafy.order.model.Order;
import com.locafy.order.repository.OrderRepository;
import com.locafy.order.service.OrderService;
import com.locafy.payment.dto.PaymentDto;
import com.locafy.payment.model.Transaction;
import com.locafy.payment.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final OrderRepository orderRepository;
    private final TransactionRepository transactionRepository;
    private final RazorpayService razorpayService;
    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    public PaymentDto.CreatePaymentResponse createPayment(String customerId, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getCustomerId().equals(customerId)) {
            throw new UnauthorizedException("Not your order");
        }
        if (order.getPaymentMethod() != Order.PaymentMethod.RAZORPAY) {
            throw new BusinessException("Order is not a Razorpay order");
        }
        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            throw new BusinessException("Order is already paid");
        }

        String razorpayOrderId = order.getRazorpayOrderId();
        if (razorpayOrderId == null) {
            razorpayOrderId = razorpayService.createOrder(order.getTotal(), order.getOrderNumber());
            order.setRazorpayOrderId(razorpayOrderId);
            orderRepository.save(order);
        }

        return PaymentDto.CreatePaymentResponse.builder()
                .razorpayOrderId(razorpayOrderId)
                .keyId(razorpayService.getKeyId())
                .amount(Math.round(order.getTotal() * 100))
                .currency("INR")
                .orderNumber(order.getOrderNumber())
                .build();
    }

    @Transactional
    public PaymentDto.VerifyPaymentResponse verifyPayment(String customerId, PaymentDto.VerifyPaymentRequest req) {
        Order order = orderService.findByRazorpayOrderId(req.getRazorpayOrderId());
        if (!order.getCustomerId().equals(customerId)) {
            throw new UnauthorizedException("Not your order");
        }

        boolean valid = razorpayService.verifyPaymentSignature(
                req.getRazorpayOrderId(), req.getRazorpayPaymentId(), req.getRazorpaySignature());
        if (!valid) {
            order.setPaymentStatus(Order.PaymentStatus.FAILED);
            orderRepository.save(order);
            recordTransaction(order, Transaction.TransactionStatus.FAILED, req.getRazorpayPaymentId());
            return PaymentDto.VerifyPaymentResponse.builder()
                    .verified(false)
                    .orderId(order.getId())
                    .paymentStatus(Order.PaymentStatus.FAILED.name())
                    .build();
        }

        orderService.markPaymentPaid(order, req.getRazorpayPaymentId());
        recordTransaction(order, Transaction.TransactionStatus.SUCCESS, req.getRazorpayPaymentId());

        return PaymentDto.VerifyPaymentResponse.builder()
                .verified(true)
                .orderId(order.getId())
                .paymentStatus(Order.PaymentStatus.PAID.name())
                .build();
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        if (!razorpayService.verifyWebhookSignature(payload, signature)) {
            throw new BusinessException("Invalid webhook signature");
        }
        try {
            JsonNode root = objectMapper.readTree(payload);
            String event = root.path("event").asText();
            if ("payment.captured".equals(event)) {
                JsonNode payment = root.path("payload").path("payment").path("entity");
                String razorpayOrderId = payment.path("order_id").asText();
                String razorpayPaymentId = payment.path("id").asText();
                Order order = orderService.findByRazorpayOrderId(razorpayOrderId);
                if (order.getPaymentStatus() != Order.PaymentStatus.PAID) {
                    orderService.markPaymentPaid(order, razorpayPaymentId);
                    recordTransaction(order, Transaction.TransactionStatus.SUCCESS, razorpayPaymentId);
                }
            }
        } catch (Exception e) {
            log.error("Webhook processing failed", e);
            throw new BusinessException("Webhook processing failed");
        }
    }

    public PaymentDto.TransactionPageResponse getPaymentHistory(String customerId, int page, int size) {
        var result = transactionRepository.findByCustomerIdOrderByCreatedAtDesc(
                customerId, PageRequest.of(page, size));
        return PaymentDto.TransactionPageResponse.builder()
                .content(result.getContent().stream().map(PaymentDto.TransactionResponse::from).toList())
                .totalElements(result.getTotalElements())
                .page(page)
                .size(size)
                .hasMore(result.hasNext())
                .build();
    }

    private void recordTransaction(Order order, Transaction.TransactionStatus status, String razorpayPaymentId) {
        transactionRepository.save(Transaction.builder()
                .orderId(order.getId())
                .customerId(order.getCustomerId())
                .shopId(order.getShopId())
                .type(Transaction.TransactionType.PAYMENT)
                .method(Transaction.PaymentMethod.RAZORPAY)
                .status(status)
                .amount(order.getTotal())
                .currency("INR")
                .razorpayOrderId(order.getRazorpayOrderId())
                .razorpayPaymentId(razorpayPaymentId)
                .note("Razorpay payment")
                .build());
    }
}
