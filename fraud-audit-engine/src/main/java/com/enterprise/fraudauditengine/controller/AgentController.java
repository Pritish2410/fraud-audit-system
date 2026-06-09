package com.enterprise.fraudauditengine.controller;

import com.enterprise.fraudauditengine.model.Agent;
import com.enterprise.fraudauditengine.repository.AgentRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agents")
@CrossOrigin(origins = {"http://localhost:5173", "https://fraud-audit-dashboard.vercel.app"})
public class AgentController {

    private final AgentRepository agentRepository;

    public AgentController(AgentRepository agentRepository) {
        this.agentRepository = agentRepository;
    }

    // Injects initial data into your Neon DB so the frontend has something to display
    @PostConstruct
    public void seedDatabase() {
        if (agentRepository.count() == 0) {
            agentRepository.save(new Agent("Bruce Wayne", "bruce@wayneenterprises.com", "ACTIVE"));
            agentRepository.save(new Agent("Lucius Fox", "lucius@wayneenterprises.com", "OFFLINE"));
            agentRepository.save(new Agent("Diana Prince", "diana@themyscira.gov", "ACTIVE"));
        }
    }

    @GetMapping
    public ResponseEntity<List<Agent>> getAgents() {
        return ResponseEntity.ok(agentRepository.findAll());
    }
}