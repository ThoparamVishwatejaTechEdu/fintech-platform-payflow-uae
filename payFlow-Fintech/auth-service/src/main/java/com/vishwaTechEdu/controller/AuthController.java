package com.vishwaTechEdu.controller;

import com.vishwaTechEdu.dto.AuthResponse;
import com.vishwaTechEdu.dto.LoginRequest;
import com.vishwaTechEdu.dto.RegisterRequest;
import com.vishwaTechEdu.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public void register(@RequestBody RegisterRequest req) {
        service.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req) {
        return service.login(req);
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {
        return service.forgotPassword(email);
    }


    @PostMapping("/reset-password")
    public String resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {

        service.resetPassword(token, newPassword);
        return "Password updated";
    }



}
