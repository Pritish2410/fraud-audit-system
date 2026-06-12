package com.enterprise.fraudauditengine.controller;

import com.enterprise.fraudauditengine.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = {"http://localhost:5173", "https://fraud-audit-dashboard.vercel.app"})
public class UserController {

    private final UserRepository userRepository;
    private final com.enterprise.fraudauditengine.service.EmailService emailService;

    // DYNAMIC EVIDENCE MAP: Links the exact CSV file to the specific user securely in memory
    private final Map<String, String> userEvidenceFiles = new ConcurrentHashMap<>();

    public UserController(UserRepository userRepository, com.enterprise.fraudauditengine.service.EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setStatus("OFFLINE"); 
            userRepository.save(user);
            emailService.sendAccessGrantedEmail(user.getEmail());
            return ResponseEntity.ok(Map.of("message", "Operative cleared."));
        }).orElse(ResponseEntity.badRequest().body(Map.of("error", "Operative not found.")));
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .map(u -> {
                    java.util.Map<String, Object> userMap = new java.util.HashMap<>();
                    userMap.put("id", u.getId());
                    userMap.put("name", u.getName());
                    userMap.put("email", u.getEmail());
                    
                    // DATABASE IS GOD: Direct read from PostgreSQL
                    userMap.put("status", u.getStatus() != null ? u.getStatus() : "OFFLINE");
                    
                    // ATTACH LIVE EVIDENCE FILE
                    userMap.put("evidence", userEvidenceFiles.getOrDefault(u.getEmail(), null));
                    
                    userMap.put("age", u.getAge() != null ? u.getAge() : "CLASSIFIED");
                    userMap.put("sex", u.getSex() != null ? u.getSex() : "CLASSIFIED");
                    userMap.put("dob", u.getDob() != null ? u.getDob() : "CLASSIFIED");
                    userMap.put("residence", u.getResidence() != null ? u.getResidence() : "CLASSIFIED");
                    return userMap;
                })
                .collect(Collectors.toList()));
    }

    // ==========================================
    // BULLETPROOF SYNCHRONIZATION ENDPOINTS
    // ==========================================

    @PostMapping("/lockdown")
    public ResponseEntity<?> triggerLockdown(@RequestBody Map<String, String> payload) {
        // STRICT JSON PAYLOAD: Guarantees Render firewall will not drop the POST request
        String email = payload.get("email");
        String evidence = payload.get("evidence");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email required"));
        }

        if (evidence != null && !evidence.trim().isEmpty()) {
            userEvidenceFiles.put(email, evidence);
        }
        
        return userRepository.findByEmail(email).map(user -> {
            user.setStatus("BLOCKED");
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Node isolated. Global lockdown engaged."));
        }).orElse(ResponseEntity.badRequest().body(Map.of("error", "Operative not found.")));
    }

    @PostMapping("/global-unlock")
    public ResponseEntity<?> globalUnlock() {
        // Destroy the file maps on global unlock to prevent stale cache
        userEvidenceFiles.clear();
        
        List<Object> unlockedCount = userRepository.findAll().stream()
            .filter(u -> "BLOCKED".equals(u.getStatus()))
            .map(u -> {
                u.setStatus("ONLINE");
                userRepository.save(u);
                return u;
            }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "message", "Global override accepted. All nodes unlocked.",
            "nodesRestored", unlockedCount.size()
        ));
    }

    @PutMapping("/email/{email}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String email, @RequestParam String status) {
        return userRepository.findByEmail(email).map(user -> {
            // IMMUTABLE SECURITY CHECK: Prevent users from bypassing a block by logging in/out
            if ("BLOCKED".equals(user.getStatus())) {
                return ResponseEntity.ok(Map.of("message", "Status change rejected. Operative is locked."));
            }
            user.setStatus(status);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Status updated to " + status));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deregisterUser(@PathVariable Long id) {
        return userRepository.findById(id).map(u -> {
            userEvidenceFiles.remove(u.getEmail());
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Operative data wiped."));
        }).orElse(ResponseEntity.badRequest().body(Map.of("error", "Operative not found.")));
    }
    
    @DeleteMapping("/email/{email}")
    public ResponseEntity<?> deregisterSelf(@PathVariable String email) {
        return userRepository.findByEmail(email).map(user -> {
            userEvidenceFiles.remove(email);
            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "Your data has been permanently wiped from the system."));
        }).orElseGet(() -> ResponseEntity.badRequest().body(Map.of("error", "Operative not found.")));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        return userRepository.findByEmail(email).map(u -> {
            java.util.Map<String, Object> userMap = new java.util.HashMap<>();
            userMap.put("id", u.getId());
            userMap.put("name", u.getName());
            userMap.put("email", u.getEmail());
            
            // Database is God
            userMap.put("status", u.getStatus() != null ? u.getStatus() : "OFFLINE");
            return ResponseEntity.ok(userMap);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/email/{email}/details")
    public ResponseEntity<?> updateUserDetails(@PathVariable String email, @RequestBody Map<String, Object> updates) {
        return userRepository.findByEmail(email).map(user -> {
            if (updates.containsKey("age") && !updates.get("age").toString().isEmpty()) user.setAge(Integer.parseInt(updates.get("age").toString()));
            if (updates.containsKey("sex")) user.setSex(updates.get("sex").toString());
            if (updates.containsKey("dob")) user.setDob(updates.get("dob").toString());
            if (updates.containsKey("residence")) user.setResidence(updates.get("residence").toString());
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Operative intelligence updated."));
        }).orElse(ResponseEntity.badRequest().body(Map.of("error", "User not found.")));
    }
}