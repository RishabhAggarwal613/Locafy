package com.locafy.notification.service;

import com.locafy.order.model.Order;
import com.locafy.user.model.User;
import com.locafy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.notifications.email-enabled:false}")
    private boolean emailEnabled;

    public boolean isConfigured() {
        return emailEnabled && StringUtils.hasText(fromEmail);
    }

    @Async
    public void sendOrderConfirmation(Order order) {
        if (!isConfigured()) return;
        userRepository.findById(order.getCustomerId()).ifPresent(customer -> {
            if (!StringUtils.hasText(customer.getEmail())) return;
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(customer.getEmail());
                message.setSubject("Order confirmed — " + order.getOrderNumber());
                message.setText("""
                        Hi %s,

                        Your order %s from %s has been placed successfully.

                        Total: ₹%.2f
                        Payment: %s
                        Status: %s

                        Track your order in the Locafy app.

                        — Locafy
                        """.formatted(
                        customer.getName(),
                        order.getOrderNumber(),
                        order.getShopName(),
                        order.getTotal(),
                        order.getPaymentMethod(),
                        order.getStatus()
                ));
                mailSender.send(message);
            } catch (Exception e) {
                log.warn("Failed to send order confirmation email for {}: {}", order.getId(), e.getMessage());
            }
        });
    }

    @Async
    public void sendOrderStatusUpdate(Order order) {
        if (!isConfigured()) return;
        userRepository.findById(order.getCustomerId()).ifPresent(customer -> {
            if (!StringUtils.hasText(customer.getEmail())) return;
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(customer.getEmail());
                message.setSubject("Order update — " + order.getOrderNumber());
                message.setText("""
                        Hi %s,

                        Your order %s status is now: %s

                        Shop: %s
                        Total: ₹%.2f

                        — Locafy
                        """.formatted(
                        customer.getName(),
                        order.getOrderNumber(),
                        order.getStatus(),
                        order.getShopName(),
                        order.getTotal()
                ));
                mailSender.send(message);
            } catch (Exception e) {
                log.warn("Failed to send order status email for {}: {}", order.getId(), e.getMessage());
            }
        });
    }
}
