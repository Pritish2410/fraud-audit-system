package com.enterprise.fraudauditengine.controller;

import com.enterprise.fraudauditengine.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = {"http://localhost:5173", "https://fraud-audit-dashboard.vercel.app"})
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Admin God-Eye View: Fetches all users with full parameters safely
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .map(u -> {
                    java.util.Map<String, Object> userMap = new java.util.HashMap<>();
                    userMap.put("id", u.getId());
                    userMap.put("name", u.getName());
                    userMap.put("email", u.getEmail());
                    userMap.put("status", u.getStatus() != null ? u.getStatus() : "OFFLINE");
                    userMap.put("age", u.getAge() != null ? u.getAge() : "CLASSIFIED");
                    userMap.put("sex", u.getSex() != null ? u.getSex() : "CLASSIFIED");
                    userMap.put("dob", u.getDob() != null ? u.getDob() : "CLASSIFIED");
                    userMap.put("residence", u.getResidence() != null ? u.getResidence() : "CLASSIFIED");
                    return userMap;
                })
                .collect(Collectors.toList()));
    }

    // Admin Wipe: Deletes a specific user by their database ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deregisterUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Operative not found."));
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Operative data completely wiped from the master node."));
    }
    
    // Self Wipe: Allows an operative to delete their own account using their email
    @DeleteMapping("/email/{email}")
    public ResponseEntity<?> deregisterSelf(@PathVariable String email) {
        return userRepository.findByEmail(email).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "Your data has been permanently wiped from the system."));
        }).orElseGet(() -> ResponseEntity.badRequest().body(Map.of("error", "Operative not found.")));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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