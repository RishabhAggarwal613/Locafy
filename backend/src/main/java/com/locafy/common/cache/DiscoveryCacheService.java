package com.locafy.common.cache;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class DiscoveryCacheService {

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public <T> T getOrLoad(String key, long ttlSeconds, TypeReference<T> typeRef, Supplier<T> loader) {
        try {
            String cached = stringRedisTemplate.opsForValue().get(key);
            if (cached != null) {
                return objectMapper.readValue(cached, typeRef);
            }
            T value = loader.get();
            if (value != null) {
                stringRedisTemplate.opsForValue().set(
                        key, objectMapper.writeValueAsString(value), ttlSeconds, TimeUnit.SECONDS);
            }
            return value;
        } catch (Exception e) {
            throw new RuntimeException("Discovery cache error for key: " + key, e);
        }
    }

    public void invalidate(String patternPrefix) {
        var keys = stringRedisTemplate.keys(patternPrefix + "*");
        if (keys != null && !keys.isEmpty()) {
            stringRedisTemplate.delete(keys);
        }
    }
}
