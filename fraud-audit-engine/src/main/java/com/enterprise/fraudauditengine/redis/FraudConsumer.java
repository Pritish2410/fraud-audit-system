package com.enterprise.fraudauditengine.redis;

import com.enterprise.fraudauditengine.dto.TransactionRequest;
import com.enterprise.fraudauditengine.service.FraudAuditService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class FraudConsumer {
    private final FraudAuditService fraudAuditService;
    private final ObjectMapper objectMapper;

    public FraudConsumer(FraudAuditService fraudAuditService) {
        this.fraudAuditService = fraudAuditService;
        this.objectMapper = new ObjectMapper();
    }

    // Now safely receiving the String from the correct channel!
    public void consumeAndAudit(String message) {
        System.out.println("=> [CONSUMER WOKE UP] Caught raw payload: " + message);
        try {
            TransactionRequest request = objectMapper.readValue(message, TransactionRequest.class);
            fraudAuditService.executeAiAudit(request);
        } catch (Exception e) {
            System.err.println("CRITICAL: Redis parsing failed: " + e.getMessage());
        }
    }
}