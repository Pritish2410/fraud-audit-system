package com.enterprise.fraudauditengine.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import com.enterprise.fraudauditengine.dto.TransactionRequest;

import java.util.concurrent.atomic.AtomicInteger;

@Service
public class FraudAuditService {

    private final ChatClient chatClient;
    private volatile String latestReport = "Awaiting anomaly detection..."; 

    @Value("${gemini.circuit-breaker.cooldown-ms:120000}")
    private long baseCooldownMs; 
    
    @Value("${gemini.circuit-breaker.max-retries:2}")
    private int maxFailures;

    private volatile long circuitOpenUntil = 0;
    private final AtomicInteger consecutiveFailures = new AtomicInteger(0);

    public FraudAuditService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String getLatestReport() {
        return latestReport;
    }

    @Async
    public void generateBatchReport(int totalProcessed, int totalIsolated) {
        if (System.currentTimeMillis() < circuitOpenUntil) {
            long remainingSecs = (circuitOpenUntil - System.currentTimeMillis()) / 1000;
            this.latestReport = "## BATCH ANALYSIS COMPLETE\n\n* Total Processed: " + totalProcessed + 
                                "\n* Anomalies Detected: " + totalIsolated + 
                                "\n\n*(Note: AI offline. Circuit breaker open for " + remainingSecs + " more seconds)*";
            return;
        }

        String batchPrompt = String.format(
            "You are a Lead Forensic Auditor. Write a brief executive summary report for a batch data analysis. " +
            "Use markdown headings: '## BATCH SUMMARY', '## METRICS', '## RECOMMENDATION'. " +
            "Use bullet points. Data: Processed %d total transactions. Isolated %d high-risk anomalies.", 
            totalProcessed, totalIsolated
        );
        
        try {
            this.latestReport = chatClient.prompt().user(batchPrompt).call().content();
            consecutiveFailures.set(0); 
        } catch (Exception e) {
            System.err.println("Gemini API Error in Batch Report:");
            e.printStackTrace(); // Logs the error silently in terminal
            handleApiFailure(e);
            this.latestReport = "## BATCH ANALYSIS COMPLETE\n\n* Total Processed: " + totalProcessed + 
                                "\n* Anomalies Detected: " + totalIsolated + 
                                "\n\n*(Note: AI summary offline due to API rate limits. Showing raw data instead.)*";
        }
    }

    @Async
    public void executeAiAudit(TransactionRequest request) {
        if (System.currentTimeMillis() < circuitOpenUntil) {
            this.latestReport = "## SYSTEM LOCKED\n\n*(AI offline. Circuit breaker actively preventing API calls)*";
            return;
        }

        this.latestReport = "System locked. Gemini AI analyzing threat vectors...";

        String prompt = String.format(
            "You are a senior financial forensic analyst explaining a threat to a beginner analyst. " +
            "An isolation protocol fired for account '%s'. " +
            "Anomaly: A charge of $%.2f was attempted at a '%s' merchant, originating from IP location: '%s'. " +
            "RULES: Use markdown headings: '## EXECUTIVE SUMMARY', '## THREAT INDICATORS', '## EXPLOITATION VECTORS', '## RECOMMENDED ACTIONS'.",
            request.getAccountId(), request.getAmount(), request.getMerchantCategory(), request.getLocation()
        );

        try {
            this.latestReport = chatClient.prompt().user(prompt).call().content();
            consecutiveFailures.set(0); 
        } catch (Exception e) {
            System.err.println("Gemini API Error in Individual Audit:");
            e.printStackTrace(); // Logs the error silently in terminal
            handleApiFailure(e);
            this.latestReport = "## SYSTEM ERROR: FORENSIC ENGINE OFFLINE\n\n" +
                                "**Error Code:** 429/503 (API Limit or High Demand)\n\n" +
                                "* Threat isolated, but AI report generation failed. Circuit Breaker activated.";
        }
    }

    private void handleApiFailure(Exception e) {
        if (e.getMessage() != null && (e.getMessage().contains("503") || e.getMessage().contains("429"))) {
            int failures = consecutiveFailures.incrementAndGet();
            if (failures >= maxFailures) {
                long dynamicWait = baseCooldownMs * (long) Math.pow(2, failures - maxFailures);
                circuitOpenUntil = System.currentTimeMillis() + dynamicWait;
                System.err.println("\n🦇 [CIRCUIT BREAKER OPEN] API Overloaded. Halting AI calls for " + (dynamicWait / 1000) + " seconds.");
            }
        }
    }
}