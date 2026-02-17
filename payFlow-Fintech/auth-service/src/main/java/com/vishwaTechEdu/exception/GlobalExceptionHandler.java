package com.vishwaTechEdu.exception;



import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public Map<String,String> handle(CustomException e) {
        return Map.of("error", e.getMessage());
    }
}

