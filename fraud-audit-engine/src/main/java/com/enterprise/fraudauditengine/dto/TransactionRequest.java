package com.enterprise.fraudauditengine.dto;

public class TransactionRequest {
    private String accountId;
    private double amount;
    private String merchantCategory;
    private String location;
    private boolean isBatch; // The new property to prevent velocity misfires

    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getMerchantCategory() { return merchantCategory; }
    public void setMerchantCategory(String merchantCategory) { this.merchantCategory = merchantCategory; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public boolean isBatch() { return isBatch; }
    public void setBatch(boolean batch) { isBatch = batch; }
}