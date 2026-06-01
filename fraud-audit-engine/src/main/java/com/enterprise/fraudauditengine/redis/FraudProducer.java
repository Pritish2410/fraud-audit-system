package com.enterprise.fraudauditengine.redis;

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

    public void streamBlockedAccount(String accountId) {
        redisTemplate.convertAndSend(topic.getTopic(), accountId);
    }
}