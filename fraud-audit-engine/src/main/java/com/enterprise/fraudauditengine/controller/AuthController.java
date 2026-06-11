package com.enterprise.fraudauditengine.controller;

import com.enterprise.fraudauditengine.model.User;
import com.enterprise.fraudauditengine.repository.UserRepository;
import com.enterprise.fraudauditengine.security.JwtUtil;
import com.enterprise.fraudauditengine.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = {"http://localhost:5173", "https://fraud-audit-dashboard.vercel.app"})
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String email = (String) request.get("email");
        String rawPassword = (String) request.get("password");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use."));
        }

        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(rawPassword));

        // BULLETPROOF EXTRACTION: Safely casts any incoming JSON data type
        if (request.get("age") != null && !request.get("age").toString().isEmpty()) {
            newUser.setAge(Integer.parseInt(request.get("age").toString()));
        }
        if (request.get("sex") != null) {
            newUser.setSex(request.get("sex").toString());
        }
        if (request.get("dob") != null) {
            newUser.setDob(request.get("dob").toString());
        }
        if (request.get("residence") != null) {
            newUser.setResidence(request.get("residence").toString());
        }

        userRepository.save(newUser);
        return ResponseEntity.ok(Map.of("message", "Registration successful. You can now log in."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String rawPassword = request.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty() || !passwordEncoder.matches(rawPassword, userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password."));
        }

        User user = userOpt.get();

        if ("PENDING".equals(user.getStatus())) {
            return ResponseEntity.status(403).body(Map.of("error", "Clearance Pending: Your account is awaiting Admin approval."));
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        
        user.setOtp(otp, LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);

        return ResponseEntity.ok(Map.of("message", "OTP sent to your email."));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found."));
        }

        User user = userOpt.get();

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid OTP."));
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(401).body(Map.of("error", "OTP has expired. Please log in again."));
        }

        user.setOtp(null, null);
        user.setVerified(true);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());

        user.setStatus("ONLINE");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "message", "Verification successful. Welcome to the dashboard."
        ));
    }

    @PostMapping("/logout/{email}")
    public ResponseEntity<?> logout(@PathVariable String email) {
        return userRepository.findByEmail(email).map(user -> {
            user.setStatus("OFFLINE");
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Status set to OFFLINE"));
        }).orElse(ResponseEntity.badRequest().body(Map.of("error", "User not found")));
    }
}