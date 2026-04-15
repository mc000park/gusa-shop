package com.gusa.apex.domain.user.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String userId;

    @Column(nullable = false)
    private String password;

    private String userName;

    private String email;

    @Column(unique = true)
    private String phoneNumber;

    private String zipCode;

    private String address;

    private String addressDetail;

    private String role;

    private String grade;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private boolean enabled = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Builder
    public User(String userId, String password, String userName, String email,
                String phoneNumber, String zipCode, String address, String addressDetail,
                String role, String grade) {
        this.userId = userId;
        this.password = password;
        this.userName = userName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.zipCode = zipCode;
        this.address = address;
        this.addressDetail = addressDetail;
        this.role = role;
        this.grade = grade;
        this.enabled = true;
    }

    public void update(String userName, String email, String phoneNumber, String grade, boolean enabled) {
        this.userName = userName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.grade = grade;
        this.enabled = enabled;
    }

    public void updateProfile(String userName, String email, String phoneNumber,
                              String zipCode, String address, String addressDetail) {
        this.userName      = userName;
        this.email         = email;
        this.phoneNumber   = phoneNumber;
        this.zipCode       = zipCode;
        this.address       = address;
        this.addressDetail = addressDetail;
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
}
