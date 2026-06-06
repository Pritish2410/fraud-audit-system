package com.enterprise.fraudauditengine.redis;

import com.enterprise.fraudauditengine.dto.TransactionRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

@Service
public class FraudProducer {
    private final StringRedisTemplate redisTemplate;
    private final ChannelTopic topic;

    public FraudProducer(StringRedisTemplate redisTemplate, ChannelTopic topic) {
        this.redisTemplate = redisTemplate;
        this.topic = topic;
    }

    public void streamBlockedAccount(TransactionRequest request) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String jsonPayload = mapper.writeValueAsString(request);
            
            // FIXED: Sending to your actual configured topic bean, not a hardcoded string!
            redisTemplate.convertAndSend(topic.getTopic(), jsonPayload);
            
            System.out.println("=> [REDIS PIPELINE] Pushed dynamic payload: " + jsonPayload);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}