package com.enterprise.fraudauditengine.repository;

import java.util.*;
import org.springframework.jdbc.core.simple.*;
import org.springframework.stereotype.*;
import com.enterprise.fraudauditengine.dto.*;

/**
 * Repository dedicated strictly to Data Access operations for Fraud Detection.
 * We use JdbcClient for clean, fluent SQL execution directly against MS SQL Server.
 */
@Repository
public class FraudDetectionRepository {

    private final JdbcClient jdbcClient;

    // Constructor Injection (Pro-standard over @Autowired)
    public FraudDetectionRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    /**
     * Executes an advanced CTE with Window Functions to find velocity fraud.
     * Returns a list of anomalies if a transaction doubles in amount within 5 minutes.
     */
    public List<TransactionAnomaly> findVelocityAnomalies() {
        
        // We write native SQL to push the heavy lifting to the database server.
        // SQL Server handles NULLs safely (the first transaction has no 'prevAmount').
        String advancedSql = """
            WITH TimeDeltaCTE AS (
                SELECT 
                    t.account_id AS accountId,
                    a.company_name AS companyName,
                    t.amount AS amount,
                    t.transaction_time AS transactionTime,
                    t.merchant_category AS merchantCategory,
                    LAG(t.amount, 1) OVER (PARTITION BY t.account_id ORDER BY t.transaction_time) AS prevAmount,
                    DATEDIFF(MINUTE, LAG(t.transaction_time, 1) OVER (PARTITION BY t.account_id ORDER BY t.transaction_time), t.transaction_time) AS timeDiffMins
                FROM transactions t
                JOIN accounts a ON t.account_id = a.account_id
            )
            SELECT * FROM TimeDeltaCTE
            WHERE timeDiffMins <= 5 AND amount >= (prevAmount * 2);
        """;

        // Execute the query and automatically map the rows to our Java 21 Record
        return jdbcClient.sql(advancedSql)
                .query(TransactionAnomaly.class)
                .list();
    }
}