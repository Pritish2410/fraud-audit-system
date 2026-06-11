package com.enterprise.fraudauditengine.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_users") 
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // THE NEW ADDITION
    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; 

    @Column(name = "status")
    private String status = "PENDING";

    private String role = "ROLE_ADMIN";

    private String otp;
    private LocalDateTime otpExpiry;

    @Column(name = "age")
    private Integer age;

    @Column(name = "sex")
    private String sex;

    @Column(name = "dob")
    private String dob;

    @Column(name = "residence")
    private String residence;
    
    @Column(nullable = false)
    private boolean isVerified = false;

    public User() {}

    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getOtp() { return otp; }
    public void setOtp(String otp, LocalDateTime expiry) { 
        this.otp = otp; 
        this.otpExpiry = expiry;
    }

    public LocalDateTime getOtpExpiry() { return otpExpiry; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { this.isVerified = verified; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // --- NEW GETTERS AND SETTERS ---
    
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getResidence() { return residence; }
    public void setResidence(String residence) { this.residence = residence; }
}