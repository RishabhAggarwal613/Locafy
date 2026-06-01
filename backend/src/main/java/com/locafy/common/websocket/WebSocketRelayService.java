package com.locafy.common.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketRelayService {

    private static final String CHANNEL = "locafy:ws:relay";

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    private final RedisMessageListenerContainer redisMessageListenerContainer;
    private final org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate;

    private final String instanceId = UUID.randomUUID().toString();

    @PostConstruct
    void subscribe() {
        redisMessageListenerContainer.addMessageListener((MessageListener) (message, pattern) -> {
            try {
                RelayEnvelope envelope = objectMapper.readValue(message.getBody(), RelayEnvelope.class);
                if (instanceId.equals(envelope.originId())) {
                    return;
                }
                Object payload = objectMapper.readValue(envelope.payloadJson(), Object.class);
                if ("USER".equals(envelope.kind()) && envelope.userId() != null) {
                    messagingTemplate.convertAndSendToUser(envelope.userId(), envelope.destination(), payload);
                } else {
                    messagingTemplate.convertAndSend(envelope.destination(), payload);
                }
            } catch (Exception e) {
                log.warn("WebSocket relay message handling failed: {}", e.getMessage());
            }
        }, new ChannelTopic(CHANNEL));
    }

    public void send(String destination, Object payload) {
        messagingTemplate.convertAndSend(destination, payload);
        publish("TOPIC", destination, null, payload);
    }

    public void sendToUser(String userId, String destination, Object payload) {
        messagingTemplate.convertAndSendToUser(userId, destination, payload);
        publish("USER", destination, userId, payload);
    }

    private void publish(String kind, String destination, String userId, Object payload) {
        try {
            RelayEnvelope envelope = new RelayEnvelope(
                    instanceId,
                    kind,
                    destination,
                    userId,
                    objectMapper.writeValueAsString(payload)
            );
            stringRedisTemplate.convertAndSend(CHANNEL, objectMapper.writeValueAsString(envelope));
        } catch (JsonProcessingException e) {
            log.warn("WebSocket relay publish failed: {}", e.getMessage());
        }
    }

    record RelayEnvelope(String originId, String kind, String destination, String userId, String payloadJson) {}
}
