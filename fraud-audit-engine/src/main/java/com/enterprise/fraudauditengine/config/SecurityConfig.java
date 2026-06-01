package com.enterprise.fraudauditengine.config;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.*;
import org.springframework.security.web.*;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for local testing
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // TEMPORARY: Allow all traffic without a password
            );
        return http.build();
    }
}