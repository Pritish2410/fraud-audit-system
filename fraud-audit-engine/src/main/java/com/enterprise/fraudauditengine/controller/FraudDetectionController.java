package com.enterprise.fraudauditengine.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import com.enterprise.fraudauditengine.redis.FraudProducer;

/**
 * REST Controller exposing the Redis Event Stream to external clients.
 */
@RestController
@RequestMapping("/api/v1/audit")
@CrossOrigin(origins = "*") // The VIP list is now open to the public internet!
public class FraudDetectionController {

    private final FraudProducer fraudProducer;

    public FraudDetectionController(FraudProducer fraudProducer) {
        this.fraudProducer = fraudProducer;
    }
    
    @PostMapping("/trigger")
    public ResponseEntity<String> triggerFraudProtocol() {
        try {
            fraudProducer.streamBlockedAccount("WAYNE_ENT_001");
            return ResponseEntity.ok("ACCOUNT_ISOLATED");
            
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("CRITICAL ERROR: Redis stream failed to process the request. Reason: " + e.getMessage());
        }
    }
}