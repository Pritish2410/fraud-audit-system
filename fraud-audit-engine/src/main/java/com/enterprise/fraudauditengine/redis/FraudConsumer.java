package com.enterprise.fraudauditengine.redis;

import com.enterprise.fraudauditengine.service.FraudAuditService;
import org.springframework.stereotype.Service;

@Service
public class FraudConsumer {
    private final FraudAuditService fraudAuditService;

    public FraudConsumer(FraudAuditService fraudAuditService) {
        this.fraudAuditService = fraudAuditService;
    }

    // Fires automatically in the background when an event hits the Redis stream
    public void consumeAndAudit(Object message) {
        fraudAuditService.executeAiAudit();
    }
}