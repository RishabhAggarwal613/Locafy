package com.locafy.payment.service;

import com.locafy.common.exception.BusinessException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

@Service
@Slf4j
public class RazorpayService {

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    @Value("${razorpay.webhook-secret:}")
    private String webhookSecret;

    public boolean isConfigured() {
        return StringUtils.hasText(keyId) && StringUtils.hasText(keySecret);
    }

    public String getKeyId() {
        return keyId;
    }

    public String createOrder(double amountInRupees, String receipt) {
        if (!isConfigured()) {
            throw new BusinessException("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
        }
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            options.put("amount", Math.round(amountInRupees * 100));
            options.put("currency", "INR");
            options.put("receipt", receipt);
            Order order = client.orders.create(options);
            return order.get("id");
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed", e);
            throw new BusinessException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
        if (!isConfigured()) return false;
        String expected = hmacSha256(razorpayOrderId + "|" + razorpayPaymentId, keySecret);
        return constantTimeEquals(expected, signature);
    }

    public boolean verifyWebhookSignature(String payload, String signature) {
        if (!StringUtils.hasText(webhookSecret)) return false;
        String expected = hmacSha256(payload, webhookSecret);
        return constantTimeEquals(expected, signature);
    }

    public String refundPayment(String razorpayPaymentId, double amountInRupees) {
        if (!isConfigured()) {
            throw new BusinessException("Razorpay is not configured");
        }
        if (!StringUtils.hasText(razorpayPaymentId)) {
            throw new BusinessException("No Razorpay payment ID on order");
        }
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            options.put("amount", Math.round(amountInRupees * 100));
            com.razorpay.Refund refund = client.payments.refund(razorpayPaymentId, options);
            return refund.get("id");
        } catch (RazorpayException e) {
            log.error("Razorpay refund failed", e);
            throw new BusinessException("Refund failed: " + e.getMessage());
        }
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new BusinessException("Signature verification failed");
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
