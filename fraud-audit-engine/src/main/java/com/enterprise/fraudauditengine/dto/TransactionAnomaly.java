package com.enterprise.fraudauditengine.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A lightweight, immutable Record to carry flagged transaction anomalies 
 * from the SQL Server Window Function directly to the Spring AI Service.
 */
public record TransactionAnomaly(
    int accountId,
    String companyName,
    BigDecimal amount,
    LocalDateTime transactionTime,
    String merchantCategory,
    BigDecimal prevAmount,
    int timeDiffMins
) {}