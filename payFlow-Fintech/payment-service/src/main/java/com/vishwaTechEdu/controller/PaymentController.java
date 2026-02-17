package com.vishwaTechEdu.controller;

import com.vishwaTechEdu.dto.MerchantPaymentRequest;
import com.vishwaTechEdu.dto.PaymentRequest;
import com.vishwaTechEdu.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
@RestController
@RequestMapping("/api/v1/payment")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    // 🔐 USER → USER
    @PostMapping("/p2p")
    @ResponseStatus(HttpStatus.CREATED)
    public String p2pPayment(@RequestHeader("userId") Long userId,
                             @RequestHeader("Idempotency-Key") String key,
                             @RequestBody PaymentRequest req) {

        return service.p2pPayment(userId, req, key);
    }

    // 🔐 USER → MERCHANT
    @PostMapping("/merchant")
    @ResponseStatus(HttpStatus.CREATED)
    public String merchantPayment(@RequestHeader("userId") Long userId,
                                  @RequestHeader("role") String role,
                                  @RequestHeader("Idempotency-Key") String key,
                                  @RequestBody MerchantPaymentRequest req) {

        return service.merchantPayment(userId, role, req, key);
    }


    // 🔐 ADMIN ONLY
    @GetMapping("/merchant/settlement/{walletId}")
    public BigDecimal merchantSettlement(
            @RequestHeader("role") String role,
            @PathVariable("walletId") Long walletId) {

        return service.merchantSettlement(role, walletId);
    }







}
