package com.enterprise.fraudauditengine.redis;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

@Configuration
public class RedisConfig {
    
    @Bean
    public ChannelTopic topic() {
        return new ChannelTopic("high-velocity-alerts");
    }
    
    @Bean
    public RedisMessageListenerContainer container(RedisConnectionFactory connectionFactory, MessageListenerAdapter listenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(listenerAdapter, topic());
        return container;
    }

    @Bean
    public MessageListenerAdapter listenerAdapter(FraudConsumer consumer) {
        // Tells Redis to trigger the 'consumeAndAudit' method when a message arrives
        return new MessageListenerAdapter(consumer, "consumeAndAudit");
    }
}