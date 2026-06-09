package com.enterprise.fraudauditengine.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("System Authorization - Your OTP");
        message.setText("Your secure login OTP is: " + otp + "\n\nThis code expires in 10 minutes. Do not share it with anyone.");
        mailSender.send(message);
    }
}