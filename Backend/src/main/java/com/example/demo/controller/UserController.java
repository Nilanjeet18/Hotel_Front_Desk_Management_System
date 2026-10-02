package com.example.demo.controller;

import com.example.demo.model.Users;
import com.example.demo.repository.UsersRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ────────────────────────────────────────────────────────────
    // REGISTER — ADMIN ONLY (creates Receptionist / Manager / Admin)
    // ────────────────────────────────────────────────────────────
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody Users user) {

        if (usersRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (!user.getRole().startsWith("ROLE_")) {
            user.setRole("ROLE_" + user.getRole().toUpperCase());
        }
        Users saved = usersRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("userId", saved.getId());
        response.put("username", saved.getUsername());
        response.put("role", saved.getRole().replace("ROLE_", ""));
        return ResponseEntity.ok(response);
    }

    // ────────────────────────────────────────────────────────────
    // LOGIN — public
    // ────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Users loginUser) {
        Users user = usersRepository
                .findByUsername(loginUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(loginUser.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        String cleanRole = user.getRole().replace("ROLE_", "");

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", cleanRole);
        response.put("username", user.getUsername());
        response.put("customerId", user.getId());
        response.put("userId", user.getId());
        return ResponseEntity.ok(response);
    }

    // ────────────────────────────────────────────────────────────
    // GET ALL USERS — ADMIN ONLY
    // ────────────────────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Users> getAllUsers() {
        return usersRepository.findAll();
    }

    // ────────────────────────────────────────────────────────────
    // GET ONE USER — ADMIN ONLY
    // ────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Users> getUserById(@PathVariable int id) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return ResponseEntity.ok(user);
    }

    // ────────────────────────────────────────────────────────────
    // UPDATE USER — ADMIN ONLY (username / role, password optional)
    // ────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateUser(@PathVariable int id, @RequestBody Users updatedUser,
                                                            Authentication authentication) {
        Users existing = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        if (existing.getUsername().equals(authentication.getName())) {
            throw new RuntimeException("You cannot edit your own account from here.");
        }

        if (updatedUser.getUsername() != null && !updatedUser.getUsername().isBlank()) {
            existing.setUsername(updatedUser.getUsername());
        }

        if (updatedUser.getRole() != null && !updatedUser.getRole().isBlank()) {
            String role = updatedUser.getRole().startsWith("ROLE_")
                    ? updatedUser.getRole()
                    : "ROLE_" + updatedUser.getRole().toUpperCase();
            existing.setRole(role);
        }

        // Password only updated if a new one is actually sent
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        Users saved = usersRepository.save(existing);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User updated successfully");
        response.put("userId", saved.getId());
        response.put("username", saved.getUsername());
        response.put("role", saved.getRole().replace("ROLE_", ""));
        return ResponseEntity.ok(response);
    }

    // ────────────────────────────────────────────────────────────
    // DELETE USER — ADMIN ONLY
    // ────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable int id, Authentication authentication) {
        Users target = usersRepository.findById(id)
                .orElse(null);
        if (target == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found: " + id);
        }
        if (target.getUsername().equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You cannot delete your own account.");
        }
        usersRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}