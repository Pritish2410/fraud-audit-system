package com.enterprise.fraudauditengine.controller;

import com.enterprise.fraudauditengine.dto.TransactionRequest;
import com.enterprise.fraudauditengine.service.StorageService;
import com.enterprise.fraudauditengine.service.FraudAuditService;
import com.enterprise.fraudauditengine.service.FraudScoringService;

import org.apache.poi.ss.usermodel.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/datasets")
@CrossOrigin(origins = {"http://localhost:5173", "https://fraud-audit-dashboard.vercel.app"})
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
        
        String originalFilename = file.getOriginalFilename();
        boolean isExcel = originalFilename != null && originalFilename.endsWith(".xlsx");
        
        // Use a generic tmp suffix, we rely on the logic check instead of extension
        File tempFile = File.createTempFile("vault_dataset_", isExcel ? ".xlsx" : ".csv");
        file.transferTo(tempFile);

        try {
            int totalProcessed = 0;
            int anomalies = 0;

            if (isExcel) {
                // ==========================================
                // EXCEL PARSING LOGIC USING APACHE POI
                // ==========================================
                try (InputStream is = new FileInputStream(tempFile);
                     Workbook workbook = WorkbookFactory.create(is)) {
                     
                    Sheet sheet = workbook.getSheetAt(0);
                    int accIdx = -1, amtIdx = -1, catIdx = -1, locIdx = -1, fraudIdx = -1;
                    
                    // Iterate through rows
                    for (Row row : sheet) {
                        if (row.getRowNum() == 0) {
                            // Smart Column Discovery for Excel Header
                            for (Cell cell : row) {
                                String header = cell.toString().toLowerCase().trim();
                                if (header.contains("accountid") || header.contains("nameorig")) accIdx = cell.getColumnIndex();
                                if (header.contains("amount")) amtIdx = cell.getColumnIndex();
                                if (header.contains("merchantcategory") || header.contains("type")) catIdx = cell.getColumnIndex();
                                if (header.contains("location")) locIdx = cell.getColumnIndex();
                                if (header.contains("fraud")) fraudIdx = cell.getColumnIndex();
                            }
                            continue; // Skip processing the header row further
                        }

                        totalProcessed++;
                        boolean isThreat = false;
                        
                        // Scenario 1: The Kaggle Dataset (Pre-labeled fraud column)
                        if (fraudIdx != -1 && row.getCell(fraudIdx) != null) {
                            String fraudVal = row.getCell(fraudIdx).toString().trim();
                            // POI might read 1 as 1.0
                            if ("1".equals(fraudVal) || "1.0".equals(fraudVal)) {
                                isThreat = true;
                            }
                        } 
                        // Scenario 2: Unlabeled Data
                        else {
                            TransactionRequest req = new TransactionRequest();
                            req.setBatch(true);
                            
                            req.setAccountId(accIdx != -1 && row.getCell(accIdx) != null ? row.getCell(accIdx).toString().trim() : "UNKNOWN_ACC");
                            
                            try {
                                if (amtIdx != -1 && row.getCell(amtIdx) != null) {
                                    // Excel stores numbers natively, POI reads them as numeric cells
                                    req.setAmount(row.getCell(amtIdx).getNumericCellValue());
                                } else {
                                    req.setAmount(0.0);
                                }
                            } catch (Exception e) { req.setAmount(0.0); }
                            
                            req.setMerchantCategory(catIdx != -1 && row.getCell(catIdx) != null ? row.getCell(catIdx).toString().trim() : "UNKNOWN_CAT");
                            req.setLocation(locIdx != -1 && row.getCell(locIdx) != null ? row.getCell(locIdx).toString().trim() : "UNKNOWN_LOC");

                            String scoreResult = fraudScoringService.evaluateTransaction(req);
                            if ("ACCOUNT_ISOLATED".equals(scoreResult)) {
                                isThreat = true;
                            }
                        }

                        if (isThreat) anomalies++;
                    }
                }
            } else {
                // ==========================================
                // CSV PARSING LOGIC
                // ==========================================
                try (BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(tempFile)))) {
                    String headerLine = br.readLine();
                    if (headerLine != null) {
                        String[] headers = headerLine.toLowerCase().replace("\"", "").split(",");
                        int accIdx = -1, amtIdx = -1, catIdx = -1, locIdx = -1, fraudIdx = -1;
                        
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
                            
                            if (fraudIdx != -1 && cols.length > fraudIdx) {
                                if ("1".equals(cols[fraudIdx].trim())) {
                                    isThreat = true;
                                }
                            } 
                            else {
                                TransactionRequest req = new TransactionRequest();
                                req.setBatch(true);
                                req.setAccountId(accIdx != -1 && cols.length > accIdx ? cols[accIdx].trim() : "UNKNOWN_ACC");
                                
                                try {
                                    req.setAmount(amtIdx != -1 && cols.length > amtIdx ? Double.parseDouble(cols[amtIdx].trim()) : 0.0);
                                } catch (NumberFormatException e) { req.setAmount(0.0); }
                                
                                req.setMerchantCategory(catIdx != -1 && cols.length > catIdx ? cols[catIdx].trim() : "UNKNOWN_CAT");
                                req.setLocation(locIdx != -1 && cols.length > locIdx ? cols[locIdx].trim() : "UNKNOWN_LOC");

                                String scoreResult = fraudScoringService.evaluateTransaction(req);
                                if ("ACCOUNT_ISOLATED".equals(scoreResult)) {
                                    isThreat = true;
                                }
                            }

                            if (isThreat) anomalies++;
                        }
                    }
                }
            }

            // SMART ARCHIVE
            if (anomalies > 0) {
                try (FileInputStream s3Stream = new FileInputStream(tempFile)) {
                    System.out.println("=> [VAULT] Attempting to archive " + (tempFile.length() / 1024 / 1024) + "MB evidence file to R2...");
                    storageService.uploadDataset(file.getOriginalFilename(), s3Stream, tempFile.length());
                    System.out.println("=> [VAULT] Evidence securely archived to Cloudflare.");
                } catch (Exception e) {
                    System.err.println("=> [VAULT WARNING] Cloudflare R2 Upload Failed (Timeout/Size Limit): " + e.getMessage());
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
        
        // Determine correct content type based on extension
        String mediaType = fileName.endsWith(".xlsx") 
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                : "text/csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType(mediaType))
                .body(responseBody);
    }
}