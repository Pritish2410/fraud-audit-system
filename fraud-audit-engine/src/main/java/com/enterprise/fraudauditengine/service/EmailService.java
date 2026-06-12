package com.enterprise.fraudauditengine.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.sender.address:onboarding@resend.dev}")
    private String senderAddress;

    @Value("${app.mail.sender.name:Wayne Enterprises}")
    private String senderName;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        System.out.println("=> [ENCRYPTED COMM] OTP for " + toEmail + " is: " + otp);
        sendEmail(toEmail, "System Authorization - Your OTP", 
            "Your secure login OTP is: " + otp + "\n\nThis code expires in 10 minutes. Do not share it with anyone.");
    }

    @Async
    public void sendAccessGrantedEmail(String toEmail) {
        sendEmail(toEmail, "WAYNE ENTERPRISES - Clearance Granted", 
            "Your identity has been verified by the Admin node. You are now cleared to request an OTP and access the dashboard.");
    }

    @Async
    private void sendEmail(String toEmail, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false);
            
            helper.setFrom(senderAddress, senderName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body);
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("=> [COMM LINK FAILED] " + e.getMessage());
        }
    }
}