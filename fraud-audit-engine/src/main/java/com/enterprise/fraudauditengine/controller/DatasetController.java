package com.enterprise.fraudauditengine.controller;

import com.enterprise.fraudauditengine.dto.TransactionRequest;
import com.enterprise.fraudauditengine.service.StorageService;
import com.enterprise.fraudauditengine.service.FraudAuditService;
import com.enterprise.fraudauditengine.service.FraudScoringService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/datasets")
@CrossOrigin(origins = "http://localhost:5173")
public class DatasetController {

    private final StorageService storageService;
    private final FraudAuditService fraudAuditService;
    private final FraudScoringService fraudScoringService;

    public DatasetController(StorageService storageService, FraudAuditService fraudAuditService, FraudScoringService fraudScoringService) {
        this.storageService = storageService;
        this.fraudAuditService = fraudAuditService;
        this.fraudScoringService = fraudScoringService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadAndProcess(@RequestParam("file") MultipartFile file) throws IOException {
        
        File tempFile = File.createTempFile("vault_dataset_", ".csv");
        file.transferTo(tempFile);

        try {
            int totalProcessed = 0;
            int anomalies = 0;

            try (BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(tempFile)))) {
                String headerLine = br.readLine();
                if (headerLine != null) {
                    // Normalize headers
                    String[] headers = headerLine.toLowerCase().replace("\"", "").split(",");
                    int accIdx = -1, amtIdx = -1, catIdx = -1, locIdx = -1, fraudIdx = -1;
                    
                    // Smart Column Discovery
                    for (int i = 0; i < headers.length; i++) {
                        if (headers[i].contains("accountid") || headers[i].contains("nameorig")) accIdx = i;
                        if (headers[i].contains("amount")) amtIdx = i;
                        if (headers[i].contains("merchantcategory") || headers[i].contains("type")) catIdx = i;
                        if (headers[i].contains("location")) locIdx = i;
                        if (headers[i].contains("fraud")) fraudIdx = i;
                    }

                    String line;
                    while ((line = br.readLine()) != null) {
                        if (line.trim().isEmpty()) continue;
                        totalProcessed++;
                        
                        String[] cols = line.replace("\"", "").split(",");
                        boolean isThreat = false;
                        
                        // Scenario 1: The Kaggle Dataset (Pre-labeled fraud column)
                        if (fraudIdx != -1 && cols.length > fraudIdx) {
                            if ("1".equals(cols[fraudIdx].trim())) {
                                isThreat = true;
                            }
                        } 
                        // Scenario 2: Unlabeled Data (Run it through your Math Brain!)
                        else {
                            TransactionRequest req = new TransactionRequest();
                            req.setBatch(true); // <-- TELLS THE ENGINE TO SKIP VELOCITY TRAP
                            req.setAccountId(accIdx != -1 && cols.length > accIdx ? cols[accIdx].trim() : "UNKNOWN_ACC");
                            
                            try {
                                req.setAmount(amtIdx != -1 && cols.length > amtIdx ? Double.parseDouble(cols[amtIdx].trim()) : 0.0);
                            } catch (NumberFormatException e) { req.setAmount(0.0); }
                            
                            req.setMerchantCategory(catIdx != -1 && cols.length > catIdx ? cols[catIdx].trim() : "UNKNOWN_CAT");
                            req.setLocation(locIdx != -1 && cols.length > locIdx ? cols[locIdx].trim() : "UNKNOWN_LOC");

                            // Feed the constructed request into your scoring service
                            String scoreResult = fraudScoringService.evaluateTransaction(req);
                            if ("ACCOUNT_ISOLATED".equals(scoreResult)) {
                                isThreat = true;
                            }
                        }

                        if (isThreat) anomalies++;
                    }
                }
            }

            // SMART ARCHIVE
            if (anomalies > 0) {
                try (FileInputStream s3Stream = new FileInputStream(tempFile)) {
                    storageService.uploadDataset(file.getOriginalFilename(), s3Stream, tempFile.length());
                    System.out.println("=> [VAULT] Anomaly detected! Evidence securely archived to Cloudflare.");
                }
            } else {
                System.out.println("=> [VAULT] Dataset clean. Discarding file to save storage limits.");
            }

            // TRIGGER AI REPORT
            fraudAuditService.generateBatchReport(totalProcessed, anomalies);

            return ResponseEntity.ok(Map.of(
                "totalProcessed", totalProcessed,
                "anomaliesDetected", anomalies,
                "status", "SUCCESS"
            ));

        } finally {
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    @GetMapping("/download/{fileName}")
    public ResponseEntity<StreamingResponseBody> downloadAndDeleteFile(@PathVariable String fileName) {
        
        InputStream s3Stream = storageService.downloadDataset(fileName);

        // Zero-Disk Stream & Burn Protocol
        StreamingResponseBody responseBody = outputStream -> {
            try (s3Stream) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = s3Stream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
                outputStream.flush();
            } finally {
                // Permanently delete after the stream completes
                storageService.deleteDataset(fileName);
                System.out.println("=> [SECURITY] Stream complete. Vault file destroyed.");
            }
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(responseBody);
    }
}