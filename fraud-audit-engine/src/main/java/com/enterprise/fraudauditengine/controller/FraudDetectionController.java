package com.enterprise.fraudauditengine.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import com.enterprise.fraudauditengine.redis.FraudProducer;
/**
 * REST Controller exposing the Redis Event Stream to external clients.
 */
@RestController
@RequestMapping("/api/v1/audit")
@CrossOrigin(origins = "http://localhost:5173") // Crucial: Allows your Vite React app to connect
public class FraudDetectionController {

    private final FraudProducer fraudProducer;

    // Pro-standard constructor injection
    public FraudDetectionController(FraudProducer fraudProducer) {
        this.fraudProducer = fraudProducer;
    }

    /**
     * Endpoint to trigger the high-velocity fraud event into the Redis stream.
     * URL: POST http://localhost:8080/api/v1/audit/trigger
     */
    @PostMapping("/trigger")
    public ResponseEntity<String> triggerFraudProtocol() {
        try {
            // Instantly push the event to Redis and return success to the UI
            fraudProducer.streamBlockedAccount("WAYNE_ENT_001");
            return ResponseEntity.ok("ACCOUNT_ISOLATED");
            
        } catch (Exception e) {
            // Enterprise standard error handling
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("CRITICAL ERROR: Redis stream failed to process the request. Reason: " + e.getMessage());
        }
    }
}