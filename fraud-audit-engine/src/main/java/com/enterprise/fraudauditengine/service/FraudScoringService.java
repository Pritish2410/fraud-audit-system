package com.enterprise.fraudauditengine.service;

import com.enterprise.fraudauditengine.dto.TransactionRequest;
import com.enterprise.fraudauditengine.redis.FraudProducer;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FraudScoringService {

    private final FraudProducer fraudProducer;
    private final Map<String, List<Long>> transactionMemory = new ConcurrentHashMap<>();
    private final Map<String, AccountProfile> profileDatabase = new ConcurrentHashMap<>();
    private static final long TIME_WINDOW_MS = 60000;

    public FraudScoringService(FraudProducer fraudProducer) {
        this.fraudProducer = fraudProducer;
        // Mock baselines for the POC
        profileDatabase.put("WAYNE_ENT_001", new AccountProfile("GOTHAM_CITY_IP", 250.0));
        profileDatabase.put("STARK_IND_001", new AccountProfile("India", 5000.0));
    }

    // The core evaluation engine
    public String evaluateTransaction(TransactionRequest request) {
        String accountId = request.getAccountId();
        long currentTime = System.currentTimeMillis();

        AccountProfile profile = profileDatabase.getOrDefault(accountId, new AccountProfile(request.getLocation(), 100.0));

        transactionMemory.putIfAbsent(accountId, new ArrayList<>());
        List<Long> history = transactionMemory.get(accountId);
        history.removeIf(timestamp -> (currentTime - timestamp) > TIME_WINDOW_MS);
        history.add(currentTime);

        int riskScore = 0;

        double spendingMultiplier = request.getAmount() / profile.getAverageTransactionValue();
        if (spendingMultiplier > 3.0 && spendingMultiplier <= 10.0) riskScore += 30;
        if (spendingMultiplier > 10.0) riskScore += 50;

        String category = request.getMerchantCategory().toUpperCase();
        if (category.equals("ELECTRONICS") || category.equals("CRYPTO_EXCHANGE")) riskScore += 25;

        if (!request.getLocation().equalsIgnoreCase(profile.getPrimaryLocation())) {
            riskScore += 45; 
        }

        if (!request.isBatch() && history.size() >= 3) {
            riskScore += 25; 
        }

        if (riskScore >= 85) {
            System.out.println("🚨 BATCH ANOMALY | Account: " + accountId + " | Score: " + riskScore + " | Isolating...");
            history.clear(); // Reset memory after block
            fraudProducer.streamBlockedAccount(request);
            return "ACCOUNT_ISOLATED";
        } else {
            return "ACTIVE";
        }
    }

    static class AccountProfile {
        private final String primaryLocation;
        private final double averageTransactionValue;

        public AccountProfile(String primaryLocation, double averageTransactionValue) {
            this.primaryLocation = primaryLocation;
            this.averageTransactionValue = averageTransactionValue;
        }
        public String getPrimaryLocation() { return primaryLocation; }
        public double getAverageTransactionValue() { return averageTransactionValue; }
    }
}