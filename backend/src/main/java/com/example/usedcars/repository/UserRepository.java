package com.example.usedcars.repository;

import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.Role;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<AppUser, Long> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    Optional<AppUser> findByUsername(String username);
    Optional<AppUser> findByActiveSessionTokenHash(String activeSessionTokenHash);
    List<AppUser> findByRole(Role role);
    long countByRole(Role role);
}
