package com.enterprise.fraudauditengine.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

/**
 * Service layer optimized for asynchronous, background AI forensic auditing.
 */
@Service
public class FraudAuditService {

    private final ChatClient chatClient;

    // Pro-standard constructor injection
    public FraudAuditService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    /**
     * Executes the AI forensic audit in the background.
     * This is designed to be called by the Kafka Consumer event loop.
     * NOTE: Signature is now 'void' because event-driven consumption is asynchronous.
     */
    public void executeAiAudit() {
        // High-end Forensic Prompt Optimization
        String prompt = "You are an elite financial forensic cyber-intelligence AI. " +
                        "An account isolation protocol just fired for 'WAYNE_ENT_001'. " +
                        "A critical high-velocity transaction spike was detected: Initial charge: $100.00 followed by " +
                        "a massive $500.00 charge 120 seconds later at an ELECTRONICS merchant category. " +
                        "Analyze this sequence. Identify potential automated exploitation vectors like 'Carding' or 'Account Takeover (ATO)'. " +
                        "Output a strictly structured, dense executive forensic summary in Markdown format, prioritizing " +
                        "technical threat indicators.";

        try {
            System.out.println("=> [KAFKA EVENT CAUGHT] Initializing Gemini 2.5 Flash Background Audit...");
            
            // Execute the AI call on the current background thread
            String report = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            // Output report directly to backend terminal for verification
            System.out.println("\n====== GEMINI FORENSIC INTELLIGENCE REPORT ======\n");
            System.out.println(report);
            System.out.println("\n================================================\n");
            
            // Future Phase 3 Step: Save 'report' string to SQL DB via repository.
            
        } catch (Exception e) {
            System.err.println("CRITICAL: Gemini AI Communication Failure: " + e.getMessage());
        }
    }
}