package com.example.cryptotracker.controller;

import com.example.cryptotracker.model.User;
import com.example.cryptotracker.repository.UserRepository;
import com.example.cryptotracker.security.JwtUtil;
import com.example.cryptotracker.dto.AuthRequest;
import com.example.cryptotracker.dto.AuthResponse;
import com.example.cryptotracker.dto.RegisterRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil){
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req){
        Optional<User> exists = userRepo.findByUsername(req.getUsername());
        if(exists.isPresent()) return ResponseEntity.badRequest().body(java.util.Map.of("error","username_taken"));
        if(req.getPassword()==null || req.getPassword().length()<6) return ResponseEntity.badRequest().body(java.util.Map.of("error","password_too_short"));
        User u = new User();
        u.setUsername(req.getUsername());
        u.setEmail(req.getEmail());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        u.setRole("USER");
        userRepo.save(u);
        return ResponseEntity.ok(java.util.Map.of("message","registered","username",u.getUsername()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req){
        Optional<User> userOpt = userRepo.findByUsername(req.getUsername());
        if(userOpt.isEmpty()) return ResponseEntity.status(401).body(java.util.Map.of("error","invalid_credentials"));
        User u = userOpt.get();
        if(!passwordEncoder.matches(req.getPassword(), u.getPasswordHash())) return ResponseEntity.status(401).body(java.util.Map.of("error","invalid_credentials"));
        String token = jwtUtil.generateToken(u.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, u.getUsername(), u.getEmail(), u.getRole()));
    }

}
