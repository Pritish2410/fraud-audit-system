package com.enterprise.fraudauditengine.controller;

import com.enterprise.fraudauditengine.service.FraudAuditService;
import com.enterprise.fraudauditengine.dto.TransactionRequest;
import com.enterprise.fraudauditengine.service.FraudScoringService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:5173", "https://fraud-audit-dashboard.vercel.app/"})
@RestController
@RequestMapping("/api/v1/audit")
public class FraudDetectionController {

    private final FraudScoringService scoringService;
    private final FraudAuditService auditService; 

    @Value("${csv.aliases.account}")
    private String[] accountAliases;

    @Value("${csv.aliases.amount}")
    private String[] amountAliases;

    @Value("${csv.aliases.category}")
    private String[] categoryAliases;

    @Value("${csv.aliases.location}")
    private String[] locationAliases;

    public FraudDetectionController(FraudScoringService scoringService, FraudAuditService auditService) {
        this.scoringService = scoringService;
        this.auditService = auditService;
    }

    @GetMapping("/report")
    public ResponseEntity<Map<String, String>> getLatestReport() {
        Map<String, String> response = new HashMap<>();
        response.put("report", auditService.getLatestReport());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/trigger")
    public ResponseEntity<String> triggerFraudProtocol(@RequestBody TransactionRequest request) {
        try {
            String decision = scoringService.evaluateTransaction(request);
            return ResponseEntity.ok(decision);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("CRITICAL ERROR");
        }
    }

    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> processBatchUpload(@RequestParam("file") MultipartFile file) {
        System.out.println("\n=> [SERVER] File Received! Starting Dynamic YAML Synchronous processing...");
        
        Map<String, Object> response = new HashMap<>();
        int totalProcessed = 0;
        int totalIsolated = 0;

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String headerLine = br.readLine();
            if (headerLine == null) throw new RuntimeException("The uploaded CSV file is empty.");
            
            String[] headers = headerLine.toLowerCase().split(",");
            
            int accountIdx = findColumnIndex(headers, accountAliases);
            int amountIdx = findColumnIndex(headers, amountAliases);
            int categoryIdx = findColumnIndex(headers, categoryAliases);
            int locationIdx = findColumnIndex(headers, locationAliases);

            if (accountIdx == -1 || amountIdx == -1) {
                throw new RuntimeException("Could not detect required 'Account' or 'Amount' columns in the CSV header.");
            }

            System.out.println("=> [MAPPING] Account Col: " + accountIdx + " | Amount Col: " + amountIdx);

            String line;
            while ((line = br.readLine()) != null) {
                String[] data = line.split(",");
                int maxRequiredIndex = Math.max(Math.max(accountIdx, amountIdx), Math.max(categoryIdx, locationIdx));
                if (data.length <= maxRequiredIndex) continue;

                TransactionRequest request = new TransactionRequest();
                
                try {
                    request.setAccountId(data[accountIdx].trim()); 
                    request.setAmount(Double.parseDouble(data[amountIdx].trim())); 
                    request.setMerchantCategory(categoryIdx != -1 ? data[categoryIdx].trim() : "UNKNOWN"); 
                    request.setLocation(locationIdx != -1 ? data[locationIdx].trim() : "UNKNOWN"); 
                } catch (NumberFormatException e) {
                    continue; 
                }

                if (scoringService.evaluateTransaction(request).equals("ACCOUNT_ISOLATED")) {
                    totalIsolated++;
                }
                totalProcessed++;
            }
            
            System.out.println("=> [SERVER] Processing complete! Triggering AI Report...");
            auditService.generateBatchReport(totalProcessed, totalIsolated);

            response.put("status", "SUCCESS");
            response.put("totalProcessed", totalProcessed);
            response.put("anomaliesDetected", totalIsolated);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("=> [SERVER] ERROR: " + e.getMessage());
            response.put("status", "ERROR");
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private int findColumnIndex(String[] headers, String[] aliases) {
        for (int i = 0; i < headers.length; i++) {
            String cleanHeader = headers[i].trim().replaceAll("[\"']", ""); 
            for (String alias : aliases) {
                if (cleanHeader.contains(alias.trim().toLowerCase())) {
                    return i;
                }
            }
        }
        return -1; 
    }
}