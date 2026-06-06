package com.enterprise.fraudauditengine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(exclude = {
    org.springframework.cloud.function.context.config.ContextFunctionCatalogAutoConfiguration.class
})
@EnableAsync
public class FraudAuditEngineApplication {

    public static void main(String[] args) {
        SpringApplication.run(FraudAuditEngineApplication.class, args);
    }
}