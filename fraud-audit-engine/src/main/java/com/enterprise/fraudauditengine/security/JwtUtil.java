package com.enterprise.fraudauditengine.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    // Pulls the secret key we hid inside your application.yaml earlier
    @Value("${security.jwt.secret-key}")
    private String secretString;

    // Pulls the 24-hour expiration time
    @Value("${security.jwt.expiration-time}")
    private long jwtExpiration;

    // Converts your string secret into a cryptographic key
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretString.getBytes());
    }

    // Prints the VIP Wristband
    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    // Reads the name on the wristband
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Checks if the wristband is fake or expired
    public boolean isTokenValid(String token) {
        try {
            return !extractAllClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return false; // If someone tampered with the token, it instantly fails
        }
    }

    // The core cryptographic parser
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}