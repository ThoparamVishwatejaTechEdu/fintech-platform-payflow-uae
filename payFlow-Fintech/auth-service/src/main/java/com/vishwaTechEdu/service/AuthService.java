package com.vishwaTechEdu.service;

import com.vishwaTechEdu.dto.AuthResponse;
import com.vishwaTechEdu.dto.LoginRequest;
import com.vishwaTechEdu.dto.RegisterRequest;
import com.vishwaTechEdu.entity.PasswordResetToken;
import com.vishwaTechEdu.entity.User;
import com.vishwaTechEdu.entity.UserRole;
import com.vishwaTechEdu.entity.UserStatus;
import com.vishwaTechEdu.exception.CustomException;
import com.vishwaTechEdu.repo.PasswordResetTokenRepository;
import com.vishwaTechEdu.repo.UserRepository;

import com.vishwaTechEdu.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository repo;
    private final JwtUtil jwt;
    private final BCryptPasswordEncoder encoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    public AuthService(UserRepository repo,
                       JwtUtil jwt,
                       BCryptPasswordEncoder encoder) {
        this.repo = repo;
        this.jwt = jwt;
        this.encoder = encoder;
    }

    public void register(RegisterRequest req) {

        if (repo.findByEmail(req.getEmail()).isPresent()) {
            throw new CustomException("User already exists with this email");
        }

        // 🚨 BLOCK ADMIN REGISTRATION
        if ("ADMIN".equalsIgnoreCase(req.getRole())) {
            throw new CustomException(
                    "Admin account cannot be created from registration. Please contact system administrator."
            );
        }

        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setRole(UserRole.valueOf(req.getRole()));
        user.setStatus(UserStatus.ACTIVE);

        repo.save(user);
    }


    public AuthResponse login(LoginRequest req) {

        User user = repo.findByEmail(req.getEmail())
                .orElseThrow(() -> new CustomException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new CustomException("User account is not active");
        }

        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new CustomException("Invalid password");
        }

        String token = jwt.generate(user);

        return new AuthResponse(
                token,
                user.getId(),
                user.getRole().name()
        );
    }


    public String forgotPassword(String email) {

        return userRepository.findByEmail(email)
                .map(user -> {

                    passwordResetTokenRepository
                            .findByEmail(email)
                            .ifPresent(passwordResetTokenRepository::delete);

                    String token = UUID.randomUUID().toString();

                    PasswordResetToken reset = new PasswordResetToken();
                    reset.setEmail(email);
                    reset.setToken(token);
                    reset.setExpiryDate(LocalDateTime.now().plusMinutes(15));

                    passwordResetTokenRepository.save(reset);

                    // return link directly
                    return "http://localhost:3000/reset-password?token=" + token;
                })
                .orElse("If account exists, reset link sent");
    }




    public void resetPassword(String token, String newPassword) {

        PasswordResetToken reset =
                passwordResetTokenRepository.findByToken(token)
                        .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (reset.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = userRepository.findByEmail(reset.getEmail())
                .orElseThrow();

        user.setPassword(encoder.encode(newPassword));

        userRepository.save(user);

        passwordResetTokenRepository.delete(reset);
    }




}
