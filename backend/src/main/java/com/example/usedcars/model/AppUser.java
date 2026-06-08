package com.example.usedcars.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column
    private String name;

    @Column(unique = true)
    private String phoneNumber;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(unique = true)
    @JsonIgnore
    private String activeSessionTokenHash;

    @JsonIgnore
    private LocalDateTime activeSessionExpiresAt;

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getActiveSessionTokenHash() { return activeSessionTokenHash; }
    public void setActiveSessionTokenHash(String activeSessionTokenHash) { this.activeSessionTokenHash = activeSessionTokenHash; }
    public LocalDateTime getActiveSessionExpiresAt() { return activeSessionExpiresAt; }
    public void setActiveSessionExpiresAt(LocalDateTime activeSessionExpiresAt) { this.activeSessionExpiresAt = activeSessionExpiresAt; }
}
