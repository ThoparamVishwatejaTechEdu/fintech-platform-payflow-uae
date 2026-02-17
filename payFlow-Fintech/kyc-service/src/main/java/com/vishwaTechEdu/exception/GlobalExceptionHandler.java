package com.vishwaTechEdu.exception;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(KycException.class)
    public Map<String,String> handle(KycException e) {
        return Map.of("error", e.getMessage());
    }
}


