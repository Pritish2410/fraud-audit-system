package com.enterprise.fraudauditengine.repository;

import com.enterprise.fraudauditengine.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Spring Data JPA magic: automatically writes the SQL query to find an admin by their email
    Optional<User> findByEmail(String email);
}