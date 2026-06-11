package com.enterprise.fraudauditengine.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        sendEmail(toEmail, "System Authorization - Your OTP", 
            "Your secure login OTP is: " + otp + "\n\nThis code expires in 10 minutes. Do not share it with anyone.");
    }

    public void sendAccessGrantedEmail(String toEmail) {
        sendEmail(toEmail, "WAYNE ENTERPRISES - Clearance Granted", 
            "Your identity has been verified by the Admin node. You are now cleared to request an OTP and access the dashboard.");
    }

    private void sendEmail(String toEmail, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false);
            
            helper.setFrom(fromEmail, "Wayne Enterprises");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body);
            
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("=> [COMM LINK FAILED] " + e.getMessage());
        }
    }
}