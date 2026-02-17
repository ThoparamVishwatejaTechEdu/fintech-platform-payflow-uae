package com.vishwaTechEdu.exception;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PaymentException.class)
    public Map<String,String> handle(PaymentException e) {
        return Map.of("error", e.getMessage());
    }
}

