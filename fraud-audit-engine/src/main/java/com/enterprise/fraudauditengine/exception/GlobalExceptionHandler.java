package com.enterprise.fraudauditengine.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(S3Exception.class)
    public ResponseEntity<?> handleS3Exceptions(S3Exception ex) {
        System.err.println("=> [CLOUDFLARE R2 FAULT] " + ex.getMessage());
        return ResponseEntity.status(502).body(Map.of("error", "Cloudflare Storage Timeout. Network congested."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception ex) {
        System.err.println("=> [SYSTEM FAULT] " + ex.getMessage());
        return ResponseEntity.status(500).body(Map.of("error", "Server fault: " + ex.getMessage()));
    }
}